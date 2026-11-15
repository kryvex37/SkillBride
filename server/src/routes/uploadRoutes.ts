import { Router, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { db } from '../db/connection.js';

const router = Router();

router.post('/avatar', authenticateToken, upload.single('avatar'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fileUrl, req.user!.id);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: fileUrl
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'File upload error' });
  }
});

router.post('/portfolio-image', authenticateToken, upload.single('image'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: fileUrl
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'File upload error' });
  }
});

export default router;
