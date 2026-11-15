import { Router } from 'express';
import { ClientController } from '../controllers/clientController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole('client'), ClientController.getDashboard);
router.get('/profile', authenticateToken, ClientController.getProfile);
router.get('/profile/:clientId', ClientController.getProfile);
router.put('/profile', authenticateToken, requireRole('client'), ClientController.updateProfile);

// BONUS: Candidate matches for a client's project
router.get('/projects/:projectId/candidates', authenticateToken, requireRole('client', 'admin'), ClientController.getCandidateMatches);

export default router;
