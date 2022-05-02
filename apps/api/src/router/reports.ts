import { accessControlMiddleware } from '@pwm/accessControl';
import { Router } from 'express';
import createReport from '../controller/reports/create-report';
const router = Router();

router.use(accessControlMiddleware);

router.post('/', createReport);

export default router;
