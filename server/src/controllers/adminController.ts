import { Response } from 'express';
import { db } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  static async getOverview(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const totalStudents = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get() as any).c;
      const totalClients = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'client'").get() as any).c;
      const totalProjects = (db.prepare("SELECT COUNT(*) as c FROM projects").get() as any).c;
      const totalApplications = (db.prepare("SELECT COUNT(*) as c FROM applications").get() as any).c;
      const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'open' OR status = 'in_progress'").get() as any).c;
      const completedProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'completed'").get() as any).c;
      const pendingReports = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'pending'").get() as any).c;

      // Recent registrations
      const recentUsers = db.prepare(`
        SELECT id, email, role, first_name, last_name, avatar_url, status, created_at
        FROM users
        ORDER BY created_at DESC LIMIT 6
      `).all();

      // Recent projects
      const recentProjects = db.prepare(`
        SELECT p.id, p.title, p.category, p.budget, p.budget_type, p.status, p.created_at,
               u.first_name || ' ' || u.last_name as client_name
        FROM projects p
        JOIN users u ON p.client_id = u.id
        ORDER BY p.created_at DESC LIMIT 6
      `).all();

      // Recent applications
      const recentApplications = db.prepare(`
        SELECT a.id, a.status, a.proposed_rate, a.created_at,
               p.title as project_title,
               u.first_name || ' ' || u.last_name as student_name
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        JOIN users u ON a.student_id = u.id
        ORDER BY a.created_at DESC LIMIT 6
      `).all();

      // Category breakdown
      const categoryStats = db.prepare(`
        SELECT category, COUNT(*) as count
        FROM projects
        GROUP BY category
      `).all();

      // Application status breakdown
      const applicationStats = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `).all();

      res.json({
        success: true,
        data: {
          metrics: {
            totalStudents,
            totalClients,
            totalProjects,
            totalApplications,
            activeProjects,
            completedProjects,
            pendingReports
          },
          recentUsers,
          recentProjects,
          recentApplications,
          categoryStats,
          applicationStats
        }
      });
    } catch (err: any) {
      console.error('Admin overview error:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, search, status } = req.query as Record<string, string>;
      const conditions: string[] = [];
      const params: any[] = [];

      if (role && role !== 'all') {
        conditions.push('u.role = ?');
        params.push(role);
      }
      if (status && status !== 'all') {
        conditions.push('u.status = ?');
        params.push(status);
      }
      if (search && search.trim()) {
        conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const sql = `
        SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.avatar_url, u.phone, u.status, u.created_at,
               sp.university, sp.department, sp.student_id, sp.profile_completed,
               cp.company_name, cp.industry
        FROM users u
        LEFT JOIN student_profiles sp ON sp.user_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        ${where}
        ORDER BY u.created_at DESC
      `;

      const users = db.prepare(sql).all(...params);
      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!['active', 'suspended', 'deactivated'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      if (id === req.user?.id) {
        res.status(400).json({ success: false, message: 'Cannot change your own admin account status' });
        return;
      }

      db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

      res.json({ success: true, message: `User status changed to ${status}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      res.json({ success: true, message: 'Project removed by administrator' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async getAllReviews(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const sql = `
        SELECT r.*,
               u1.first_name || ' ' || u1.last_name as reviewer_name,
               u1.email as reviewer_email,
               u2.first_name || ' ' || u2.last_name as reviewee_name,
               p.title as project_title
        FROM reviews r
        JOIN users u1 ON r.reviewer_id = u1.id
        JOIN users u2 ON r.reviewee_id = u2.id
        JOIN projects p ON r.project_id = p.id
        ORDER BY r.created_at DESC
      `;
      const reviews = db.prepare(sql).all();
      res.json({ success: true, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
      res.json({ success: true, message: 'Review removed' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async getReports(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const sql = `
        SELECT rep.*,
               u.first_name || ' ' || u.last_name as reporter_name,
               u.email as reporter_email
        FROM reports rep
        JOIN users u ON rep.reporter_id = u.id
        ORDER BY rep.created_at DESC
      `;
      const reports = db.prepare(sql).all();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async resolveReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, resolution_notes } = req.body;

      if (!['resolved', 'dismissed'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status must be resolved or dismissed' });
        return;
      }

      db.prepare(`
        UPDATE reports SET
          status = ?,
          resolution_notes = ?,
          resolved_by = ?
        WHERE id = ?
      `).run(status, resolution_notes || '', req.user ? req.user.id : null, id);

      res.json({ success: true, message: `Report marked as ${status}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
