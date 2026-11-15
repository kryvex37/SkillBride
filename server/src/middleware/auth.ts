import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/connection.js';
import { User } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: User;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
    const userStmt = db.prepare('SELECT id, email, role, first_name, last_name, avatar_url, phone, status, created_at, updated_at FROM users WHERE id = ?');
    const user = userStmt.get(decoded.id) as User | undefined;

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or deleted' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
    const userStmt = db.prepare('SELECT id, email, role, first_name, last_name, avatar_url, phone, status, created_at, updated_at FROM users WHERE id = ?');
    const user = userStmt.get(decoded.id) as User | undefined;
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires one of the following roles: [${roles.join(', ')}]` 
      });
      return;
    }

    next();
  };
}
