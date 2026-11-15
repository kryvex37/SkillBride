import { Response } from 'express';
import { db } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';

export class NotificationController {
  static async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const stmt = db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `);
      const list = stmt.all(req.user.id);
      const unreadCount = (db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id) as any).c;

      res.json({
        success: true,
        data: list,
        unreadCount
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const id = parseInt(req.params.id, 10);
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
