import { db } from '../db/connection.js';

export class NotificationService {
  static createNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    link?: string
  ): void {
    try {
      const stmt = db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `);
      stmt.run(userId, type, title, message, link || '');
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }

  static getUnreadCount(userId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
    const result = stmt.get(userId) as { count: number } | undefined;
    return result?.count || 0;
  }
}
