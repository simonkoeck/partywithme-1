import { Request, Response } from 'express';
import { user, friendRequest, Friendship } from '@pwm/db';
import { sendToQueue } from '@pwm/queue';

const addFriend = async (req: Request, res: Response) => {
  try {
    if (req.user.id == req.params.userId)
      return res.status(403).json({ error: 'CANNOT_ADD_YOURSELF' });
    const u = await user.findUnique({
      where: { id: req.user.id },
      include: {
        friends: true,
      },
    });
    if (!u) res.status(403).json({ error: 'USER_NOT_FOUND' });
    if (
      u.friends.findIndex(
        (friendship: Friendship) => friendship.friend_id == req.params.userId
      ) > -1
    )
      return res.status(403).json({ error: 'ALREADY_FRIENDS' });

    const existing = await friendRequest.count({
      where: {
        from_id: req.user.id,
        to_id: req.params.userId,
      },
    });
    if (existing > 0) return res.status(403).json({ error: 'ALREADY_ADDED' });

    await friendRequest.create({
      data: {
        from_id: req.user.id,
        to_id: req.params.userId,
      },
    });
    res.status(202).end();
    sendToQueue('notifications', {
      action: 'ADDED_AS_FRIEND',
      data: {},
      sender: req.user,
      recipients: [
        await user.findUnique({
          where: { id: req.params.userId },
        }),
      ],
    });
  } catch (e) {
    console.error(e);
  }
};

export default addFriend;
