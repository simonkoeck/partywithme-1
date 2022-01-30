import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/api/.env' });
dotenv.config({ path: '.env' });

import { User, Party } from '@pwm/db';

interface IParty extends Party {
  participations: User[];
  creator: User;
  is_participating: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: User;
      party: IParty;
    }
  }
}

import * as express from 'express';
import * as cors from 'cors';
import setVersionCode from './middleware/set-version';
import authRouter from './router/auth';
import usersRouter from './router/users';
import partiesRouter from './router/parties';
import friendsRouter from './router/friends';
import { env } from '@pwm/env';

(async () => {
  const app = express();
  const port = env('PORT') || 5000;

  app.set('trust proxy', true);

  app.disable('etag');
  app.disable('x-powered-by');

  app.use(cors({ origin: process.env.WEBSITE_URL }));
  app.use(express.json());
  app.use(setVersionCode);

  app.get('/ping', (req, res) => {
    res.status(200).json({ ping: 'pong' });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/parties', partiesRouter);
  app.use('/friends', friendsRouter);

  app.listen(port, () => {
    console.log(`API is listening on http://localhost:${port}`);
  });
})();
