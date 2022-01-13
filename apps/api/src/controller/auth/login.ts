import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { user } from '@pwm/db';
import { generateAccessToken, generateRefreshToken } from '@pwm/auth';
import { comparePasswords } from '../../util/hash';

const login = async (req: Request, res: Response) => {
  const u = await user.findFirst({
    where: { username: req.body.username, login_type: 'EMAIL' },
    select: { id: true, password: true, verified: true, username: true },
  });
  if (!u) return res.status(403).json({ error: 'WRONG_USERNAME' });

  const matchPw = await comparePasswords(u.password, req.body.password);
  if (!matchPw) return res.status(403).json({ error: 'WRONG_PASSWORD' });

  if (!u.verified) return res.status(403).json({ error: 'NOT_VERIFIED' });

  const accessToken = await generateAccessToken(u);
  const refreshToken = await generateRefreshToken(u);

  res
    .status(200)
    .json({ access_token: accessToken, refresh_token: refreshToken });
};

export default [
  prefabs(body('username'), 'USERNAME'),
  prefabs(body('password'), 'PASSWORD'),
  checkValidationError,
  login,
];
