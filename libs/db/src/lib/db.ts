import { loadConfig } from '@partywithme/config-loader';
import { PrismaClient } from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';

export const client = new PrismaClient();

const cdnConf = loadConfig<'cdn'>('cdn');

// Conversation
client.$use(async (params, next) => {
  if (params.action == 'create' && params.model == 'Party') {
    const result = await next(params);
    await client.conversation.create({
      data: { party_id: result.id },
    });
    return result;
  } else if (params.action == 'create' && params.model == 'Friendship') {
    const result = await next(params);
    const count = await client.friendship.count({
      where: { friend_id: result.user_id, user_id: result.friend_id },
    });
    if (count > 0) return result;

    await client.conversation.create({
      data: { friendship_id: result.id },
    });
    return result;
  } else if (params.action == 'deleteMany' && params.model == 'ChatMessage') {
    // Delete corresponding chat image
    const m = await chatMessage.findUnique({
      where: { id: params.args.where.id },
    });
    if (m.type == 'IMAGE') {
      // Remove image from uploads
      if (
        existsSync(
          cdnConf.chat_images_folder + '/' + m.content + '-original.jpg'
        )
      ) {
        unlinkSync(
          cdnConf.chat_images_folder + '/' + m.content + '-original.jpg'
        );
        unlinkSync(
          cdnConf.chat_images_folder + '/' + m.content + '-preview.jpg'
        );
      }
    }
  }
  const result = await next(params);
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
