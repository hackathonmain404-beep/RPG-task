import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';
import { AppError } from '../utils/errors.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await authService.registerUser(validated);

    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(201).json({
      user: result.user,
      character: result.character,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.loginUser(validated);

    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(200).json({
      user: result.user,
      character: result.character,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie('token', CLEAR_COOKIE_OPTIONS);
    res.clearCookie('session', CLEAR_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

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
