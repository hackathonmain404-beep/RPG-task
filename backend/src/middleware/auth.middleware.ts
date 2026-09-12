import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
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

// Initialize Supabase admin client (service role) for JWT verification
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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

  // Check if token has been revoked via logout
  if (tokenBlocklist.isRevoked(token)) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication token has been revoked.'));
    return;
  }

  // 3. First check if it's a locally signed JWT (used by automated tests & seed scripts)
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId?: string; id?: string; email?: string; sub?: string };
    const id = decoded.userId || decoded.id || decoded.sub;
    if (id) {
      req.user = {
        id,
        email: decoded.email || '',
      };
      return next();
    }
  } catch {
    // Not a local JWT or expired, try Supabase next
  }

  // 4. Verify Supabase JWT via Supabase Auth
  if (supabaseAdmin) {
    supabaseAdmin.auth.getUser(token).then(({ data, error }) => {
      if (error || !data.user) {
        next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.'));
        return;
      }

      req.user = {
        id: data.user.id,
        email: data.user.email || '',
      };
      next();
    }).catch(() => {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication verification failed.'));
    });
    return;
  }

  next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.'));
}
