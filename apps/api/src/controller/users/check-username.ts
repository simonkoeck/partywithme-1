import { body } from 'express-validator';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { Request, Response } from 'express';
import { user } from '@pwm/db';

const checkUsername = async (req: Request, res: Response) => {
  const u = await user.findUnique({ where: { username: req.body.username } });
  res.status(200).json({ is_valid: u == null });
};

export default [
  prefabs(body('username'), 'USERNAME'),
  checkValidationError,
  checkUsername,
];
