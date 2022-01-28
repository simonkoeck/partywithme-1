import { friendRequest } from '@pwm/db';
import { Request, Response } from 'express';

const fetchFriendRequets = async (req: Request, res: Response) => {
  const frs = await friendRequest.findMany({
    where: {
      to_id: req.user.id,
    },
    select: {
      from: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  res.status(200).json({
    friend_requests: frs.map((f) => {
      return f.from;
    }),
  });
};

export default fetchFriendRequets;
