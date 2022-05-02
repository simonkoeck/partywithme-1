import { PrismaClient } from '@prisma/client';

export const client = new PrismaClient();

// Conversation
client.$use(async (params, next) => {
  const result = await next(params);
  if (params.action == 'create' && params.model == 'Party') {
    await client.conversation.create({
      data: { party_id: result.id },
    });
  } else if (params.action == 'create' && params.model == 'Friendship') {
    const count = await client.friendship.count({
      where: { friend_id: result.user_id, user_id: result.friend_id },
    });
    if (count > 0) return result;

    await client.conversation.create({
      data: { friendship_id: result.id },
    });
  }
  return result;
});

export const user = client.user;
export const party = client.party;
export const passwordReset = client.passwordReset;
export const friendRequest = client.friendRequest;
export const friendship = client.friendship;
export const partyParticipation = client.partyParticipation;
export const chatMessage = client.chatMessage;
export const conversation = client.conversation;
export const chatMessageReadConfirmation = client.chatMessageReadConfirmation;
export const conversationMute = client.conversationMute;
export const report = client.report;
export const ban = client.ban;

export * from '.prisma/client';
