import { Request, Response } from 'express';
import * as multer from 'multer';
import { extname, resolve } from 'path';
import * as sharp from 'sharp';
import { unlinkSync } from 'fs';
import { env } from '@pwm/env';

interface MulterRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const ext = extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1000 * 1000 * 5,
  },
});

const uploadAvatarController = async (req: Request, res: Response) => {
  const file = (req as MulterRequest).file;
  if (!file) return res.status(403).json({ error: 'NO_FILE_SPECIFIED' });
  try {
    await sharp(file.path)
      .resize(50, 50, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .jpeg({ quality: 65 })
      .toFile(
        resolve(file.destination, '..', 'avatars', req.user.id + '-50x50.jpg')
      );
    await sharp(file.path)
      .resize(100, 100, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .jpeg({ quality: 82 })
      .toFile(
        resolve(file.destination, '..', 'avatars', req.user.id + '-100x100.jpg')
      );
    await sharp(file.path)
      .resize(200, 200, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .jpeg({ quality: 90 })
      .toFile(
        resolve(file.destination, '..', 'avatars', req.user.id + '-200x200.jpg')
      );
    unlinkSync(file.path);
  } catch (e) {
    unlinkSync(file.path);
    return res.status(500).json({ error: 'PROCESS_IMAGE_ERROR' });
  }

  res.status(200).json({
    success: true,
    avatar_urls: {
      '50x50': env('AVATAR_URL') + req.user.id + '-50x50.jpg',
      '100x100': env('AVATAR_URL') + req.user.id + '-100x100.jpg',
      '200x200': env('AVATAR_URL') + req.user.id + '-200x200.jpg',
    },
  });
};

export default [upload.single('image'), uploadAvatarController];
