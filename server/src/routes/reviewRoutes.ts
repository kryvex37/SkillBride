import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, ReviewController.createReview);
router.get('/user/:userId', ReviewController.getUserReviews);

export default router;
