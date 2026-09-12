import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import { getJwtSecret } from '../utils/jwt.js';
import { tokenBlocklist } from '../utils/tokenBlocklist.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check cookies if header absent
  if (!token && req.cookies) {
    token = req.cookies.token || req.cookies.session;
  }

  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication token required.'));
    return;
  }

  if (tokenBlocklist.isRevoked(token)) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication token has been revoked.'));
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.'));
  }
}
