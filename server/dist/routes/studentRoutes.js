"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_js_1 = require("../controllers/studentController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Profile view (public or by ID or logged in)
router.get('/profile', auth_js_1.authenticateToken, studentController_js_1.StudentController.getProfile);
router.get('/profile/:userId', studentController_js_1.StudentController.getProfile);
router.put('/profile', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.updateProfile);
// Skills
router.post('/skills', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.addSkill);
router.delete('/skills/:skillId', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.removeSkill);
// Portfolio items
router.post('/portfolio', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.addPortfolioItem);
router.put('/portfolio/:id', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.updatePortfolioItem);
router.delete('/portfolio/:id', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.deletePortfolioItem);
// Recommendations
router.get('/recommendations', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('student'), studentController_js_1.StudentController.getRecommendations);
exports.default = router;
