"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const node_sqlite_1 = require("node:sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../config/index.js");
// Ensure upload directory exists
if (!fs_1.default.existsSync(index_js_1.config.uploadDir)) {
    fs_1.default.mkdirSync(index_js_1.config.uploadDir, { recursive: true });
}
// Ensure database directory exists
const dbDir = path_1.default.dirname(index_js_1.config.dbPath);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
exports.db = new node_sqlite_1.DatabaseSync(index_js_1.config.dbPath);
// Enable WAL mode and foreign keys
exports.db.exec('PRAGMA journal_mode = WAL;');
exports.db.exec('PRAGMA foreign_keys = ON;');
// Initialize Schema
function initDatabase() {
    const schemaPath = path_1.default.resolve(__dirname, 'schema.sql');
    if (fs_1.default.existsSync(schemaPath)) {
        const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
        exports.db.exec(schemaSql);
    }
}
// Initialize on import
initDatabase();
