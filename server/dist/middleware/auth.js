"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const connection_js_1 = require("../db/connection.js");
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
        const userStmt = connection_js_1.db.prepare('SELECT id, email, role, first_name, last_name, avatar_url, phone, status, created_at, updated_at FROM users WHERE id = ?');
        const user = userStmt.get(decoded.id);
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found or deleted' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
    }
}
function optionalAuth(req, _res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
        const userStmt = connection_js_1.db.prepare('SELECT id, email, role, first_name, last_name, avatar_url, phone, status, created_at, updated_at FROM users WHERE id = ?');
        const user = userStmt.get(decoded.id);
        if (user && user.status === 'active') {
            req.user = user;
        }
    }
    catch {
        // Ignore invalid token in optional auth
    }
    next();
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: This action requires one of the following roles: [${roles.join(', ')}]`
            });
            return;
        }
        next();
    };
}
