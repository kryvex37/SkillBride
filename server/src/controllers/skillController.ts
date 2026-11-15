import { Request, Response } from 'express';
import { db } from '../db/connection.js';

export class SkillController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const skills = db.prepare('SELECT * FROM skills ORDER BY name ASC').all();
      res.json({ success: true, data: skills });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = db.prepare('SELECT DISTINCT category FROM skills ORDER BY category ASC').all();
      res.json({ success: true, data: categories.map((c: any) => c.category) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
