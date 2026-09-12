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

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        displayName: input.displayName.trim(),
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

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { character: true },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  if (!user.character) {
    // Self-healing fallback if character was somehow missing
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

export async function getAuthMe(userId: string): Promise<{ user: AuthSessionUser; character: CharacterSummary }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { character: true },
  });

  if (!user || !user.character) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication session invalid or expired.');
  }

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
