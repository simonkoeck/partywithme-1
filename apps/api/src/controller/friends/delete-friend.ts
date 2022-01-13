import { Request, Response } from 'express';
import { friendRequest, friendship } from '@pwm/db';

const deleteFriend = async (req: Request, res: Response) => {
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
