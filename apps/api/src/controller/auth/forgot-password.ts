import { body } from 'express-validator';
import { Request, Response } from 'express';
import { user, passwordReset } from '@pwm/db';
import { sendToQueue } from '@pwm/queue';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { randomString } from '../../util/random';

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const forgotPassword = async (req: Request, res: Response) => {
  // Search User with this E-Mail
  const u = await user.findFirst({
    where: {
      email: req.body.email,
      login_type: 'EMAIL',
    },
  });
  if (u != null && u.verified == true) {
    // Generate Password Reset Token
    const token: string = randomString(32);

    await passwordReset.create({
      data: {
        token,
        user_id: u.id,
        expiration: addDays(new Date(), 1),
      },
    });

    sendToQueue('email', {
      action: 'FORGOT_PASSWORD',
      data: {
        token,
        ip: req.ip,
      },
      recipients: [u],
    });
  }
  res.status(200).json({});
};

export default [
  prefabs(body('email'), 'EMAIL'),
  checkValidationError,
  forgotPassword,
];
