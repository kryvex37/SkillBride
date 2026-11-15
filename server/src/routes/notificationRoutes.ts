import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, NotificationController.getMyNotifications);
router.patch('/:id/read', authenticateToken, NotificationController.markAsRead);
router.patch('/read-all', authenticateToken, NotificationController.markAllAsRead);

export default router;
