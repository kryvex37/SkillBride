"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const connection_js_1 = require("../db/connection.js");
class NotificationService {
    static createNotification(userId, type, title, message, link) {
        try {
            const stmt = connection_js_1.db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `);
            stmt.run(userId, type, title, message, link || '');
        }
        catch (err) {
            console.error('Failed to create notification:', err);
        }
    }
    static getUnreadCount(userId) {
        const stmt = connection_js_1.db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
        const result = stmt.get(userId);
        return result?.count || 0;
    }
}
exports.NotificationService = NotificationService;
