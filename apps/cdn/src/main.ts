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
import { env } from '@pwm/env';
import uploadChatImage from './controller/upload-chat-image';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { loadConfig } from '@partywithme/config-loader';

const conf = loadConfig<'cdn'>('cdn');

// Check if upload folder exists
if (!existsSync(conf.upload_folder)) {
  mkdirSync(conf.upload_folder);
  mkdirSync(conf.avatars_folder, { recursive: true });
  mkdirSync(conf.temp_folder, { recursive: true });
  mkdirSync(conf.chat_images_folder, { recursive: true });
}

if (!existsSync(conf.avatars_folder + '/default-50x50.jpg')) {
  copyFileSync(
    'images/default-50x50.jpg',
    conf.avatars_folder + '/default-50x50.jpg'
  );
  copyFileSync(
    'images/default-100x100.jpg',
    conf.avatars_folder + '/default-100x100.jpg'
  );
  copyFileSync(
    'images/default-200x200.jpg',
    conf.avatars_folder + '/default-200x200.jpg'
  );
}
const app = express();
const port = env('PORT') || 5000;

app.disable('etag');
app.disable('x-powered-by');

app.use(express.json());

// Render uploads using nginx on prod
if (env('NODE_ENV') == 'development') {
  app.use(
    '/dl/av',
    express.static(conf.avatars_folder, { index: false, extensions: ['jpg'] })
  );
  app.get('/dl/av/*', (req, res) => {
    res.sendFile(resolve(conf.avatars_folder + '/default-100x100.jpg'));
  });
  app.use(
    '/dl/ci',
    express.static(conf.chat_images_folder, {
      index: false,
      extensions: ['jpg'],
    })
  );
  app.get('/dl/ci/*', (req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
  });
}

app.use(accessControlMiddleware);
app.post('/avatar', uploadAvatarController);
app.post('/chat_image', uploadChatImage);

app.listen(port, () => {
  console.log(`CDN is listening on http://localhost:${port}`);
});
