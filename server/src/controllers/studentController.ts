import { Response } from 'express';
import { db } from '../db/connection.js';
import { AuthRequest } from '../middleware/auth.js';
import { RecommendationService } from '../services/recommendationService.js';

export class StudentController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
      if (!targetUserId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const userStmt = db.prepare(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.phone, u.status, u.created_at,
               sp.id as profile_id, sp.university, sp.department, sp.student_id, sp.bio,
               sp.experience_level, sp.education, sp.github_url, sp.linkedin_url, sp.website_url,
               sp.profile_completed
        FROM users u
        LEFT JOIN student_profiles sp ON sp.user_id = u.id
        WHERE u.id = ? AND u.role = 'student'
      `);
      const student = userStmt.get(targetUserId) as any;

      if (!student) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      // Fetch Skills
      const skillsStmt = db.prepare(`
        SELECT ss.id as student_skill_id, ss.proficiency, ss.years_of_experience,
               s.id as skill_id, s.name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_profile_id = ?
        ORDER BY s.name ASC
      `);
      const skills = skillsStmt.all(student.profile_id) as any[];

      // Fetch Portfolio Items
      const portfolioStmt = db.prepare(`
        SELECT * FROM portfolio_items
        WHERE student_profile_id = ?
        ORDER BY created_at DESC
      `);
      const portfolio = portfolioStmt.all(student.profile_id) as any[];

      // Fetch Application Statistics
      const statsStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'pending' OR status = 'under_review' THEN 1 ELSE 0 END) as pending_applications,
          SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_applications,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects
        FROM applications
        WHERE student_id = ?
      `);
      const stats = statsStmt.get(targetUserId) as any;

      // Fetch Reviews received
      const reviewsStmt = db.prepare(`
        SELECT r.*, u.first_name || ' ' || u.last_name as reviewer_name, u.avatar_url as reviewer_avatar,
               p.title as project_title
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        JOIN projects p ON r.project_id = p.id
        WHERE r.reviewee_id = ?
        ORDER BY r.created_at DESC
      `);
      const reviews = reviewsStmt.all(targetUserId) as any[];

      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

      res.json({
        success: true,
        data: {
          ...student,
          skills,
          portfolio,
          stats: {
            totalApplications: stats?.total_applications || 0,
            pendingApplications: stats?.pending_applications || 0,
            acceptedApplications: stats?.accepted_applications || 0,
            completedProjects: stats?.completed_projects || 0,
            averageRating: avgRating,
            reviewCount: reviews.length
          },
          reviews
        }
      });
    } catch (err: any) {
      console.error('Error fetching student profile:', err);
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'student') {
        res.status(403).json({ success: false, message: 'Only students can edit this profile' });
        return;
      }

      const {
        first_name,
        last_name,
        university,
        department,
        student_id,
        bio,
        experience_level,
        education,
        github_url,
        linkedin_url,
        website_url,
        phone
      } = req.body;

      if (first_name || last_name || phone) {
        db.prepare(`
          UPDATE users SET
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            phone = COALESCE(?, phone),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(first_name?.trim(), last_name?.trim(), phone?.trim(), req.user.id);
      }

      // Calculate profile completion percentage
      let score = 20; // registered
      if (bio && bio.length > 20) score += 15;
      if (university && department) score += 15;
      if (github_url || linkedin_url) score += 15;
      if (education) score += 10;

      // Check skills count
      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (profile) {
        const skillCount = (db.prepare('SELECT COUNT(*) as count FROM student_skills WHERE student_profile_id = ?').get(profile.id) as any)?.count || 0;
        if (skillCount >= 3) score += 15;
        const portfolioCount = (db.prepare('SELECT COUNT(*) as count FROM portfolio_items WHERE student_profile_id = ?').get(profile.id) as any)?.count || 0;
        if (portfolioCount >= 1) score += 10;

        const updateSpStmt = db.prepare(`
          UPDATE student_profiles SET
            university = COALESCE(?, university),
            department = COALESCE(?, department),
            student_id = COALESCE(?, student_id),
            bio = COALESCE(?, bio),
            experience_level = COALESCE(?, experience_level),
            education = COALESCE(?, education),
            github_url = COALESCE(?, github_url),
            linkedin_url = COALESCE(?, linkedin_url),
            website_url = COALESCE(?, website_url),
            profile_completed = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        updateSpStmt.run(
          university?.trim(),
          department?.trim(),
          student_id?.trim(),
          bio?.trim(),
          experience_level,
          education?.trim(),
          github_url?.trim(),
          linkedin_url?.trim(),
          website_url?.trim(),
          Math.min(100, score),
          profile.id
        );
      }

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  // --- Skills Management ---
  static async addSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { skill_id, skill_name, proficiency = 'intermediate', years_of_experience = 1 } = req.body;

      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (!profile) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      let targetSkillId = skill_id;

      // If user typed a custom skill name
      if (!targetSkillId && skill_name) {
        const existingSkill = db.prepare('SELECT id FROM skills WHERE LOWER(name) = ?').get(skill_name.toLowerCase().trim()) as any;
        if (existingSkill) {
          targetSkillId = existingSkill.id;
        } else {
          const insertSkill = db.prepare('INSERT INTO skills (name, category) VALUES (?, ?)');
          const newSkill = insertSkill.run(skill_name.trim(), 'technical');
          targetSkillId = Number(newSkill.lastInsertRowid);
        }
      }

      if (!targetSkillId) {
        res.status(400).json({ success: false, message: 'Please specify a skill' });
        return;
      }

      const insertStmt = db.prepare(`
        INSERT INTO student_skills (student_profile_id, skill_id, proficiency, years_of_experience)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(student_profile_id, skill_id) DO UPDATE SET
          proficiency = excluded.proficiency,
          years_of_experience = excluded.years_of_experience
      `);
      insertStmt.run(profile.id, targetSkillId, proficiency, parseFloat(years_of_experience));

      res.status(201).json({ success: true, message: 'Skill added to profile' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async removeSkill(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const skillId = parseInt(req.params.skillId, 10);
      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (!profile) return;

      db.prepare('DELETE FROM student_skills WHERE student_profile_id = ? AND skill_id = ?').run(profile.id, skillId);

      res.json({ success: true, message: 'Skill removed' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  // --- Portfolio CRUD ---
  static async addPortfolioItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { title, description, project_url, github_url, image_url, technologies } = req.body;

      if (!title) {
        res.status(400).json({ success: false, message: 'Project title is required' });
        return;
      }

      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (!profile) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      const insertStmt = db.prepare(`
        INSERT INTO portfolio_items (student_profile_id, title, description, project_url, github_url, image_url, technologies)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        profile.id,
        title.trim(),
        description || '',
        project_url || '',
        github_url || '',
        image_url || '',
        technologies || ''
      );

      res.status(201).json({ success: true, message: 'Portfolio item added successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async updatePortfolioItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const id = parseInt(req.params.id, 10);
      const { title, description, project_url, github_url, image_url, technologies } = req.body;

      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (!profile) return;

      const updateStmt = db.prepare(`
        UPDATE portfolio_items SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          project_url = COALESCE(?, project_url),
          github_url = COALESCE(?, github_url),
          image_url = COALESCE(?, image_url),
          technologies = COALESCE(?, technologies),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND student_profile_id = ?
      `);

      updateStmt.run(title, description, project_url, github_url, image_url, technologies, id, profile.id);

      res.json({ success: true, message: 'Portfolio item updated' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  static async deletePortfolioItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const id = parseInt(req.params.id, 10);
      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id) as any;
      if (!profile) return;

      db.prepare('DELETE FROM portfolio_items WHERE id = ? AND student_profile_id = ?').run(id, profile.id);

      res.json({ success: true, message: 'Portfolio item deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  // --- Recommendations ---
  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const recommendations = RecommendationService.getRecommendedProjectsForStudent(req.user.id, 12);
      res.json({ success: true, data: recommendations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}
