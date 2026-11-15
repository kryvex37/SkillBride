"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_js_1 = require("../db/connection.js");
const index_js_1 = require("../config/index.js");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, role, first_name, last_name, university, department, student_id, company_name } = req.body;
            if (!email || !password || !role || !first_name || !last_name) {
                res.status(400).json({ success: false, message: 'Missing required registration fields' });
                return;
            }
            if (!['student', 'client'].includes(role)) {
                res.status(400).json({ success: false, message: 'Invalid role. Must be either student or client.' });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
                return;
            }
            // Check existing email
            const existingUserStmt = connection_js_1.db.prepare('SELECT id FROM users WHERE email = ?');
            const existingUser = existingUserStmt.get(email.toLowerCase().trim());
            if (existingUser) {
                res.status(400).json({ success: false, message: 'An account with this email address already exists' });
                return;
            }
            const passwordHash = bcryptjs_1.default.hashSync(password, 10);
            // Default avatars based on role/gender or initials
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(first_name + ' ' + last_name)}`;
            // Insert User
            const insertUserStmt = connection_js_1.db.prepare(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `);
            const userResult = insertUserStmt.run(email.toLowerCase().trim(), passwordHash, role, first_name.trim(), last_name.trim(), defaultAvatar);
            const userId = Number(userResult.lastInsertRowid);
            // Create linked profile
            if (role === 'student') {
                const studentProfileStmt = connection_js_1.db.prepare(`
          INSERT INTO student_profiles (user_id, university, department, student_id, experience_level, profile_completed)
          VALUES (?, ?, ?, ?, 'entry', 20)
        `);
                studentProfileStmt.run(userId, university || '', department || '', student_id || '');
            }
            else if (role === 'client') {
                const clientProfileStmt = connection_js_1.db.prepare(`
          INSERT INTO client_profiles (user_id, company_name, location, is_verified)
          VALUES (?, ?, 'Remote', 1)
        `);
                clientProfileStmt.run(userId, company_name || `${first_name}'s Venture`);
            }
            const token = jsonwebtoken_1.default.sign({ id: userId, email: email.toLowerCase().trim(), role }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: userId,
                    email: email.toLowerCase().trim(),
                    role,
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    avatar_url: defaultAvatar
                }
            });
        }
        catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, message: 'Please provide both email and password' });
                return;
            }
            const userStmt = connection_js_1.db.prepare('SELECT * FROM users WHERE email = ?');
            const user = userStmt.get(email.toLowerCase().trim());
            if (!user) {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
                return;
            }
            const isMatch = bcryptjs_1.default.compareSync(password, user.password_hash);
            if (!isMatch) {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
                return;
            }
            if (user.status === 'suspended') {
                res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact platform administration.' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
            // Fetch profile extra info
            let profileInfo = null;
            if (user.role === 'student') {
                const spStmt = connection_js_1.db.prepare('SELECT * FROM student_profiles WHERE user_id = ?');
                profileInfo = spStmt.get(user.id);
            }
            else if (user.role === 'client') {
                const cpStmt = connection_js_1.db.prepare('SELECT * FROM client_profiles WHERE user_id = ?');
                profileInfo = cpStmt.get(user.id);
            }
            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar_url: user.avatar_url,
                    status: user.status,
                    profile: profileInfo
                }
            });
        }
        catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ success: false, message: err.message || 'Server error during login' });
        }
    }
    static async me(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }
            let profile = null;
            if (req.user.role === 'student') {
                const spStmt = connection_js_1.db.prepare('SELECT * FROM student_profiles WHERE user_id = ?');
                profile = spStmt.get(req.user.id);
            }
            else if (req.user.role === 'client') {
                const cpStmt = connection_js_1.db.prepare('SELECT * FROM client_profiles WHERE user_id = ?');
                profile = cpStmt.get(req.user.id);
            }
            res.json({
                success: true,
                user: {
                    ...req.user,
                    profile
                }
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        const userStmt = connection_js_1.db.prepare('SELECT id, first_name FROM users WHERE email = ?');
        const user = userStmt.get(email.toLowerCase().trim());
        if (!user) {
            // Security best practice: don't reveal whether user exists
            res.json({ success: true, message: 'If that email exists in our system, password reset instructions have been dispatched.' });
            return;
        }
        // In a live system, sends a reset token email. For this capstone, generate a reset confirmation:
        res.json({
            success: true,
            message: `Password reset link dispatched for ${email}. (Demo reset token generated successfully).`
        });
    }
}
exports.AuthController = AuthController;
