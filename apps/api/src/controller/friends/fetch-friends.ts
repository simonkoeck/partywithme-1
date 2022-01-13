import { user } from '@pwm/db';
import { Request, Response } from 'express';

const fetchFriends = async (req: Request, res: Response) => {
  const u = await user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      friends: {
        select: {
          friend: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  const friends = u.friends.map((f) => {
    return f.friend;
  });

  res.status(200).json({ friends });
};

export default fetchFriends;
