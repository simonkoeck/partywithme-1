import { client } from '@pwm/db';
import { Request, Response } from 'express';

const MAX_DISTANCE_IN_KM = 20;

const fetchParties = async (req: Request, res: Response) => {
  const [lat, lng] = req.query.location.toString().split(',').map(Number);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parties: any =
    await client.$queryRaw`SELECT p.id, p.name, p.scope, p.description, p.latitude, p.longitude, p.starts_at, p.ends_at
                          , u.id as creator_id, u.username as creator_username
                          , CASE WHEN (SELECT id FROM PartyParticipation WHERE party_id=p.id AND user_id=${
                            req.user.id
                          }) is null THEN False ELSE True END AS is_participating
                      FROM Party p
                      INNER JOIN User u on u.id=creator_id
                      WHERE (
                      (p.scope='PUBLIC' and 111.111 *
                            DEGREES(ACOS(LEAST(1.0, COS(RADIANS(p.latitude))
                                * COS(RADIANS(${lat}))
                                * COS(RADIANS(p.longitude - ${lng}))
                                + SIN(RADIANS(p.latitude))
                                * SIN(RADIANS(${lat}))))) < ${MAX_DISTANCE_IN_KM}) 
                      or (p.creator_id=${req.user.id})
                      or
                      (
                        p.scope='FRIENDS'
                        and
                        p.creator_id IN (SELECT friend_id FROM Friendship WHERE user_id=${
                          req.user.id
                        })
                      )
                      ) and p.ends_at>${new Date()}
                      ;`;

  parties = parties.map((p) => {
    p.creator = {
      id: p.creator_id,
      username: p.creator_username,
    };
    p.is_participating = p.is_participating == 1;
    delete p.creator_id;
    delete p.creator_username;
    return p;
  });

  // const parties = await party.findMany({
  //   where: {
  //     OR: [
  //       { scope: 'PUBLIC', latitude: {} },
  //       { creator_id: req.user.id },
  //       {
  //         AND: [
  //           { scope: 'FRIENDS' },
  //           {
  //             creator: {
  //               friends: {
  //                 some: {
  //                   friend_id: req.user.id,
  //                 },
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     scope: true,
  //     description: true,
  //     latitude: true,
  //     longitude: true,
  //     starts_at: true,
  //     ends_at: true,
  //     creator: {
  //       select: {
  //         id: true,
  //         username: true,
  //       },
  //     },
  //   },
  // });

  res.status(200).json({ parties });
};

export default fetchParties;
