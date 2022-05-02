import { body } from 'express-validator';
import { verify } from '../../../util/google';
import { Request, Response } from 'express';
import { user } from '@pwm/db';
import { generateAccessToken, generateRefreshToken } from '@pwm/auth';
import checkValidationError from '../../../middleware/validation';
import { getActiveBans } from '@partywithme/bans';

const googleLogin = async (req: Request, res: Response) => {
  const ticket = await verify(req.body.id_token);
  if (ticket == null)
    return res.status(403).json({ error: 'INVALID_ID_TOKEN' });
  const u = await user.findFirst({
    where: {
      login_type: 'GOOGLE',
      google_id: ticket.sub,
    },
  });
  if (u == null) {
    return res.status(403).json({ error: 'USER_NOT_FOUND' });
  }

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
  body('id_token').notEmpty().trim().isJWT(),
  checkValidationError,
  googleLogin,
];
