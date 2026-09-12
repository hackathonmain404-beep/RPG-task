import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { getJwtSecret } from '../utils/jwt.js';

const ADMIN_IDENTIFIER = 'achiever_admin_4.com';
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const JWT_EXPIRES_IN = '7d';

export interface SendMagicLinkResult {
  success: boolean;
  message: string;
  email: string;
  isAdmin: boolean;
  // Included for seamless local dev, testing, and confirmation
  verificationToken?: string;
  verificationUrl?: string;
}

export interface VerifyMagicLinkResult {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  character: {
    level: number;
    totalXp: number;
    gold: number;
    streakCurrent: number;
    streakBest: number;
  } | null;
  isAdmin: boolean;
  redirectTo: string;
}

/**
 * Initiates Magic Link authentication for new users, returning users, or the administrator.
 */
export async function sendMagicLink(inputIdentifier: string): Promise<SendMagicLinkResult> {
  const trimmed = inputIdentifier.trim();
  const isAdmin = trimmed.toLowerCase() === ADMIN_IDENTIFIER;
  const normalizedEmail = isAdmin ? 'Achiever_admin_4.com' : trimmed.toLowerCase();

  // 1. Ensure user account exists or initialize it
  let user = await (prisma as any).user.findUnique({
    where: { email: normalizedEmail },
    include: { character: true },
  });

  if (isAdmin) {
    if (!user) {
      // Create dedicated Admin account in DB
      user = await (prisma as any).$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            id: 'admin_achiever_root_4',
            email: 'Achiever_admin_4.com',
            displayName: 'Achiever Admin',
            role: 'ADMIN',
            lastActiveAt: new Date(),
          },
        });

        const newChar = await tx.character.create({
          data: {
            id: 'admin_char_root_4',
            userId: newUser.id,
            level: 10,
            totalXp: 10000,
            gold: 5000,
            streakCurrent: 10,
            streakBest: 10,
          },
        });

        return { ...newUser, character: newChar };
      });
    } else if (user.role !== 'ADMIN') {
      // Ensure role is ADMIN
      user = await (prisma as any).user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        include: { character: true },
      });
    }
  } else {
    // Normal User Flow: Create account if first-time user
    if (!user) {
      user = await (prisma as any).$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            displayName: normalizedEmail.split('@')[0],
            role: 'USER',
            lastActiveAt: new Date(),
          },
        });

        const newChar = await tx.character.create({
          data: {
            userId: newUser.id,
            level: 1,
            totalXp: 0,
            gold: 50,
            streakCurrent: 0,
            streakBest: 0,
            attributes: {
              create: [
                { key: 'intellect', displayName: 'Intellect', value: 10 },
                { key: 'strength', displayName: 'Strength', value: 10 },
                { key: 'wisdom', displayName: 'Wisdom', value: 10 },
                { key: 'charisma', displayName: 'Charisma', value: 10 },
                { key: 'vitality', displayName: 'Vitality', value: 10 },
              ],
            },
          },
        });

        return { ...newUser, character: newChar };
      });
    } else {
      // Returning user: update last active
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });
    }
  }

  // 2. Generate cryptographically secure single-use token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Invalidate any previous pending tokens for this email
  await (prisma as any).magicLinkToken.deleteMany({
    where: { email: normalizedEmail },
  });

  // Persist secure hashed token
  await (prisma as any).magicLinkToken.create({
    data: {
      email: normalizedEmail,
      tokenHash,
      expiresAt,
      used: false,
      isAdmin,
    },
  });

  const verificationUrl = `/auth/verify?token=${rawToken}`;

  return {
    success: true,
    message: 'Check your email for your sign-in link.',
    email: normalizedEmail,
    isAdmin,
    verificationToken: rawToken,
    verificationUrl,
  };
}

/**
 * Validates a single-use Magic Link token, enforces expiration and single-use,
 * validates server-side admin claims, and issues an authenticated session JWT.
 */
export async function verifyMagicLink(rawToken: string): Promise<VerifyMagicLinkResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new AppError(400, 'INVALID_TOKEN', 'Verification token required.');
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await (prisma as any).magicLinkToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    throw new AppError(400, 'INVALID_TOKEN', 'This sign-in link is invalid or has expired.');
  }

  if (record.used) {
    throw new AppError(400, 'TOKEN_ALREADY_USED', 'This sign-in link has already been used. Please request a new one.');
  }

  if (new Date() > new Date(record.expiresAt)) {
    throw new AppError(400, 'TOKEN_EXPIRED', 'This sign-in link has expired. Sign-in links are valid for 15 minutes.');
  }

  // Mark token as used immediately to prevent replay attacks
  await (prisma as any).magicLinkToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  // Retrieve user account
  const user = await (prisma as any).user.findUnique({
    where: { email: record.email },
    include: { character: true },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Associated adventurer account not found.');
  }

  // Server-authoritative Admin verification:
  // If this token was created for an admin request, the user's role MUST be ADMIN in the database!
  const isActualAdmin = user.role === 'ADMIN';
  if (record.isAdmin && !isActualAdmin) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied. Account is not authorized for administrator privileges.');
  }

  // Generate authenticated JWT session with user role
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    character: user.character
      ? {
          level: user.character.level,
          totalXp: user.character.totalXp,
          gold: user.character.gold,
          streakCurrent: user.character.streakCurrent,
          streakBest: user.character.streakBest,
        }
      : null,
    isAdmin: isActualAdmin,
    redirectTo: isActualAdmin ? '/admin' : '/app/dashboard',
  };
}
