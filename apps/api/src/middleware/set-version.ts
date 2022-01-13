import { Request, Response, NextFunction } from 'express';

const setVersionCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.header('X-Android-App-Version', process.env.ANDROID_APP_VERSION);
  res.header('X-iOS-App-Version', process.env.IOS_APP_VERSION);
  next();
};

export default setVersionCode;
