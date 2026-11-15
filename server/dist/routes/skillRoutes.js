"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skillController_js_1 = require("../controllers/skillController.js");
const router = (0, express_1.Router)();
router.get('/', skillController_js_1.SkillController.getAll);
router.get('/categories', skillController_js_1.SkillController.getCategories);
exports.default = router;
