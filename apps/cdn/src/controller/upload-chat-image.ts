import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import * as multer from 'multer';
import { extname, resolve } from 'path';
import * as sharp from 'sharp';
import { unlinkSync } from 'fs';

interface MulterRequest extends Request {
  file: Express.Multer.File;
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

const uploadChatImageController = async (req: Request, res: Response) => {
  const file = (req as MulterRequest).file;
  if (!file) return res.status(403).json({ error: 'NO_FILE_SPECIFIED' });
  const id: string = randomBytes(16).toString('hex');
  try {
    await sharp(file.path)
      .jpeg({ quality: 100 })
      .toFile(
        resolve(file.destination, '..', 'chat_images', id + '-original.jpg')
      );

    await sharp(file.path)
      .jpeg({ quality: 70 })
      .toFile(
        resolve(file.destination, '..', 'chat_images', id + '-preview.jpg')
      );
    unlinkSync(file.path);
  } catch (e) {
    unlinkSync(file.path);
    return res.status(500).json({ error: 'PROCESS_IMAGE_ERROR' });
  }

  res.status(200).json({
    success: true,
    id,
  });
};

export default [upload.single('image'), uploadChatImageController];
