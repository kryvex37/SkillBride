"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const connection_js_1 = require("../db/connection.js");
const notificationService_js_1 = require("../services/notificationService.js");
class ApplicationController {
    static async apply(req, res) {
        try {
            if (!req.user || req.user.role !== 'student') {
                res.status(403).json({ success: false, message: 'Only registered students can apply for projects' });
                return;
            }
            const { project_id, cover_letter, proposed_rate, delivery_time, relevant_experience, portfolio_item_ids } = req.body;
            if (!project_id || !cover_letter || proposed_rate === undefined || !delivery_time) {
                res.status(400).json({ success: false, message: 'Project ID, cover letter, proposed rate, and delivery time are required' });
                return;
            }
            // Check project exists and is open
            const project = connection_js_1.db.prepare('SELECT id, client_id, title, status FROM projects WHERE id = ?').get(project_id);
            if (!project) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            if (project.status !== 'open') {
                res.status(400).json({ success: false, message: `Cannot apply: This project is currently ${project.status}` });
                return;
            }
            // Check duplicate application
            const existing = connection_js_1.db.prepare('SELECT id FROM applications WHERE project_id = ? AND student_id = ?').get(project_id, req.user.id);
            if (existing) {
                res.status(400).json({ success: false, message: 'You have already submitted an application for this project' });
                return;
            }
            // Insert Application
            const insertStmt = connection_js_1.db.prepare(`
        INSERT INTO applications (
          project_id, student_id, cover_letter, proposed_rate, delivery_time,
          relevant_experience, portfolio_item_ids, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `);
            const result = insertStmt.run(project_id, req.user.id, cover_letter.trim(), parseFloat(proposed_rate), delivery_time.trim(), relevant_experience?.trim() || '', Array.isArray(portfolio_item_ids) ? portfolio_item_ids.join(',') : (portfolio_item_ids || ''));
            const applicationId = Number(result.lastInsertRowid);
            // Record in status history
            connection_js_1.db.prepare(`
        INSERT INTO application_status_history (application_id, previous_status, new_status, note, changed_by)
        VALUES (?, NULL, 'pending', 'Application submitted by student', ?)
      `).run(applicationId, req.user.id);
            // Notify Client
            const studentName = `${req.user.first_name} ${req.user.last_name}`;
            notificationService_js_1.NotificationService.createNotification(project.client_id, 'application_submitted', 'New Application Received', `${studentName} applied for your project "${project.title}"`, `/client/projects/${project.id}/applications`);
            res.status(201).json({
                success: true,
                message: 'Your application has been submitted successfully!',
                applicationId
            });
        }
        catch (err) {
            console.error('Apply error:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getStudentApplications(req, res) {
        try {
            if (!req.user || req.user.role !== 'student') {
                res.status(403).json({ success: false, message: 'Student access required' });
                return;
            }
            const stmt = connection_js_1.db.prepare(`
        SELECT 
          a.id, a.project_id, a.student_id, a.cover_letter, a.proposed_rate, a.delivery_time,
          a.relevant_experience, a.status, a.created_at, a.updated_at,
          p.title as project_title, p.category as project_category, p.budget as project_budget,
          p.budget_type as project_budget_type, p.status as project_status, p.deadline as project_deadline,
          u.first_name || ' ' || u.last_name as client_name,
          cp.company_name as client_company,
          cp.location as client_location
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        JOIN users u ON p.client_id = u.id
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        WHERE a.student_id = ?
        ORDER BY a.created_at DESC
      `);
            const applications = stmt.all(req.user.id);
            // Fetch status history for each
            const historyStmt = connection_js_1.db.prepare(`
        SELECT ash.*, u.first_name || ' ' || u.last_name as changed_by_name
        FROM application_status_history ash
        JOIN users u ON ash.changed_by = u.id
        WHERE ash.application_id = ?
        ORDER BY ash.created_at ASC
      `);
            for (const app of applications) {
                app.history = historyStmt.all(app.id);
            }
            res.json({ success: true, data: applications });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getProjectApplications(req, res) {
        try {
            const projectId = parseInt(req.params.projectId, 10);
            const project = connection_js_1.db.prepare('SELECT client_id, title FROM projects WHERE id = ?').get(projectId);
            if (!project) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            if (req.user?.role !== 'admin' && project.client_id !== req.user?.id) {
                res.status(403).json({ success: false, message: 'Unauthorized to view applications for this project' });
                return;
            }
            const stmt = connection_js_1.db.prepare(`
        SELECT 
          a.*,
          u.first_name || ' ' || u.last_name as student_name,
          u.email as student_email,
          u.avatar_url as student_avatar,
          sp.id as student_profile_id,
          sp.university as student_university,
          sp.department as student_department,
          sp.experience_level as student_experience_level,
          sp.bio as student_bio,
          sp.github_url as student_github,
          sp.linkedin_url as student_linkedin
        FROM applications a
        JOIN users u ON a.student_id = u.id
        LEFT JOIN student_profiles sp ON sp.user_id = u.id
        WHERE a.project_id = ?
        ORDER BY a.created_at DESC
      `);
            const applications = stmt.all(projectId);
            // Fetch student skills and history for each
            const skillStmt = connection_js_1.db.prepare(`
        SELECT s.name, ss.proficiency, ss.years_of_experience
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_profile_id = ?
      `);
            const historyStmt = connection_js_1.db.prepare(`
        SELECT ash.*, u.first_name || ' ' || u.last_name as changed_by_name
        FROM application_status_history ash
        JOIN users u ON ash.changed_by = u.id
        WHERE ash.application_id = ?
        ORDER BY ash.created_at ASC
      `);
            for (const app of applications) {
                if (app.student_profile_id) {
                    app.student_skills = skillStmt.all(app.student_profile_id);
                }
                else {
                    app.student_skills = [];
                }
                app.history = historyStmt.all(app.id);
            }
            res.json({ success: true, data: applications });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { status, note } = req.body;
            const validStatuses = ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'completed'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ success: false, message: 'Invalid application status' });
                return;
            }
            const appStmt = connection_js_1.db.prepare(`
        SELECT a.*, p.title as project_title, p.client_id
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        WHERE a.id = ?
      `);
            const application = appStmt.get(id);
            if (!application) {
                res.status(404).json({ success: false, message: 'Application not found' });
                return;
            }
            // Check authorization
            const isClientOwner = application.client_id === req.user?.id;
            const isStudentOwner = application.student_id === req.user?.id;
            const isAdmin = req.user?.role === 'admin';
            if (!isAdmin) {
                if (isStudentOwner && status !== 'withdrawn') {
                    res.status(403).json({ success: false, message: 'Students can only withdraw their own application' });
                    return;
                }
                if (!isClientOwner && !isStudentOwner) {
                    res.status(403).json({ success: false, message: 'Unauthorized to modify this application' });
                    return;
                }
            }
            const previousStatus = application.status;
            // Update Application status
            connection_js_1.db.prepare(`
        UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, id);
            // Record History
            connection_js_1.db.prepare(`
        INSERT INTO application_status_history (application_id, previous_status, new_status, note, changed_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, previousStatus, status, note || `Status changed from ${previousStatus} to ${status}`, req.user.id);
            // If accepted, set project status to in_progress
            if (status === 'accepted') {
                connection_js_1.db.prepare('UPDATE projects SET status = "in_progress", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(application.project_id);
            }
            // Notifications
            if (isClientOwner || isAdmin) {
                let notifType = `application_${status}`;
                let notifTitle = `Application ${status.replace('_', ' ').toUpperCase()}`;
                let notifMsg = `Your application for "${application.project_title}" has been updated to ${status}.`;
                if (status === 'accepted') {
                    notifTitle = '🎉 Congratulations! You have been Hired!';
                    notifMsg = `Your proposal for "${application.project_title}" was accepted! Start collaborating with the client.`;
                }
                else if (status === 'shortlisted') {
                    notifTitle = '⭐ You Have Been Shortlisted!';
                    notifMsg = `The client shortlisted your proposal for "${application.project_title}".`;
                }
                else if (status === 'completed') {
                    notifTitle = '✅ Project Completed';
                    notifMsg = `The client marked "${application.project_title}" as completed. Please review your experience!`;
                }
                notificationService_js_1.NotificationService.createNotification(application.student_id, notifType, notifTitle, notifMsg, '/student/applications');
            }
            res.json({ success: true, message: `Application status updated to ${status}` });
        }
        catch (err) {
            console.error('Update status error:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.ApplicationController = ApplicationController;
