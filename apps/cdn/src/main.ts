import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: 'apps/cdn/.env' });

interface IUser {
  id: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

import * as express from 'express';
import uploadAvatarController from './controller/upload-avatar';
import { resolve } from 'path';
import { accessControlMiddleware } from '@pwm/accessControl';

const app = express();
const port = process.env.PORT || 5000;

app.disable('etag');
app.disable('x-powered-by');

app.use(express.json());

// Render uploads using nginx on prod
if (process.env.NODE_ENV == 'development') {
  app.use(
    '/dl/av',
    express.static('uploads/avatars', { index: false, extensions: ['jpg'] })
  );
  app.get('/dl/av/*', (req, res) => {
    res.sendFile(resolve('uploads/avatars/default-100x100.jpg'));
  });
}

app.use(accessControlMiddleware);
app.post('/avatar', uploadAvatarController);

app.listen(port, () => {
  console.log(`CDN is listening on http://localhost:${port}`);
});
