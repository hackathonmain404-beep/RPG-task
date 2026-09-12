import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { syncSchema, registerSchema, loginSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';
import { AppError } from '../utils/errors.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Initialize Supabase admin client for getting user metadata
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * POST /api/auth/register
 * Legacy / test endpoint for automated test suites
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerUser(input);

    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.cookie('session', result.token, COOKIE_OPTIONS);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Legacy / test endpoint for automated test suites
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);

    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.cookie('session', result.token, COOKIE_OPTIONS);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/sync
 * Called by the frontend after Supabase OAuth completes.
 * Syncs the authenticated user into our Prisma database.
 */
export async function sync(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const input = syncSchema.parse(req.body);

    // Get user metadata from Supabase (display name, avatar, github username, etc.)
    let userMetadata: { full_name?: string; user_name?: string; avatar_url?: string; name?: string } | undefined;
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(req.user.id);
        if (data.user) {
          userMetadata = {
            full_name: data.user.user_metadata?.full_name,
            user_name: data.user.user_metadata?.user_name,
            avatar_url: data.user.user_metadata?.avatar_url,
            name: data.user.user_metadata?.name,
          };
        }
      } catch {
        // Metadata fetch failed — proceed without it
      }
    }

    const result = await authService.syncUser(
      req.user.id,
      req.user.email,
      input,
      userMetadata
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears server-side session cookies.
 */
export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const CLEAR_COOKIE_OPTIONS = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.clearCookie('token', CLEAR_COOKIE_OPTIONS);
    res.clearCookie('session', CLEAR_COOKIE_OPTIONS);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's data.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const result = await authService.getAuthMe(req.user.id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
