import { z } from 'zod';

/**
 * Sync endpoint schema — used when a Supabase-authenticated user
 * syncs with our Prisma database for the first time or on login.
 */
export const syncSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  starterDiscipline: z.string().min(1).max(20).optional(),
}).strict();

export type SyncInput = z.infer<typeof syncSchema>;

// Keep legacy schemas for backwards compatibility / test route
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long'),
  githubUsername: z.string().min(1).max(50).optional(),
}).strict();

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or GitHub username is required'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const githubAuthSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required'),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GithubAuthInput = z.infer<typeof githubAuthSchema>;
