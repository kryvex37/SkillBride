"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const connection_js_1 = require("../db/connection.js");
class SkillController {
    static async getAll(_req, res) {
        try {
            const skills = connection_js_1.db.prepare('SELECT * FROM skills ORDER BY name ASC').all();
            res.json({ success: true, data: skills });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
    static async getCategories(_req, res) {
        try {
            const categories = connection_js_1.db.prepare('SELECT DISTINCT category FROM skills ORDER BY category ASC').all();
            res.json({ success: true, data: categories.map((c) => c.category) });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message || 'Server error' });
        }
    }
}
exports.SkillController = SkillController;
