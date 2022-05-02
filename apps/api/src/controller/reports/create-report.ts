import { report, ReportAndBanReason } from '@pwm/db';
import { isCuid } from 'cuid';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError from '../../middleware/validation';

const createReport = async (req: Request, res: Response) => {
  try {
    await report.create({
      data: {
        reported_by_id: req.user.id,
        additional_info: req.body.additional_info,
        reason: req.body.reason,
        user_id: req.body.user_id,
      },
    });
    res.status(200).json({});
  } catch (e) {
    res.status(403).json({ error: 'ALREADY_REPORTED' });
  }
};

export default [
  body('user')
    .isString()
    .custom((v) => {
      if (!isCuid(v)) throw Error('User is not a valid id!');
    }),
  body('reason')
    .isString()
    .custom((v) => {
      if (Object.values(ReportAndBanReason).indexOf(v) === -1)
        throw Error('Invalid report reason');
    }),
  body('additional_info').isString().optional(),
  checkValidationError,
  createReport,
];
