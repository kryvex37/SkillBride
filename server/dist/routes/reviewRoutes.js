"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_js_1 = require("../controllers/reviewController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/', auth_js_1.authenticateToken, reviewController_js_1.ReviewController.createReview);
router.get('/user/:userId', reviewController_js_1.ReviewController.getUserReviews);
exports.default = router;
