import { Request, Response, NextFunction } from 'express';
import { sendMagicLinkSchema, verifyMagicLinkSchema } from '../schemas/magicLink.schema.js';
import * as magicLinkService from '../services/magicLink.service.js';

/**
 * POST /api/auth/magic-link
 * Initiates the Magic Link login/signup flow.
 */
export async function send(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = sendMagicLinkSchema.parse(req.body);
    const result = await magicLinkService.sendMagicLink(input.email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET or POST /api/auth/magic-link/verify
 * Validates the single-use token and issues an authenticated session.
 */
export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tokenParam = (req.query.token as string) || req.body?.token;
    const input = verifyMagicLinkSchema.parse({ token: tokenParam });
    const result = await magicLinkService.verifyMagicLink(input.token);

    // Also set HTTP-only cookie if supported
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
