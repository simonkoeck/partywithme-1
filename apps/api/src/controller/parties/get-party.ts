import { Request, Response } from 'express';

const getPartyController = async (req: Request, res: Response) => {
  res.status(200).json({ party: req.party });
};

export default getPartyController;
