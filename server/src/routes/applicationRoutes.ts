import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/apply', authenticateToken, requireRole('student'), ApplicationController.apply);
router.get('/my-applications', authenticateToken, requireRole('student'), ApplicationController.getStudentApplications);
router.get('/project/:projectId', authenticateToken, requireRole('client', 'admin'), ApplicationController.getProjectApplications);
router.patch('/:id/status', authenticateToken, ApplicationController.updateStatus);

export default router;
