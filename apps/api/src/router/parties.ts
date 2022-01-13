import { isCuid } from 'cuid';
import { accessControlMiddleware } from '@pwm/accessControl';
import { Router } from 'express';
import { param } from 'express-validator';
import createParty from '../controller/parties/create-party';
import fetchParties from '../controller/parties/fetch-parties';
import checkValidationError from '../middleware/validation';
import { party, user } from '@pwm/db';
import getPartyController from '../controller/parties/get-party';
import partyActions from '../controller/parties/party-actions';
import editParty from '../controller/parties/edit-party';
const router = Router();

router.use(accessControlMiddleware);

router.get('/', fetchParties);
router.post('/create', createParty);
router.use(
  '/:partyId',
  param('partyId').custom(async (v) => {
    if (!isCuid(v)) throw Error('Party Id is not a valid id!');
    return true;
  }),
  checkValidationError
);

router.use('/:partyId', async (req, res, next) => {
  const p = await party.findFirst({
    where: {
      id: req.params.partyId,
    },
    select: {
      id: true,
      name: true,
      starts_at: true,
      ends_at: true,
      description: true,
      scope: true,
      latitude: true,
      longitude: true,
      creator_id: true,
      created_at: true,
      updated_at: true,
      creator: {
        select: {
          id: true,
          username: true,
          friends: {
            select: {
              friend_id: true,
            },
          },
        },
      },
      participations: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (p == null) {
    res.status(404).json({ error: 'PARTY_NOT_FOUND' });
  } else {
    if (p.creator.id != req.user.id) {
      // Access Control
      if (p.scope == 'FRIENDS') {
        // If not in friends
        if (
          p.creator.friends.findIndex((v) => v.friend_id == req.user.id) == -1
        ) {
          return res.status(403).json({ error: 'NO_ACCESS' });
        }
      } else if (p.scope == 'WHITELIST') {
        // TODO: Implement whitelist
        // if (party.whitelist.findIndex((v) => v == req.user.id) == -1) {
        //   return res.status(403).json({ error: 'NO_ACCESS' });
        // }
      }
    }

    delete p.creator.friends;
    // delete p.whitelist;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    p.participations = p.participations.map((p) => p.user);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    req.party = p;

    req.party.is_participating =
      req.party.participations.findIndex((r) => r.id == req.user.id) > -1;

    next();
  }
});
router.get('/:partyId', getPartyController);
router.post('/:partyId/action', partyActions);
router.post('/:partyId/edit', editParty);

export default router;
