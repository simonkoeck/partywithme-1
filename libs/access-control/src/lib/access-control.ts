import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '@pwm/auth';
import { checkOneTimeToken } from '@pwm/ott';

export const accessControlMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const temp = req.header('authorization')?.split(' ');
  if (!temp) return res.status(401).json({ error: 'AUTHORIZATION_MISSING' });
  const tokenType = temp[0] || '';
  const token = temp[1] || '';
  if (tokenType.toLowerCase() == 'bearer') {
    if (!token) return res.status(401).json({ error: 'ACCESS_TOKEN_MISSING' });
    try {
      const verified = await verifyAccessToken(token);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = verified.user;
      next();
    } catch (e: any) {
      res.status(403).json({ error: e.name });
    }
    return;
    // One Time Token
  } else if (tokenType.toLowerCase() == 'ott') {
    const u = checkOneTimeToken(token);

    if (u == null) {
      return res.status(401).json({ error: 'OTT_NOT_FOUND' });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = u;
    next();
    return;
  }
  return res.status(401).json({ error: 'INVALID_AUTHORIZATION' });
};
