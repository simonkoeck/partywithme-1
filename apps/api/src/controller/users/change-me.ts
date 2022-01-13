import checkValidationError, { prefabs } from './../../middleware/validation';
import { Request, Response } from 'express';
import { user } from '@pwm/db';
import { body } from 'express-validator';

const changeMe = async (req: Request, res: Response) => {
  const username = req.body.username;
  const locale = req.body.locale;

  await user.update({ data: { username, locale }, where: { id: req.user.id } });
  res.status(202).json({});
};

export default [
  prefabs(body('username'), 'USERNAME')?.optional(),
  body('locale').isString().isLocale().optional(),
  checkValidationError,
  changeMe,
];
