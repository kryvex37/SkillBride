"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const connection_js_1 = require("../db/connection.js");
const notificationService_js_1 = require("../services/notificationService.js");
class ReviewController {
    static async createReview(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }
            const { project_id, reviewee_id, rating, comment } = req.body;
            if (!project_id || !reviewee_id || rating === undefined) {
                res.status(400).json({ success: false, message: 'Project ID, reviewee ID, and rating are required' });
                return;
            }
            const ratingNum = parseInt(rating, 10);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5 stars' });
                return;
            }
            // Check project
            const project = connection_js_1.db.prepare('SELECT id, title, client_id, status FROM projects WHERE id = ?').get(project_id);
            if (!project) {
                res.status(404).json({ success: false, message: 'Project not found' });
                return;
            }
            // Determine reviewer role and validity
            let reviewerRole;
            if (req.user.id === project.client_id) {
                reviewerRole = 'client';
                // Verify reviewee is an accepted student for this project
                const acceptedApp = connection_js_1.db.prepare('SELECT id FROM applications WHERE project_id = ? AND student_id = ? AND (status = "accepted" OR status = "completed")').get(project_id, reviewee_id);
                if (!acceptedApp) {
                    res.status(400).json({ success: false, message: 'You can only review students who have worked on or completed this project' });
                    return;
                }
            }
            else {
                reviewerRole = 'student';
                // Verify student worked on this project
                const myApp = connection_js_1.db.prepare('SELECT id FROM applications WHERE project_id = ? AND student_id = ? AND (status = "accepted" OR status = "completed")').get(project_id, req.user.id);
                if (!myApp || reviewee_id !== project.client_id) {
                    res.status(400).json({ success: false, message: 'You can only review the client of a project you were hired for' });
                    return;
                }
            }
            // Check duplicate review
            const existing = connection_js_1.db.prepare(`
        SELECT id FROM reviews 
        WHERE project_id = ? AND reviewer_id = ? AND reviewee_id = ?
      `).get(project_id, req.user.id, reviewee_id);
            if (existing) {
                res.status(400).json({ success: false, message: 'You have already submitted a review for this project' });
                return;
            }
            // Insert review
            const insertStmt = connection_js_1.db.prepare(`
        INSERT INTO reviews (project_id, reviewer_id, reviewee_id, reviewer_role, rating, comment)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
            insertStmt.run(project_id, req.user.id, reviewee_id, reviewerRole, ratingNum, comment?.trim() || '');
            // Notify reviewee
            const reviewerName = `${req.user.first_name} ${req.user.last_name}`;
            notificationService_js_1.NotificationService.createNotification(reviewee_id, 'new_review', '⭐ New Review Received', `${reviewerName} gave you a ${ratingNum}-star review for project "${project.title}"!`, reviewerRole === 'student' ? '/client/dashboard' : '/student/profile');
            res.status(201).json({
                success: true,
                message: 'Review submitted successfully!'
            });
        }
        catch (err) {
            console.error('Error creating review:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getUserReviews(req, res) {
        try {
            const userId = parseInt(req.params.userId, 10);
            const stmt = connection_js_1.db.prepare(`
        SELECT r.*, 
               u.first_name || ' ' || u.last_name as reviewer_name,
               u.avatar_url as reviewer_avatar,
               p.title as project_title
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        JOIN projects p ON r.project_id = p.id
        WHERE r.reviewee_id = ?
        ORDER BY r.created_at DESC
      `);
            const reviews = stmt.all(userId);
            const avg = reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : null;
            res.json({
                success: true,
                data: {
                    reviews,
                    averageRating: avg,
                    totalCount: reviews.length
                }
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.ReviewController = ReviewController;
