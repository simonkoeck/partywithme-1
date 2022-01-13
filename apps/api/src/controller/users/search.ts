import { Request, Response } from 'express';
import { user } from '@pwm/db';
import { query } from 'express-validator';
import checkValidationError from '../../middleware/validation';

const searchUsersController = async (req: Request, res: Response) => {
  const query = (req.query.query || '').toString();

  const users = await user.findMany({
    where: {
      AND: [
        {
          NOT: {
            id: req.user.id,
          },
        },
        {
          username: {
            contains: query,
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      friends: {
        select: {
          friend_id: true,
        },
        where: {
          friend_id: req.user.id,
        },
      },
      outgoing_friendrequests: {
        select: {
          to_id: true,
        },
        where: {
          to_id: req.user.id,
        },
      },
      incoming_friendrequests: {
        select: {
          from_id: true,
        },
        where: {
          from_id: req.user.id,
        },
      },
    },
    take: 20,
  });

  const us = [];
  users.forEach((user) => {
    let friendship = '';
    if (user.friends.length == 1) {
      friendship = 'FRIENDS';
    } else if (user.incoming_friendrequests.length == 1) {
      friendship = 'OUTGOING_FRIENDREQUEST';
    } else if (user.outgoing_friendrequests.length == 1) {
      friendship = 'INCOMING_FRIENDREQUEST';
    }
    delete user.friends;
    delete user.incoming_friendrequests;
    delete user.outgoing_friendrequests;
    us.push({ user, friendship });
  });

  res.status(200).json({ users: us });
};

export default [
  query('query').isString(),
  checkValidationError,
  searchUsersController,
];
