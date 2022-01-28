import { Request, Response } from 'express';
import { conversation, friendship, user } from '@pwm/db';
import { sendToQueue } from '@pwm/queue';

const deleteFriend = async (req: Request, res: Response) => {
  const f1 = await friendship.findFirst({
    where: {
      user_id: req.user.id,
      friend_id: req.params.userId,
    },
    select: { id: true },
  });
  const f2 = await friendship.findFirst({
    where: {
      friend_id: req.user.id,
      user_id: req.params.userId,
    },
    select: { id: true },
  });
  console.log(f1);
  console.log(f2);

  sendToQueue('chat', {
    action: 'ADD_TO_CONVERSATION',
    data: {
      conversation: await conversation.findFirst({
        where: {
          OR: [
            {
              friendship_id: f1.id,
            },
            {
              friendship_id: f2.id,
            },
          ],
        },
      }),
    },
    recipients: [
      req.user,
      await user.findUnique({ where: { id: req.params.userId } }),
    ],
  });

  const fr1 = await friendship.deleteMany({
    where: {
      user_id: req.user.id,
      friend_id: req.params.userId,
    },
  });
  if (fr1.count == 0) return res.status(403).json({ error: 'NO_FRIENDS' });

  const fr2 = await friendship.deleteMany({
    where: {
      user_id: req.params.userId,
      friend_id: req.user.id,
    },
  });
  if (fr2.count == 0) return res.status(403).json({ error: 'NO_FRIENDS' });

  return res.status(200).json({ success: true });
};

export default deleteFriend;
