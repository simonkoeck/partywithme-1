import { Request, Response } from 'express';
import { body } from 'express-validator';
import checkValidationError from '../../middleware/validation';
import { party, partyParticipation, conversation } from '@pwm/db';
import { sendToQueue } from '@pwm/queue';

const partyActionController = async (req: Request, res: Response) => {
  if (req.body.action == 'PARTICIPATE') {
    try {
      await partyParticipation.create({
        data: {
          party_id: req.party.id,
          user_id: req.user.id,
        },
      });
      sendToQueue('chat', {
        action: 'ADD_TO_CONVERSATION',
        data: {
          conversation: await conversation.findUnique({
            where: { party_id: req.party.id },
          }),
        },
        recipients: [req.user],
      });
      return res.status(202).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  } else if (req.body.action == 'UNPARTICIPATE') {
    if (req.party.participations.findIndex((p) => p.id == req.user.id) == -1)
      return res.status(403).json({ error: 'NOT_PARTICIPATING' });
    await partyParticipation.deleteMany({
      where: {
        party_id: req.party.id,
        user_id: req.user.id,
      },
    });
    sendToQueue('chat', {
      action: 'REMOVE_FROM_CONVERSATION',
      data: {
        conversation: await conversation.findUnique({
          where: { party_id: req.party.id },
        }),
      },
      recipients: [req.user],
    });
    return res.status(202).json({ success: true });
  } else if (req.body.action == 'DELETE') {
    if (req.party.creator_id != req.user.id)
      return res.status(403).json({ error: 'ERR_NO_ACCESS' });
    const r = await party.deleteMany({
      where: {
        id: req.party.id,
        creator_id: req.user.id,
      },
    });

    if (r.count ?? 0 > 0) {
      res.status(202).json({ success: true });
      sendToQueue('notifications', {
        action: 'PARTY_DELETED',
        data: {
          party: party,
        },
        sender: req.party.creator,
        recipients: req.party.participations,
      });
      return;
    } else {
      return res.status(403).json({ error: 'ERR_NO_ACCESS' });
    }
  }
  res.status(404).json({
    error: 'INVALID_ACTION',
  });
};

export default [
  body('action').custom((v) => {
    if (v != 'PARTICIPATE' && v != 'UNPARTICIPATE' && v != 'DELETE') {
      throw Error('Action not allowed');
    }
    return true;
  }),
  checkValidationError,
  partyActionController,
];
