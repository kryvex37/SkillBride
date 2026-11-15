"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_js_1 = require("../middleware/upload.js");
const auth_js_1 = require("../middleware/auth.js");
const connection_js_1 = require("../db/connection.js");
const router = (0, express_1.Router)();
router.post('/avatar', auth_js_1.authenticateToken, upload_js_1.upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        connection_js_1.db.prepare('UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fileUrl, req.user.id);
        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: fileUrl
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'File upload error' });
    }
});
router.post('/portfolio-image', auth_js_1.authenticateToken, upload_js_1.upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: fileUrl
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'File upload error' });
    }
});
exports.default = router;
