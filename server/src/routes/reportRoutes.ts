import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, ReportController.submitReport);

export default router;
