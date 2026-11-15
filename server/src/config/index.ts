import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  jwtSecret: process.env.JWT_SECRET || 'skillbridge-super-secure-capstone-jwt-secret-key-2026',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'skillbridge.db'),
  uploadDir: path.resolve(process.cwd(), 'uploads'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};
