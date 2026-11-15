import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Profile view (public or by ID or logged in)
router.get('/profile', authenticateToken, StudentController.getProfile);
router.get('/profile/:userId', StudentController.getProfile);
router.put('/profile', authenticateToken, requireRole('student'), StudentController.updateProfile);

// Skills
router.post('/skills', authenticateToken, requireRole('student'), StudentController.addSkill);
router.delete('/skills/:skillId', authenticateToken, requireRole('student'), StudentController.removeSkill);

// Portfolio items
router.post('/portfolio', authenticateToken, requireRole('student'), StudentController.addPortfolioItem);
router.put('/portfolio/:id', authenticateToken, requireRole('student'), StudentController.updatePortfolioItem);
router.delete('/portfolio/:id', authenticateToken, requireRole('student'), StudentController.deletePortfolioItem);

// Recommendations
router.get('/recommendations', authenticateToken, requireRole('student'), StudentController.getRecommendations);

export default router;
