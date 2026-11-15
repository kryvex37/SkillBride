"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const connection_js_1 = require("../db/connection.js");
class NotificationController {
    static async getMyNotifications(req, res) {
        try {
            if (!req.user)
                return;
            const stmt = connection_js_1.db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `);
            const list = stmt.all(req.user.id);
            const unreadCount = connection_js_1.db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).c;
            res.json({
                success: true,
                data: list,
                unreadCount
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async markAsRead(req, res) {
        try {
            if (!req.user)
                return;
            const id = parseInt(req.params.id, 10);
            connection_js_1.db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user.id);
            res.json({ success: true, message: 'Notification marked as read' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            if (!req.user)
                return;
            connection_js_1.db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
            res.json({ success: true, message: 'All notifications marked as read' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.NotificationController = NotificationController;
