import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { passwordReset, user } from '@pwm/db';
import { comparePasswords, hash } from '../../util/hash';

const resetPassword = async (req: Request, res: Response) => {
  const token = req.body.password_reset_token;
  const password = req.body.password;
  // Search User with this token
  const pwr = await passwordReset.findFirst({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });
  if (!pwr) {
    res.status(403).json({ error: 'TOKEN_NOT_FOUND' });
    return;
  }

  // Check Expiration
  if (pwr.expiration < new Date()) {
    // Delete Token
    await passwordReset.delete({ where: { id: pwr.id } });
    return res.status(403).json({ error: 'TOKEN_EXPIRED' });
  }

  // Check if different password
  const isSamePassword = await comparePasswords(pwr.user.password, password);
  if (isSamePassword) return res.status(403).json({ error: 'SAME_PASSWORD' });

  // Change Password and delete token
  const newPassword = await hash(password);
  await user.update({
    where: { id: pwr.user.id },
    data: {
      password: newPassword,
    },
  });
  await passwordReset.delete({ where: { id: pwr.id } });

  return res.status(200).json({ success: true });
};

export default [
  body('password_reset_token').notEmpty().trim(),
  prefabs(body('password'), 'PASSWORD'),
  checkValidationError,
  resetPassword,
];
