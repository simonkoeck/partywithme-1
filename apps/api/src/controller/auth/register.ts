import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError, { prefabs } from '../../middleware/validation';
import { user } from '@pwm/db';
import { randomString } from '../../util/random';
import { hash } from '../../util/hash';
import { sendToQueue } from '@pwm/queue';
// import { sendToQueue } from '../../../util/queue';

const registerController = async (req: Request, res: Response) => {
  try {
    const existingUser = await user.count({
      where: {
        OR: [{ email: req.body.email }, { username: req.body.username }],
      },
    });
    if (existingUser > 0) {
      return res.status(403).json({ error: 'EMAIL_NOT_AVAILABLE' });
    }

    const token = randomString(32);
    const pw = await hash(req.body.password);

    const u = await user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: pw,
        login_type: 'EMAIL',
        verified: false,
        verification_token: token,
        onesignal_external_user_id: randomString(128),
      },
    });
    if (u) {
      res.status(200).json({ success: true });

      sendToQueue('email', {
        action: 'VERIFICATION',
        data: {
          token,
        },
        recipients: [u],
      });
    } else {
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
};

export default [
  prefabs(body('username'), 'USERNAME'),
  prefabs(body('password'), 'PASSWORD'),
  prefabs(body('email'), 'EMAIL'),
  checkValidationError,
  registerController,
];
