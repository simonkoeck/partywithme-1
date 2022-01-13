import { Request, Response } from 'express';
import { user } from '@pwm/db';

const getUserController = async (req: Request, res: Response) => {
  const u = await user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      participations: {
        where: {
          party: {
            participations: {
              some: {
                user_id: req.user.id,
              },
            },
          },
        },
        include: {
          party: true,
        },
      },
      friends: {
        where: {
          friend_id: req.user.id,
        },
        select: {
          id: true,
        },
      },
      incoming_friendrequests: {
        where: {
          from_id: req.user.id,
        },
        select: {
          id: true,
        },
      },
      outgoing_friendrequests: {
        where: {
          to_id: req.user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });
  //   if (!u) return res.status(404).json({ error: 'USER_NOT_FOUND' });

  //   const sameParties = await Party.find({
  //     $and: [
  //       { participants: { $in: [user._id] } },
  //       { participants: { $in: [req.user.id] } },
  //     ],
  //     // Filter by active parties
  //     end_time: { $gt: new Date() },
  //   })
  //     .populate('participants', '_id username')
  //     .populate('creator', '_id username')
  //     .lean();

  //   var friendship = '';

  //   const areFriends = (
  //     await User.findById(req.params.id).select('friends').lean()
  //   )?.friends.findIndex((v) => v == req.user.id);

  //   if ((areFriends ?? -1) > -1) {
  //     friendship = 'FRIENDS';
  //   } else {
  //     const friendRequest = await FriendRequest.findOne({
  //       $or: [
  //         {
  //           $and: [{ from: req.user.id }, { to: req.params.id }],
  //         },
  //         {
  //           $and: [{ from: req.params.id }, { to: req.user.id }],
  //         },
  //       ],
  //     });
  //     if (friendRequest != null) {
  //       if (friendRequest.from == req.user.id) {
  //         friendship = 'OUTGOING_FRIENDREQUEST';
  //       } else if (friendRequest.from == req.params.id) {
  //         friendship = 'INCOMING_FRIENDREQUEST';
  //       }
  //     }
  //   }

  let friendship = '';
  if (u.friends.length == 1) {
    friendship = 'FRIENDS';
  } else if (u.incoming_friendrequests.length == 1) {
    friendship = 'OUTGOING_FRIENDREQUEST';
  } else if (u.outgoing_friendrequests.length == 1) {
    friendship = 'ICOMING_FRIENDREQUEST';
  }

  delete u.friends;
  delete u.incoming_friendrequests;
  delete u.outgoing_friendrequests;

  res.status(200).json({ user: u, sameParties: [], friendship: friendship });
};

export default getUserController;
