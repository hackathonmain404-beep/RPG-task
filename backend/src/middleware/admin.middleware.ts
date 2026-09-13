import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { requireAuth } from './auth.middleware.js';

/**
 * Middleware that verifies the authenticated session has administrator privileges.
 * Performs server-side verification against the PostgreSQL User table.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // Enforce base authentication first
  requireAuth(req, res, async (authErr) => {
    if (authErr) {
      return next(authErr);
    }

    try {
      if (!req.user || !req.user.id) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
      }

      // Query database for authoritative role verification
      const userRecord = await (prisma as any).user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true },
      });

      if (!userRecord || userRecord.role !== 'ADMIN') {
        return next(
          new AppError(403, 'FORBIDDEN', 'Access denied. Administrator privileges required.')
        );
      }

      req.user.role = 'ADMIN';
      next();
    } catch (err) {
      next(err);
    }
  });
}
