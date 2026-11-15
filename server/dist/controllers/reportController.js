"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const connection_js_1 = require("../db/connection.js");
class ReportController {
    static async submitReport(req, res) {
        try {
            if (!req.user)
                return;
            const { reported_type, reported_id, reason, details } = req.body;
            if (!reported_type || !reported_id || !reason) {
                res.status(400).json({ success: false, message: 'Type, ID, and reason are required' });
                return;
            }
            const stmt = connection_js_1.db.prepare(`
        INSERT INTO reports (reporter_id, reported_type, reported_id, reason, details, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `);
            stmt.run(req.user.id, reported_type, reported_id, reason.trim(), details?.trim() || '');
            res.status(201).json({
                success: true,
                message: 'Report submitted. Our moderation team will investigate promptly.'
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.ReportController = ReportController;
