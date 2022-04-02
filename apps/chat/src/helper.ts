import { User, Conversation, conversation } from '@pwm/db';
export async function fetchUserConversations(u: User): Promise<Conversation[]> {
  return await conversation.findMany({
    select: {
      id: true,
      friendship_id: true,
      party_id: true,
    },
    where: {
      OR: [
        {
          party: {
            participations: {
              some: {
                user_id: u.id,
              },
            },
          },
        },
        {
          friendship: {
            OR: [
              {
                friend_id: u.id,
              },
              {
                user_id: u.id,
              },
            ],
          },
        },
      ],
    },
  });
}
