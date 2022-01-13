import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

const checkValidationError = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vr = validationResult(req);
  if (vr.isEmpty()) {
    next();
  } else {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: JSON.parse(JSON.stringify(vr)).errors,
    });
  }
};

export default checkValidationError;

export const prefabs = (
  v: ValidationChain,
  key: 'USERNAME' | 'PASSWORD' | 'EMAIL'
) => {
  if (key == 'USERNAME') {
    return v
      .notEmpty()
      .custom((v) => {
        if (v.length > 12)
          throw new Error('Username length may not be greater then 12');
        else if (v.length < 3)
          throw new Error('Username length may not be less then 3');
        else if (
          v.startsWith('_') ||
          v.endsWith('_') ||
          v.startsWith('-') ||
          v.endsWith('-')
        )
          return false;
        return true;
      })
      .trim()
      .matches(/^[a-z0-9_-]+$/i);
  } else if (key == 'PASSWORD') {
    return v
      .notEmpty()
      .custom((v) => {
        if (v.length > 124)
          throw new Error('Username length may not be greater then 124');
        else if (v.length < 6)
          throw new Error('Username length may not be less then 6');
        return true;
      })
      .trim();
  } else if (key == 'EMAIL') {
    return v.notEmpty().normalizeEmail().isEmail().trim();
  }
};
