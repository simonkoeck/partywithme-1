import { isCuid } from 'cuid';
import { Router } from 'express';
import { accessControlMiddleware } from '@pwm/accessControl';
import me from '../controller/users/me';
import changeMe from '../controller/users/change-me';
import search from '../controller/users/search';
import getUserController from '../controller/users/get-user';
import checkValidationError from '../middleware/validation';
import { param } from 'express-validator';
import { user } from '@pwm/db';
import checkUsername from '../controller/users/check-username';
const router = Router();

router.post('/check-username', checkUsername);

router.use(accessControlMiddleware);

router.get('/', search);
router.get('/me', me);
router.post('/me', changeMe);

router.use(
  '/:id',
  param('id').custom(async (v) => {
    if (!isCuid(v)) throw Error('User Id is not a valid id!');
    if ((await user.count({ where: { id: v } })) == 0)
      throw Error('No user with this id exists.');
    return true;
  }),
  checkValidationError
);
router.get('/:id', getUserController);

export default router;
