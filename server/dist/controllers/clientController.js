"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const connection_js_1 = require("../db/connection.js");
const recommendationService_js_1 = require("../services/recommendationService.js");
class ClientController {
    static async getDashboard(req, res) {
        try {
            if (!req.user || req.user.role !== 'client') {
                res.status(403).json({ success: false, message: 'Client access required' });
                return;
            }
            // Fetch client projects
            const projectsStmt = connection_js_1.db.prepare(`
        SELECT p.*,
          (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as proposals_count,
          (SELECT COUNT(*) FROM applications WHERE project_id = p.id AND status = 'accepted') as hired_count
        FROM projects p
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `);
            const projects = projectsStmt.all(req.user.id);
            // Attach skills
            const skillStmt = connection_js_1.db.prepare(`
        SELECT s.id, s.name, s.category, prs.is_mandatory
        FROM project_required_skills prs
        JOIN skills s ON prs.skill_id = s.id
        WHERE prs.project_id = ?
      `);
            for (const p of projects) {
                p.required_skills = skillStmt.all(p.id);
            }
            // Aggregate Stats
            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in_progress').length;
            const totalApplications = projects.reduce((acc, p) => acc + (p.proposals_count || 0), 0);
            const totalHired = projects.reduce((acc, p) => acc + (p.hired_count || 0), 0);
            res.json({
                success: true,
                data: {
                    stats: {
                        totalProjects,
                        activeProjects,
                        totalApplications,
                        totalHired
                    },
                    projects
                }
            });
        }
        catch (err) {
            console.error('Error fetching client dashboard:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getProfile(req, res) {
        try {
            const clientId = req.params.clientId ? parseInt(req.params.clientId, 10) : req.user?.id;
            if (!clientId) {
                res.status(400).json({ success: false, message: 'Client ID is required' });
                return;
            }
            const client = connection_js_1.db.prepare(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.phone,
               cp.id as profile_id, cp.company_name, cp.industry, cp.company_size,
               cp.website_url, cp.bio, cp.location, cp.is_verified
        FROM users u
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        WHERE u.id = ? AND u.role = 'client'
      `).get(clientId);
            if (!client) {
                res.status(404).json({ success: false, message: 'Client not found' });
                return;
            }
            // Fetch reviews received
            const reviews = connection_js_1.db.prepare(`
        SELECT r.*, u.first_name || ' ' || u.last_name as reviewer_name, u.avatar_url as reviewer_avatar,
               p.title as project_title
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        JOIN projects p ON r.project_id = p.id
        WHERE r.reviewee_id = ?
        ORDER BY r.created_at DESC
      `).all(clientId);
            const avgRating = reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : null;
            res.json({
                success: true,
                data: {
                    ...client,
                    reviews,
                    rating: avgRating
                }
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user || req.user.role !== 'client')
                return;
            const { first_name, last_name, company_name, industry, company_size, website_url, bio, location, phone } = req.body;
            connection_js_1.db.prepare(`
        UPDATE users SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(first_name?.trim(), last_name?.trim(), phone?.trim(), req.user.id);
            connection_js_1.db.prepare(`
        UPDATE client_profiles SET
          company_name = COALESCE(?, company_name),
          industry = COALESCE(?, industry),
          company_size = COALESCE(?, company_size),
          website_url = COALESCE(?, website_url),
          bio = COALESCE(?, bio),
          location = COALESCE(?, location),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(company_name?.trim(), industry?.trim(), company_size?.trim(), website_url?.trim(), bio?.trim(), location?.trim(), req.user.id);
            res.json({ success: true, message: 'Client profile updated successfully' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    /**
     * BONUS CHALLENGE:
     * Recommends and ranks student candidates for a specific project
     */
    static async getCandidateMatches(req, res) {
        try {
            const projectId = parseInt(req.params.projectId, 10);
            const project = connection_js_1.db.prepare('SELECT client_id FROM projects WHERE id = ?').get(projectId);
            if (!project) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            // Check client authorization
            if (req.user?.role !== 'admin' && project.client_id !== req.user?.id) {
                res.status(403).json({ success: false, message: 'Not authorized to view candidates for this project' });
                return;
            }
            const candidates = recommendationService_js_1.RecommendationService.getRankedCandidateStudentsForProject(projectId);
            res.json({ success: true, data: candidates });
        }
        catch (err) {
            console.error('Candidate match error:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.ClientController = ClientController;
