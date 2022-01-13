import checkValidationError from './../../middleware/validation';
import { Request, Response } from 'express';
import { user } from '@pwm/db';
import { body } from 'express-validator';

const verify = async (req: Request, res: Response) => {
  const u = await user.findFirst({
    where: {
      verification_token: req.body.verification_token,
    },
  });
  if (!u)
    return res.status(403).json({ error: 'VERIFICATION_TOKEN_NOT_FOUND' });
  // If token found, activate user
  await user.update({
    data: {
      verification_token: null,
      verified: true,
    },
    where: { id: u.id },
  });
  res.status(200).json({ success: true });
};

export default [
  body('verification_token').notEmpty().trim(),
  checkValidationError,
  verify,
];
