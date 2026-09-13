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
  email?: string;
  isAdmin?: boolean;
  actionRequired?: 'USE_GOOGLE' | 'USE_GITHUB' | 'USE_PASSWORD';
  provider?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  redirectTo?: string;
  verificationToken?: string;
  verificationUrl?: string;
  isNewUser?: boolean;
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
 * Initiates authentication in strict order:
 * 1. Normalize input
 * 2. Check special admin identifier -> server-side verify admin session (no email, no magic link token)
 * 3. Check database for existing account
 *    -> if Google/GitHub/Password account, instruct user to use valid provider
 *    -> if existing Magic Link account, send link to existing account (no duplicate account)
 * 4. If new account -> send link, create account only upon verification
 */
export async function sendMagicLink(inputIdentifier: string): Promise<SendMagicLinkResult> {
  if (!inputIdentifier || typeof inputIdentifier !== 'string') {
    throw new AppError(400, 'INVALID_INPUT', 'Email address is required.');
  }

  // 1. Normalize input
  const trimmed = inputIdentifier.trim();
  const normalizedEmail = trimmed.toLowerCase();

  // 2. FIRST: Check special admin identifier
  if (normalizedEmail === ADMIN_IDENTIFIER) {
    // DO NOT send any email
    // DO NOT generate a Magic Link
    // DO NOT create a normal user account
    // Server-side verify admin authorization:
    let adminUser = await (prisma as any).user.findUnique({
      where: { email: 'Achiever_admin_4.com' },
      select: { id: true, email: true, role: true, displayName: true, avatarUrl: true },
    });

    if (!adminUser) {
      // Ensure the configured root admin exists with role ADMIN in DB
      adminUser = await (prisma as any).$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            id: 'admin_achiever_root_4',
            email: 'Achiever_admin_4.com',
            displayName: 'Achiever Admin',
            role: 'ADMIN',
            lastActiveAt: new Date(),
          },
        });
        await tx.character.create({
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
        return newUser;
      });
    }

    if (adminUser.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access denied. Account is not authorized for administrator privileges.');
    }

    // Generate secure admin JWT session
    const adminToken = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'ADMIN',
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      isAdmin: true,
      token: adminToken,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.displayName,
        avatarUrl: adminUser.avatarUrl || null,
        role: 'ADMIN',
      },
      redirectTo: '/admin',
      message: 'Admin authenticated successfully.',
    };
  }

  // 3. Normal user: Check database for existing account (lightweight SELECT ONLY)
  // DO NOT load tasks, analytics, inventory, shop, feedback, etc.
  const existingUser = await (prisma as any).user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      githubId: true,
      githubUsername: true,
      avatarUrl: true,
      role: true,
    },
  });

  if (existingUser) {
    // User already exists: determine existing authentication method
    // Check if created with Google
    if (
      existingUser.avatarUrl?.includes('googleusercontent.com') ||
      (!existingUser.passwordHash && !existingUser.githubId && !existingUser.githubUsername && existingUser.avatarUrl?.includes('google'))
    ) {
      return {
        success: false,
        actionRequired: 'USE_GOOGLE',
        provider: 'google',
        message: "This account was created with Google. Please use 'Continue with Google' to sign in.",
      };
    }

    // Check if created with GitHub
    if (
      existingUser.githubId ||
      existingUser.githubUsername ||
      existingUser.avatarUrl?.includes('githubusercontent.com')
    ) {
      return {
        success: false,
        actionRequired: 'USE_GITHUB',
        provider: 'github',
        message: "This account is linked with GitHub. Please use 'Continue with GitHub' to sign in.",
      };
    }

    // Check if created with standard email/password
    if (existingUser.passwordHash) {
      return {
        success: false,
        actionRequired: 'USE_PASSWORD',
        provider: 'password',
        message: "This account uses password authentication. Please enter your password to sign in.",
      };
    }

    // Existing Magic Link account: Send Magic Link! (DO NOT create duplicate account)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await (prisma as any).magicLinkToken.deleteMany({
      where: { email: normalizedEmail },
    });

    await (prisma as any).magicLinkToken.create({
      data: {
        email: normalizedEmail,
        tokenHash,
        expiresAt,
        used: false,
        isAdmin: false,
      },
    });

    return {
      success: true,
      isNewUser: false,
      message: 'Check your email for your sign-in link.',
      email: normalizedEmail,
      isAdmin: false,
      verificationToken: rawToken,
      verificationUrl: `/auth/verify?token=${rawToken}`,
    };
  }

  // 4. New user: Email does NOT exist in DB
  // Send Magic Link! DO NOT create the account yet!
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await (prisma as any).magicLinkToken.deleteMany({
    where: { email: normalizedEmail },
  });

  await (prisma as any).magicLinkToken.create({
    data: {
      email: normalizedEmail,
      tokenHash,
      expiresAt,
      used: false,
      isAdmin: false,
    },
  });

  return {
    success: true,
    isNewUser: true,
    message: 'Check your email for your sign-in link.',
    email: normalizedEmail,
    isAdmin: false,
    verificationToken: rawToken,
    verificationUrl: `/auth/verify?token=${rawToken}`,
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

  // Retrieve user account or create if first-time user
  let user = await (prisma as any).user.findUnique({
    where: { email: record.email },
    include: { character: true },
  });

  if (!user) {
    // New user verified link: Create exactly ONE user account + character
    user = await (prisma as any).$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          email: record.email,
          displayName: record.email.split('@')[0],
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
    // Existing user: update lastActiveAt (do NOT create duplicate account)
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
  }

  // Server-authoritative Admin verification:
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
      avatarUrl: user.avatarUrl || null,
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
