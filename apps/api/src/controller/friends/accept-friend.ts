import { conversation, friendRequest, friendship } from '@pwm/db';
import { Request, Response } from 'express';
import { sendToQueue } from '@pwm/queue';

const acceptFriendController = async (req: Request, res: Response) => {
  const fr = await friendRequest.findFirst({
    where: {
      from_id: req.params.userId,
      to_id: req.user.id,
    },
    include: {
      from: true,
      to: true,
    },
  });
  if (fr == null)
    return res.status(404).json({ error: 'FRIEND_REQUEST_NOT_FOUND' });
  // Delete friend request
  await friendRequest.delete({ where: { id: fr.id } });

  const f1 = await friendship.create({
    data: {
      user_id: req.user.id,
      friend_id: req.params.userId,
    },
  });
  const f2 = await friendship.create({
    data: {
      user_id: req.params.userId,
      friend_id: req.user.id,
    },
  });

  res.status(202).json({});

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
    recipients: [fr.from, fr.to],
  });
  sendToQueue('notifications', {
    action: 'ACCEPTED_FRIEND_REQUEST',
    data: {},
    sender: fr.to,
    recipients: [fr.from],
  });
};

export default acceptFriendController;
