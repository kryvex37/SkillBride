"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_js_1 = require("../controllers/projectController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public / browse with optional personalization
router.get('/', auth_js_1.optionalAuth, projectController_js_1.ProjectController.getAll);
router.get('/:id', auth_js_1.optionalAuth, projectController_js_1.ProjectController.getById);
// Protected mutations
router.post('/', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('client'), projectController_js_1.ProjectController.create);
router.put('/:id', auth_js_1.authenticateToken, projectController_js_1.ProjectController.update);
router.patch('/:id/status', auth_js_1.authenticateToken, projectController_js_1.ProjectController.updateStatus);
router.delete('/:id', auth_js_1.authenticateToken, projectController_js_1.ProjectController.delete);
exports.default = router;
