import { user } from '@pwm/db';
import { accessControlMiddleware } from '@pwm/accessControl';
import { Router } from 'express';
import { param } from 'express-validator';
import { isCuid } from 'cuid';
import checkValidationError from '../middleware/validation';
import addFriend from '../controller/friends/add-friend';
import acceptFriendController from '../controller/friends/accept-friend';
import fetchFriends from '../controller/friends/fetch-friends';
import fetchFriendRequests from '../controller/friends/fetch-friend-requests';
import declineFriend from '../controller/friends/decline-friend';
import deleteFriend from '../controller/friends/delete-friend';

const router = Router();

router.use(accessControlMiddleware);

router.get('/', fetchFriends);
router.get('/requests', fetchFriendRequests);

router.use(
  '/:userId',
  param('userId').custom(async (v) => {
    if (!isCuid(v)) throw Error('User Id is not a valid id!');
    if ((await user.count({ where: { id: v } })) == 0)
      throw Error('No user with this id exists.');
    return true;
  }),
  checkValidationError
);

router.post('/:userId/add', addFriend);
router.post('/:userId/accept', acceptFriendController);
router.post('/:userId/decline', declineFriend);
router.post('/:userId/delete', deleteFriend);

export default router;
