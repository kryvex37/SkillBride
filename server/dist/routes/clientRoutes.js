"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_js_1 = require("../controllers/clientController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('client'), clientController_js_1.ClientController.getDashboard);
router.get('/profile', auth_js_1.authenticateToken, clientController_js_1.ClientController.getProfile);
router.get('/profile/:clientId', clientController_js_1.ClientController.getProfile);
router.put('/profile', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('client'), clientController_js_1.ClientController.updateProfile);
// BONUS: Candidate matches for a client's project
router.get('/projects/:projectId/candidates', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)('client', 'admin'), clientController_js_1.ClientController.getCandidateMatches);
exports.default = router;
