/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  chatMessage,
  chatMessageReadConfirmation,
  conversation,
  conversationMute,
  partyPublic,
  user,
  User,
  userPublic,
} from '@pwm/db';
import { env } from '@pwm/env';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import {
  accessControlMiddleware,
  accessWithAccessToken,
} from '@pwm/accessControl';
import { consume, sendToQueue } from '@pwm/queue';
import * as express from 'express';
import { fetchUserConversations } from './helper';
import { getActiveBans } from '@partywithme/bans';
const app = express();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

async function sendMessage(
  conversationId: string,
  type: 'TEXT',
  content: string,
  sender: User,
  replyTo: string | null
) {
  const message = await chatMessage.create({
    data: {
      conversation_id: conversationId,
      type: type,
      content: content,
      sender_id: sender.id,
      read_confirmations: {
        create: {
          user_id: sender.id,
        },
      },
      reply_to_id: replyTo,
    },
    select: {
      id: true,
      content: true,
      type: true,
      created_at: true,
      reply_to_id: true,
      read_confirmations: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  io.to(PREFIX + conversationId).emit('message_received', {
    conversation: conversationId,
    message,
  });

  // Send notification

  const recipients: any = [];
  const c = await conversation.findUnique({
    where: { id: conversationId },
    select: {
      mutes: {
        select: {
          user_id: true,
        },
      },
      friendship: {
        select: {
          user: {
            select: {
              onesignal_external_user_id: true,
              id: true,
              username: true,
            },
          },
          friend: {
            select: {
              onesignal_external_user_id: true,
              id: true,
              username: true,
            },
          },
        },
      },
      party: {
        select: {
          name: true,
          creator: {
            select: {
              id: true,
            },
          },
          participations: {
            select: {
              user: {
                select: {
                  onesignal_external_user_id: true,
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (c.party != null) {
    c.party.participations.forEach((p) => {
      if (p.user.id == sender.id) return;
      if (c.mutes.findIndex((m) => m.user_id == p.user.id) != -1) return;
      recipients.push(p.user);
    });
  } else if (c.friendship != null) {
    const u1 =
      c.friendship.friend.id == sender.id
        ? c.friendship.user
        : c.friendship.friend;
    if (c.mutes.findIndex((m) => m.user_id == u1.id) != -1) return;
    recipients.push(u1);
  }

  const conversationName =
    c.party != null
      ? c.party.name
      : c.friendship.user.id == sender.id
      ? c.friendship.user.username
      : c.friendship.friend.username;

  sendToQueue('notifications', {
    action: 'MESSAGE_RECEIVED',
    data: {
      conversation_id: conversationId,
      message,
      conversation_name: conversationName,
      is_group_conversation: c.party != null,
      conversation_icon_user_id:
        c.party != null
          ? c.party.creator.id
          : c.friendship.user.id == sender.id
          ? c.friendship.user.id
          : c.friendship.friend.id,
    },
    recipients: recipients,
    sender,
  });
}

app.use(express.json());

app.post('/send_message', accessControlMiddleware, async (req, res) => {
  const conversation_id = req.body.conversation_id;
  const message = req.body.message;
  const conversations = await fetchUserConversations(req.user);
  if (conversations.findIndex((c) => c.id == conversation_id) > -1) {
    try {
      await sendMessage(
        conversation_id,
        'TEXT',
        message,
        req.user,
        req.body.reply_to || null
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({});
      return;
    }

    res.status(200).json({ success: true });
  } else {
    res.status(403).json({ error: 'NO_CONVERSATION_ACCESS' });
  }
});

config({ path: '.env' });
config({ path: 'apps/chat/.env' });

const server = createServer(app);
const io = new Server(
  server,
  env('NODE_ENV') == 'development'
    ? {
        cors: {
          origin: 'https://amritb.github.io',
        },
      }
    : {}
);

// 1 Minute
const AUTH_TIMEOUT = 1000 * 60 * 10;
const PREFIX = 'conversation:';
const USER_PREFIX = 'user:';

interface IState {
  authenticated: boolean;
  user?: User;
  reset_authentication_timeout?: NodeJS.Timeout;
  isBanned: boolean;
}

io.on('connection', (client) => {
  const state: IState = {
    authenticated: false,
    user: null,
    reset_authentication_timeout: null,
    isBanned: false,
  };

  client.emit('auth_required', { reason: 'INITIAL' });

  client.on('auth', async (data, ack) => {
    let u;
    switch (data.type) {
      case 'Bearer':
        try {
          u = await accessWithAccessToken(data.token);
        } catch (e) {
          ack({ success: false, error: e.name });
          return;
        }
        break;
      default:
        ack({ success: false, error: 'INVALID_AUTH_TYPE' });
        return;
    }

    state.user = await user.findUnique({
      where: { id: u.id },
    });

    const bans = await getActiveBans(u.id);
    if (bans.findIndex((v) => v.restriction == 'NO_CHAT') != -1)
      state.isBanned = true;

    state.authenticated = true;

    state.reset_authentication_timeout = setTimeout(() => {
      state.authenticated = false;
      state.user = null;
      client.rooms.forEach((room) => {
        client.leave(room);
      });
      client.emit('auth_required', { reason: 'AUTH_TIMEOUT' });
    }, AUTH_TIMEOUT);

    client.join(USER_PREFIX + state.user.id);

    ack({ success: true, auth_timeout: AUTH_TIMEOUT });

    // Join conversations
    const conversations = await fetchUserConversations(state.user);

    conversations.forEach((c) => {
      client.join(PREFIX + c.id);
    });
  });

  client.on('send_message', async (data, ack) => {
    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + data.conversation)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    sendMessage(
      data.conversation,
      data.type,
      data.content,
      state.user,
      data.reply_to
    );
  });
  client.on('delete_message', async (data, ack) => {
    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + data.conversationId)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    if (data.messageId == null) {
      return ack({ success: false, error: 'MESSAGE_ID_REQUIRED' });
    }
    const m = await chatMessage.deleteMany({
      where: {
        id: data.messageId,
        sender_id: state.user.id,
        conversation_id: data.conversationId,
      },
    });

    if (m.count > 0) {
      io.to(PREFIX + data.conversationId).emit('message_deleted', {
        conversationId: data.conversationId,
        messageId: data.messageId,
      });
    }
  });

  client.on('get_conversation_mutes', async (data, ack) => {
    if (!state.authenticated) return;
    const mutes = await conversationMute.findMany({
      where: { user_id: state.user.id },
      select: {
        conversation_id: true,
        conversation: true,
      },
    });

    ack({ success: true, mutes });
  });

  client.on('mute_conversation', async (data, ack) => {
    const conversation_id = data.conversation_id;

    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + conversation_id)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    try {
      await conversationMute.create({
        data: {
          conversation_id,
          user_id: state.user.id,
        },
      });
    } catch (e) {
      ack({ success: false, error: 'ALREADY_MUTED' });
      return;
    }

    ack({ success: true });
  });

  client.on('unmute_conversation', async (data, ack) => {
    const conversation_id: string = data.conversation_id;

    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + conversation_id)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    const r = await conversationMute.deleteMany({
      where: {
        conversation_id: conversation_id,
        user_id: state.user.id,
      },
    });
    if (r.count == 0) {
      return ack({ success: false, error: 'NOT_MUTED' });
    }

    ack({ success: true });
  });

  client.on('mark_as_read', async (data, ack) => {
    const conversation_id = data.conversation;

    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + conversation_id)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    const messages = await chatMessage.findMany({
      where: {
        conversation_id: conversation_id,
      },
      select: {
        id: true,
        read_confirmations: { select: { user: { select: { id: true } } } },
      },
    });

    const readConfirmations: any = [];
    messages.forEach((message) => {
      if (
        message.read_confirmations.findIndex(
          (r) => r.user.id == state.user.id
        ) == -1
      ) {
        readConfirmations.push({
          message_id: message.id,
          user_id: state.user.id,
        });
      }
    });
    await chatMessageReadConfirmation.createMany({ data: readConfirmations });

    ack({ success: true });
  });

  client.on('get_messages', async (data, ack) => {
    const conversation_id = data.conversation;

    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + conversation_id)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    const messages = await chatMessage.findMany({
      where: { conversation_id },
      select: {
        id: true,
        conversation: true,
        content: true,
        type: true,
        created_at: true,
        reply_to_id: true,
        read_confirmations: {
          select: {
            user: {
              select: userPublic,
            },
          },
        },
        sender: {
          select: userPublic,
        },
      },
    });
    ack({ messages });

    // Mark as read
    const readConfirmations: any = [];
    messages.forEach((message) => {
      if (
        message.read_confirmations.findIndex(
          (r) => r.user.id == state.user.id
        ) == -1
      ) {
        readConfirmations.push({
          message_id: message.id,
          user_id: state.user.id,
        });
      }
    });
    await chatMessageReadConfirmation.createMany({ data: readConfirmations });
  });

  client.on('get_conversations', async (data, ack) => {
    if (!state.authenticated) return;

    const conversations = await conversation.findMany({
      select: {
        id: true,
        party: {
          select: partyPublic,
        },
        friendship: {
          select: {
            id: true,
            friend: {
              select: userPublic,
            },
            user: {
              select: userPublic,
            },
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            type: true,
            created_at: true,
            reply_to_id: true,
            read_confirmations: {
              select: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      where: {
        OR: [
          {
            party: {
              participations: {
                some: {
                  user_id: state.user.id,
                },
              },
            },
          },
          {
            friendship: {
              OR: [
                {
                  friend_id: state.user.id,
                },
                {
                  user_id: state.user.id,
                },
              ],
            },
          },
        ],
      },
    });

    ack({ conversations });
  });

  client.on('get_rooms', (data, ack) => {
    ack({ rooms: client.rooms });
  });

  client.on('disconnect', () => {
    if (state.reset_authentication_timeout != null)
      clearTimeout(state.reset_authentication_timeout);
  });
});

consume('chat', async (data) => {
  if (data.recipients.length == 0) return;

  if (data.action == 'ADD_TO_CONVERSATION') {
    const c = await conversation.findUnique({
      select: {
        id: true,
        party: {
          select: partyPublic,
        },
        friendship: {
          select: {
            id: true,
            friend: {
              select: userPublic,
            },
            user: {
              select: userPublic,
            },
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            type: true,
            created_at: true,
            reply_to_id: true,
            read_confirmations: {
              select: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      where: {
        id: data.data.conversation.id,
      },
    });
    data.recipients.forEach((u) => {
      io.to(USER_PREFIX + u.id).emit('join_conversation', {
        conversation: c,
      });
      io.to(USER_PREFIX + u.id).socketsJoin(PREFIX + data.data.conversation.id);
    });
  } else if (data.action == 'REMOVE_FROM_CONVERSATION') {
    data.recipients.forEach((u) => {
      io.to(USER_PREFIX + u.id).emit('leave_conversation', {
        conversation: data.data.conversation,
      });
      io.to(USER_PREFIX + u.id).socketsLeave(
        PREFIX + data.data.conversation.id
      );
    });
  }
});

server.listen(env('PORT'), () => {
  console.log('Chat is listening on http://localhost:' + env('PORT'));
});
