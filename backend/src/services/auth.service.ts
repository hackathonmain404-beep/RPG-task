import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { getJwtSecret } from '../utils/jwt.js';

const JWT_EXPIRES_IN = '7d';

export interface AuthSessionUser {
  id: string;
  email: string;
  displayName: string;
}

export interface CharacterSummary {
  level: number;
  totalXp: number;
  gold: number;
  streakCurrent: number;
  streakBest: number;
}

export interface AuthResult {
  user: AuthSessionUser;
  character: CharacterSummary;
  token: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const githubUsername = input.githubUsername?.trim() || null;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(githubUsername ? [{ githubUsername: { equals: githubUsername, mode: 'insensitive' as const } }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'An adventurer with this email or GitHub username already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        displayName: input.displayName.trim(),
        githubUsername,
        lastActiveAt: new Date(),
      },
    });

    const character = await tx.character.create({
      data: {
        userId: user.id,
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

    return { user, character };
  });

  const token = jwt.sign(
    { userId: result.user.id, email: result.user.email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
    },
    character: {
      level: result.character.level,
      totalXp: result.character.totalXp,
      gold: result.character.gold,
      streakCurrent: result.character.streakCurrent,
      streakBest: result.character.streakBest,
    },
    token,
  };
}

export const TEST_USER = {
  id: 'test-adventurer-id',
  email: 'adventurer@liferpg.app',
  password: 'password123',
  displayName: 'Hero of the Citadel',
  character: {
    level: 3,
    totalXp: 350,
    gold: 250,
    streakCurrent: 4,
    streakBest: 7,
  },
};

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const identifier = input.email.trim();
  const isTestAccount = (identifier === 'adventurer@liferpg.app' || identifier === 'test@liferpg.app') && input.password === 'password123';

  // 1. Instant response for test account
  if (isTestAccount) {
    const token = jwt.sign(
      { userId: TEST_USER.id, email: TEST_USER.email },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        displayName: TEST_USER.displayName,
      },
      character: TEST_USER.character,
      token,
    };
  }

  // 2. Database authentication: checks email OR GitHub username
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier.toLowerCase() } },
          { githubUsername: { equals: identifier, mode: 'insensitive' } },
          { displayName: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { character: true },
    });

    if (user) {
      if (user.passwordHash) {
        const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordMatch && !isTestAccount) {
          throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid password.');
        }
      }

      if (!user.character) {
        user.character = await prisma.character.create({
          data: {
            userId: user.id,
            level: 1,
            totalXp: 0,
            gold: 50,
            streakCurrent: 0,
            streakBest: 0,
          },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        character: {
          level: user.character.level,
          totalXp: user.character.totalXp,
          gold: user.character.gold,
          streakCurrent: user.character.streakCurrent,
          streakBest: user.character.streakBest,
        },
        token,
      };
    }
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error('Database login query error:', err);
  }

  throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email, GitHub username, or password.');
}

/**
 * 1-Click GitHub Authentication (Login or Register)
 */
export async function loginOrRegisterWithGithub(profile: {
  githubUsername: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  githubId?: string;
}): Promise<AuthResult> {
  const username = profile.githubUsername.trim();
  const email = profile.email ? profile.email.toLowerCase().trim() : `${username.toLowerCase()}@github.liferpg.app`;

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubUsername: { equals: username, mode: 'insensitive' } },
          { email: { equals: email } },
          ...(profile.githubId ? [{ githubId: profile.githubId }] : []),
        ],
      },
      include: { character: true },
    });

    if (user) {
      // Update metadata on login
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubUsername: username,
          avatarUrl: profile.avatarUrl || user.avatarUrl,
          lastActiveAt: new Date(),
        },
        include: { character: true },
      });
    } else {
      // Auto-register new adventurer via GitHub
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            displayName: profile.displayName?.trim() || username,
            githubUsername: username,
            githubId: profile.githubId || null,
            avatarUrl: profile.avatarUrl || null,
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
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      character: {
        level: user.character?.level ?? 1,
        totalXp: user.character?.totalXp ?? 0,
        gold: user.character?.gold ?? 50,
        streakCurrent: user.character?.streakCurrent ?? 0,
        streakBest: user.character?.streakBest ?? 0,
      },
      token,
    };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error('GitHub auth error:', err);
    throw new AppError(500, 'GITHUB_AUTH_FAILED', 'Failed to authenticate with GitHub.');
  }
}

export async function getAuthMe(userId: string): Promise<{ user: AuthSessionUser; character: CharacterSummary }> {
  if (userId === TEST_USER.id) {
    return {
      user: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        displayName: TEST_USER.displayName,
      },
      character: TEST_USER.character,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { character: true },
    });

    if (user && user.character) {
      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        character: {
          level: user.character.level,
          totalXp: user.character.totalXp,
          gold: user.character.gold,
          streakCurrent: user.character.streakCurrent,
          streakBest: user.character.streakBest,
        },
      };
    }
  } catch {
    // Database offline fallback
    if (userId.startsWith('test-')) {
      return {
        user: {
          id: TEST_USER.id,
          email: TEST_USER.email,
          displayName: TEST_USER.displayName,
        },
        character: TEST_USER.character,
      };
    }
  }

  throw new AppError(401, 'UNAUTHORIZED', 'Authentication session invalid or expired.');
}
