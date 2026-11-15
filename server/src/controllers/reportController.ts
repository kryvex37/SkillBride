import { Response } from 'express';
import { db } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';

export class ReportController {
  static async submitReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { reported_type, reported_id, reason, details } = req.body;

      if (!reported_type || !reported_id || !reason) {
        res.status(400).json({ success: false, message: 'Type, ID, and reason are required' });
        return;
      }

      const stmt = db.prepare(`
        INSERT INTO reports (reporter_id, reported_type, reported_id, reason, details, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `);
      stmt.run(req.user.id, reported_type, reported_id, reason.trim(), details?.trim() || '');

      res.status(201).json({
        success: true,
        message: 'Report submitted. Our moderation team will investigate promptly.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
