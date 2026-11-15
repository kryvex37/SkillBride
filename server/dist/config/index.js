"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5050', 10),
    jwtSecret: process.env.JWT_SECRET || 'skillbridge-super-secure-capstone-jwt-secret-key-2026',
    jwtExpiresIn: '7d',
    dbPath: process.env.DB_PATH || path_1.default.resolve(process.cwd(), 'skillbridge.db'),
    uploadDir: path_1.default.resolve(process.cwd(), 'uploads'),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};
