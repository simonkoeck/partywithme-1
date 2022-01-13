import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError from '../../middleware/validation';
import { user } from '@pwm/db';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@pwm/auth';

const refreshController = async (req: Request, res: Response) => {
  const old_refreshToken = req.body.refresh_token;
  let decoded;
  try {
    decoded = await verifyRefreshToken(old_refreshToken);
  } catch (e) {
    res.status(403).json({ error: e });
    return;
  }

  const u = await user.findFirst({
    where: { id: decoded.user.id },
    select: { id: true, username: true },
  });

  if (!u) return res.status(403).json({ error: 'USER_NOT_FOUND' });

  const accessToken = await generateAccessToken(u);
  const refreshToken = await generateRefreshToken(u);

  res
    .status(200)
    .json({ access_token: accessToken, refresh_token: refreshToken });
};

export default [
  body('refresh_token').notEmpty().trim().isJWT(),
  checkValidationError,
  refreshController,
];
