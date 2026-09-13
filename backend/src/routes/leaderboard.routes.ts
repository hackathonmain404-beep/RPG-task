import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';
import * as leaderboardController from '../controllers/leaderboard.controller.js';

export const leaderboardRouter = Router();

/**
 * Optional Auth Middleware:
 * If a valid token is provided in Authorization header or cookie,
 * attach the user to req.user so their rank can be highlighted.
 * Does not block unauthenticated users.
 */
function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies) {
    token = req.cookies.token || req.cookies.session;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as {
        userId?: string;
        id?: string;
        email?: string;
        role?: string;
      };
      const id = decoded.userId || decoded.id;
      if (id) {
        req.user = {
          id,
          email: decoded.email || '',
          role: decoded.role || 'USER',
        };
      }
    } catch {
      // Invalid/expired token — proceed anonymously
    }
  }

  next();
}

leaderboardRouter.get('/', optionalAuth, leaderboardController.getLeaderboard);
