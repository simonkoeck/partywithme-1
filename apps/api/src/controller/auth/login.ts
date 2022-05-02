import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { user } from '@pwm/db';
import { generateAccessToken, generateRefreshToken } from '@pwm/auth';
import { comparePasswords } from '../../util/hash';
import { getActiveBans } from '@partywithme/bans';

const login = async (req: Request, res: Response) => {
  const u = await user.findFirst({
    where: { username: req.body.username, login_type: 'EMAIL' },
    select: { id: true, password: true, verified: true, username: true },
  });
  if (!u) return res.status(403).json({ error: 'WRONG_USERNAME' });

  const matchPw = await comparePasswords(u.password, req.body.password);
  if (!matchPw) return res.status(403).json({ error: 'WRONG_PASSWORD' });

  if (!u.verified) return res.status(403).json({ error: 'NOT_VERIFIED' });

  const bans = await getActiveBans(u.id);
  if (bans.findIndex((v) => v.restriction == 'NO_ACCESS') != -1)
    return res.status(403).json({ error: 'BANNED' });

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
