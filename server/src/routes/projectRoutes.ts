import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / browse with optional personalization
router.get('/', optionalAuth, ProjectController.getAll);
router.get('/:id', optionalAuth, ProjectController.getById);

// Protected mutations
router.post('/', authenticateToken, requireRole('client'), ProjectController.create);
router.put('/:id', authenticateToken, ProjectController.update);
router.patch('/:id/status', authenticateToken, ProjectController.updateStatus);
router.delete('/:id', authenticateToken, ProjectController.delete);

export default router;
