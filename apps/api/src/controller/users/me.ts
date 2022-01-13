import { Request, Response } from 'express';
import { user } from '@pwm/db';

const me = async (req: Request, res: Response) => {
  const u = await user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      onesignal_external_user_id: true,
      locale: true,
    },
  });
  if (u == null) return res.status(403).json({ error: 'USER_NOT_FOUND' });
  res.status(200).json({ user: u });
};

export default me;
