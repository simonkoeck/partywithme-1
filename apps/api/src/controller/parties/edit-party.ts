import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError from '../../middleware/validation';
import { party } from '@pwm/db';

const createParty = async (req: Request, res: Response) => {
  if (req.body.starts_at > req.body.ends_at) {
    return res.status(403).json({ error: 'STARTSAT_GT_ENDSAT' });
  }
  if (req.body.starts_at < new Date()) {
    return res.status(403).json({ error: 'CANNOT_START_BEFORE_NOW' });
  }

  const duration = Math.abs(req.body.starts_at - req.body.ends_at);
  if (duration < 1000 * 60 * 10) {
    return res.status(403).json({ error: 'TOO_SHORT_DURATION' });
  }
  if (duration > 1000 * 60 * 60 * 12) {
    return res.status(403).json({ error: 'MAX_DURATION_EXCEEDED' });
  }
  if (req.body.starts_at > addDays(new Date(), 31)) {
    return res.status(403).json({ error: 'STARTSAT_TOO_LATE' });
  }

  try {
    const p = await party.updateMany({
      where: {
        id: req.party.id,
        creator_id: req.user.id,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
        scope: req.body.scope,
        creator_id: req.user.id,
        starts_at: req.body.starts_at,
        ends_at: req.body.ends_at,
        latitude: parseFloat(req.body.location[0]),
        longitude: parseFloat(req.body.location[1]),
      },
    });
    if (p.count > 0) {
      res.status(200).json({ party: p });
    } else {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  } catch (e) {
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      error_details: process.env.NODE_ENV == 'development' ? e : null,
    });
  }
};

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isLatitude(lat: number) {
  return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng: number) {
  return isFinite(lng) && Math.abs(lng) <= 180;
}

export default [
  body('name')
    .isString()
    .notEmpty()
    .trim()
    .custom((v) => {
      if (v.length > 20) {
        throw Error('Maximum length of 20 chars exceeded');
      } else if (v.length < 3) {
        throw Error('Minimum length of 2 chars exceeded');
      }
      return true;
    }),
  body('description')
    .isString()
    .trim()
    .custom((v) => {
      if (v.length > 100) {
        throw Error('Maximum length of 100 chars exceeded');
      }
      return true;
    })
    .optional()
    .default(''),
  body('scope')
    .isString()
    .notEmpty()
    .custom((v) => {
      if (v != 'PUBLIC' && v != 'FRIENDS' && v != 'WHITELIST') {
        throw Error('Invalid scope');
      }
      return true;
    }),
  body('whitelist').isArray().default([]).optional(),
  body('starts_at').isString().notEmpty().isISO8601().toDate(),
  body('ends_at').isString().notEmpty().isISO8601().toDate(),
  body('location')
    .notEmpty()
    .isArray()
    .custom((v) => {
      if (!isLatitude(v[0]) || !isLongitude(v[1]))
        throw Error('Invalid coordinates');
      return true;
    }),
  checkValidationError,
  createParty,
];
