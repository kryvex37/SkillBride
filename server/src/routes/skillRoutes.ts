import { Router } from 'express';
import { SkillController } from '../controllers/skillController.js';

const router = Router();

router.get('/', SkillController.getAll);
router.get('/categories', SkillController.getCategories);

export default router;
