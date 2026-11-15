"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_js_1 = require("../controllers/adminController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All admin routes require admin role
router.use(auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('admin'));
router.get('/overview', adminController_js_1.AdminController.getOverview);
router.get('/users', adminController_js_1.AdminController.getUsers);
router.patch('/users/:id/status', adminController_js_1.AdminController.toggleUserStatus);
router.delete('/projects/:id', adminController_js_1.AdminController.deleteProject);
router.get('/reviews', adminController_js_1.AdminController.getAllReviews);
router.delete('/reviews/:id', adminController_js_1.AdminController.deleteReview);
router.get('/reports', adminController_js_1.AdminController.getReports);
router.patch('/reports/:id/resolve', adminController_js_1.AdminController.resolveReport);
exports.default = router;
