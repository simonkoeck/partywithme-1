import { verify } from '../../../util/google';
import { Request, Response } from 'express';
import { user } from '@pwm/db';
import { generateAccessToken, generateRefreshToken } from '@pwm/auth';
import checkValidationError from '../../../middleware/validation';
import { body } from 'express-validator';
import { randomString } from '../../../util/random';

const googleRegister = async (req: Request, res: Response) => {
  const ticket = await verify(req.body.id_token);
  if (ticket == null)
    return res.status(403).json({ error: 'INVALID_ID_TOKEN' });
  const chkuser = await user.findFirst({
    where: {
      login_type: 'GOOGLE',
      google_id: ticket.sub,
      email: ticket.email,
    },
  });
  if (chkuser != null) {
    return res.status(403).json({ error: 'EMAIL_NOT_AVAILABLE' });
  }

  const u = await user.create({
    data: {
      username: req.body.username,
      email: ticket.email,
      login_type: 'GOOGLE',
      google_id: ticket.sub,
      verified: true,
      onesignal_external_user_id: randomString(128),
    },
    select: {
      id: true,
      username: true,
    },
  });

  const accessToken = await generateAccessToken(u);
  const refreshToken = await generateRefreshToken(u);

  res
    .status(200)
    .json({ access_token: accessToken, refresh_token: refreshToken });
};

export default [
  body('id_token').notEmpty().trim().isJWT(),
  checkValidationError,
  googleRegister,
];
