import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(authenticateToken, requireRole('admin'));

router.get('/overview', AdminController.getOverview);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.delete('/projects/:id', AdminController.deleteProject);
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);
router.get('/reports', AdminController.getReports);
router.patch('/reports/:id/resolve', AdminController.resolveReport);

export default router;
