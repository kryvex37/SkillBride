"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const connection_js_1 = require("../db/connection.js");
class ProjectController {
    static async getAll(req, res) {
        try {
            const { search, skill, category, experience, budgetType, minBudget, maxBudget, minProposals, maxProposals, status = 'open', sort = 'newest', page = '1', limit = '20' } = req.query;
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
            const offset = (pageNum - 1) * limitNum;
            const conditions = [];
            const params = [];
            // Status filter
            if (status && status !== 'any') {
                conditions.push('p.status = ?');
                params.push(status);
            }
            // Keyword search in title, description, or client company
            if (search && search.trim()) {
                conditions.push('(p.title LIKE ? OR p.description LIKE ? OR cp.company_name LIKE ?)');
                const term = `%${search.trim()}%`;
                params.push(term, term, term);
            }
            // Category filter
            if (category && category !== 'all' && category !== 'any') {
                conditions.push('p.category = ?');
                params.push(category);
            }
            // Experience level filter
            if (experience && experience !== 'all' && experience !== 'any') {
                conditions.push('p.experience_level = ?');
                params.push(experience);
            }
            // Budget type filter (hourly vs fixed)
            if (budgetType && budgetType !== 'all' && budgetType !== 'any') {
                conditions.push('p.budget_type = ?');
                params.push(budgetType);
            }
            // Budget range filter
            if (minBudget) {
                conditions.push('p.budget >= ?');
                params.push(parseFloat(minBudget));
            }
            if (maxBudget) {
                conditions.push('p.budget <= ?');
                params.push(parseFloat(maxBudget));
            }
            // Filter by required skill
            if (skill && skill.trim()) {
                conditions.push(`
          p.id IN (
            SELECT prs.project_id FROM project_required_skills prs
            JOIN skills s ON prs.skill_id = s.id
            WHERE LOWER(s.name) LIKE ?
          )
        `);
                params.push(`%${skill.trim().toLowerCase()}%`);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            // Sorting
            let orderBy = 'p.created_at DESC';
            if (sort === 'oldest')
                orderBy = 'p.created_at ASC';
            else if (sort === 'budget_desc')
                orderBy = 'p.budget DESC';
            else if (sort === 'budget_asc')
                orderBy = 'p.budget ASC';
            else if (sort === 'proposals_desc')
                orderBy = 'proposals_count DESC';
            // Count query
            const countSql = `
        SELECT COUNT(*) as total
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        ${whereClause}
      `;
            const countStmt = connection_js_1.db.prepare(countSql);
            const totalCountRow = countStmt.get(...params);
            const total = totalCountRow?.total || 0;
            // Current logged in student ID for `has_applied` check
            const currentStudentId = req.user && req.user.role === 'student' ? req.user.id : null;
            // Main query
            const querySql = `
        SELECT 
          p.id, p.client_id, p.title, p.description, p.category, p.budget, p.budget_type,
          p.project_type, p.experience_level, p.deadline, p.status, p.additional_requirements,
          p.location, p.created_at, p.updated_at,
          u.first_name || ' ' || u.last_name as client_name,
          cp.company_name as client_company,
          cp.location as client_location,
          cp.is_verified as client_verified,
          (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as proposals_count
          ${currentStudentId ? `, (SELECT COUNT(*) > 0 FROM applications WHERE project_id = p.id AND student_id = ${currentStudentId}) as has_applied` : ', 0 as has_applied'}
        FROM projects p
        JOIN users u ON p.client_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;
            const listStmt = connection_js_1.db.prepare(querySql);
            const projects = listStmt.all(...params, limitNum, offset);
            // Attach required skills for each project
            const skillStmt = connection_js_1.db.prepare(`
        SELECT s.id, s.name, s.category, prs.is_mandatory
        FROM project_required_skills prs
        JOIN skills s ON prs.skill_id = s.id
        WHERE prs.project_id = ?
      `);
            for (const proj of projects) {
                proj.required_skills = skillStmt.all(proj.id);
                proj.has_applied = Boolean(proj.has_applied);
                proj.client_verified = Boolean(proj.client_verified);
            }
            res.json({
                success: true,
                data: projects,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
        }
        catch (err) {
            console.error('Error fetching projects:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const currentStudentId = req.user && req.user.role === 'student' ? req.user.id : null;
            const querySql = `
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          u.avatar_url as client_avatar,
          u.email as client_email,
          cp.company_name as client_company,
          cp.location as client_location,
          cp.bio as client_bio,
          cp.website_url as client_website,
          cp.is_verified as client_verified,
          (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as proposals_count
          ${currentStudentId ? `, (SELECT COUNT(*) > 0 FROM applications WHERE project_id = p.id AND student_id = ${currentStudentId}) as has_applied` : ', 0 as has_applied'}
        FROM projects p
        JOIN users u ON p.client_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        WHERE p.id = ?
      `;
            const stmt = connection_js_1.db.prepare(querySql);
            const project = stmt.get(id);
            if (!project) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            // Attach skills
            const skillStmt = connection_js_1.db.prepare(`
        SELECT s.id, s.name, s.category, prs.is_mandatory
        FROM project_required_skills prs
        JOIN skills s ON prs.skill_id = s.id
        WHERE prs.project_id = ?
      `);
            project.required_skills = skillStmt.all(id);
            project.has_applied = Boolean(project.has_applied);
            project.client_verified = Boolean(project.client_verified);
            res.json({ success: true, data: project });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user || req.user.role !== 'client') {
                res.status(403).json({ success: false, message: 'Only registered clients can post projects' });
                return;
            }
            const { title, description, category, budget, budget_type = 'hourly', project_type = 'one-time', experience_level = 'entry', deadline, additional_requirements, skills = [] } = req.body;
            if (!title || !description || !category || budget === undefined) {
                res.status(400).json({ success: false, message: 'Title, description, category, and budget are required' });
                return;
            }
            // Insert project
            const insertStmt = connection_js_1.db.prepare(`
        INSERT INTO projects (
          client_id, title, description, category, budget, budget_type,
          project_type, experience_level, deadline, status, additional_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
      `);
            const result = insertStmt.run(req.user.id, title.trim(), description.trim(), category.trim(), parseFloat(budget), budget_type, project_type, experience_level, deadline || null, additional_requirements || '');
            const projectId = Number(result.lastInsertRowid);
            // Insert required skills
            if (Array.isArray(skills) && skills.length > 0) {
                const linkSkillStmt = connection_js_1.db.prepare(`
          INSERT OR IGNORE INTO project_required_skills (project_id, skill_id, is_mandatory)
          VALUES (?, ?, ?)
        `);
                for (const skillItem of skills) {
                    let skillId = typeof skillItem === 'object' ? skillItem.id : skillItem;
                    // If skill name was passed instead of id, resolve or insert skill
                    if (typeof skillItem === 'string' && isNaN(Number(skillItem))) {
                        const findSkill = connection_js_1.db.prepare('SELECT id FROM skills WHERE LOWER(name) = ?').get(skillItem.toLowerCase().trim());
                        if (findSkill) {
                            skillId = findSkill.id;
                        }
                        else {
                            const insertSkill = connection_js_1.db.prepare('INSERT INTO skills (name, category) VALUES (?, ?)');
                            const newSkillRes = insertSkill.run(skillItem.trim(), 'technical');
                            skillId = Number(newSkillRes.lastInsertRowid);
                        }
                    }
                    if (skillId) {
                        linkSkillStmt.run(projectId, Number(skillId), 1);
                    }
                }
            }
            res.status(201).json({
                success: true,
                message: 'Project published successfully',
                projectId
            });
        }
        catch (err) {
            console.error('Error creating project:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async update(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const existing = connection_js_1.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            // Check ownership or admin
            if (req.user?.role !== 'admin' && existing.client_id !== req.user?.id) {
                res.status(403).json({ success: false, message: 'You are not authorized to update this project' });
                return;
            }
            const { title, description, category, budget, budget_type, project_type, experience_level, deadline, additional_requirements, skills } = req.body;
            const updateStmt = connection_js_1.db.prepare(`
        UPDATE projects SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          budget = COALESCE(?, budget),
          budget_type = COALESCE(?, budget_type),
          project_type = COALESCE(?, project_type),
          experience_level = COALESCE(?, experience_level),
          deadline = COALESCE(?, deadline),
          additional_requirements = COALESCE(?, additional_requirements),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
            updateStmt.run(title?.trim(), description?.trim(), category?.trim(), budget !== undefined ? parseFloat(budget) : null, budget_type, project_type, experience_level, deadline, additional_requirements, id);
            // Update skills if provided
            if (Array.isArray(skills)) {
                connection_js_1.db.prepare('DELETE FROM project_required_skills WHERE project_id = ?').run(id);
                const linkSkillStmt = connection_js_1.db.prepare(`
          INSERT OR IGNORE INTO project_required_skills (project_id, skill_id, is_mandatory)
          VALUES (?, ?, ?)
        `);
                for (const s of skills) {
                    const sId = typeof s === 'object' ? s.id : Number(s);
                    if (sId)
                        linkSkillStmt.run(id, sId, 1);
                }
            }
            res.json({ success: true, message: 'Project updated successfully' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { status } = req.body;
            const validStatuses = ['open', 'paused', 'completed', 'cancelled', 'in_progress'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ success: false, message: 'Invalid project status' });
                return;
            }
            const existing = connection_js_1.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            if (req.user?.role !== 'admin' && existing.client_id !== req.user?.id) {
                res.status(403).json({ success: false, message: 'Not authorized to change project status' });
                return;
            }
            connection_js_1.db.prepare('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
            res.json({ success: true, message: `Project status updated to ${status}` });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const existing = connection_js_1.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            if (req.user?.role !== 'admin' && existing.client_id !== req.user?.id) {
                res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
                return;
            }
            connection_js_1.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
            res.json({ success: true, message: 'Project deleted successfully' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.ProjectController = ProjectController;
