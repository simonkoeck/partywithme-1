import { friendRequest } from '@pwm/db';
import { Request, Response } from 'express';

const declineFriend = async (req: Request, res: Response) => {
  const r = await friendRequest.deleteMany({
    where: {
      from_id: req.params.userId,
      to_id: req.user.id,
    },
  });
  if (r.count == 0)
    return res.status(404).json({ error: 'FRIEND_REQUEST_NOT_FOUND' });
  return res.status(202).json({});
};

export default declineFriend;
