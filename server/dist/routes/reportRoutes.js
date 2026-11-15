"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_js_1 = require("../controllers/reportController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/', auth_js_1.authenticateToken, reportController_js_1.ReportController.submitReport);
exports.default = router;
