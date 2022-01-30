import {
  chatMessage,
  chatMessageReadConfirmation,
  conversation,
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
const app = express();

app.post('/send_message', accessControlMiddleware, (req, res) => {
  res.status(200).json({ success: true });
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
}

io.on('connection', (client) => {
  const state: IState = {
    authenticated: false,
    user: null,
    reset_authentication_timeout: null,
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
          break;
        }
        break;
      default:
        ack({ success: false, error: 'INVALID_AUTH_TYPE' });
        break;
    }

    state.user = await user.findUnique({
      where: { id: u.id },
    });

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
    const conversations = await conversation.findMany({
      select: {
        id: true,
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

    conversations.forEach((c) => {
      client.join(PREFIX + c.id);
    });
  });

  client.on('send_message', async (data, ack) => {
    if (!state.authenticated) return;
    if (!client.rooms.has(PREFIX + data.conversation)) {
      return ack({ success: false, error: 'NOT_IN_CONVERSATION' });
    }

    const message = await chatMessage.create({
      data: {
        conversation_id: data.conversation,
        type: data.type,
        content: data.content,
        sender_id: state.user.id,
        read_confirmations: {
          create: {
            user_id: state.user.id,
          },
        },
      },
      select: {
        id: true,
        content: true,
        type: true,
        created_at: true,
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

    io.to(PREFIX + data.conversation).emit('message_received', {
      conversation: data.conversation,
      message,
    });

    // Send notification

    const recipients: any = [];
    const c = await conversation.findUnique({
      where: { id: data.conversation },
      select: {
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
        if (p.user.id == state.user.id) return;
        recipients.push(p.user);
      });
    } else if (c.friendship != null) {
      recipients.push(
        c.friendship.friend.id == state.user.id
          ? c.friendship.user
          : c.friendship.friend
      );
    }

    const conversationName =
      c.party != null
        ? c.party.name
        : c.friendship.user.id == state.user.id
        ? c.friendship.friend.username
        : c.friendship.user.username;

    sendToQueue('notifications', {
      action: 'MESSAGE_RECEIVED',
      data: {
        conversation_id: data.conversation,
        message,
        conversation_name: conversationName,
      },
      recipients: recipients,
      sender: state.user,
    });
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
