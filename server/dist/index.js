"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./config/index.js");
const connection_js_1 = require("./db/connection.js");
// Import Routes
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const projectRoutes_js_1 = __importDefault(require("./routes/projectRoutes.js"));
const studentRoutes_js_1 = __importDefault(require("./routes/studentRoutes.js"));
const clientRoutes_js_1 = __importDefault(require("./routes/clientRoutes.js"));
const applicationRoutes_js_1 = __importDefault(require("./routes/applicationRoutes.js"));
const reviewRoutes_js_1 = __importDefault(require("./routes/reviewRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const skillRoutes_js_1 = __importDefault(require("./routes/skillRoutes.js"));
const reportRoutes_js_1 = __importDefault(require("./routes/reportRoutes.js"));
const uploadRoutes_js_1 = __importDefault(require("./routes/uploadRoutes.js"));
const app = (0, express_1.default)();
// Initialize database schema
(0, connection_js_1.initDatabase)();
// Middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads serving
app.use('/uploads', express_1.default.static(index_js_1.config.uploadDir));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'SkillBridge Backend API' });
});
// API Routes
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/projects', projectRoutes_js_1.default);
app.use('/api/students', studentRoutes_js_1.default);
app.use('/api/clients', clientRoutes_js_1.default);
app.use('/api/applications', applicationRoutes_js_1.default);
app.use('/api/reviews', reviewRoutes_js_1.default);
app.use('/api/admin', adminRoutes_js_1.default);
app.use('/api/notifications', notificationRoutes_js_1.default);
app.use('/api/skills', skillRoutes_js_1.default);
app.use('/api/reports', reportRoutes_js_1.default);
app.use('/api/uploads', uploadRoutes_js_1.default);
// Error Handling Middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled Application Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected error occurred on the server.'
    });
});
app.listen(index_js_1.config.port, () => {
    console.log(`===============================================`);
    console.log(`🚀 SkillBridge Server running on http://localhost:${index_js_1.config.port}`);
    console.log(`📁 Uploads served from ${index_js_1.config.uploadDir}`);
    console.log(`===============================================`);
});
exports.default = app;
