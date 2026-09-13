import { prisma } from '../utils/prisma.js';
import { CreateFeedbackInput } from '../schemas/feedback.schema.js';

export interface FeedbackRecord {
  id: string;
  userId: string;
  type: string;
  message: string;
  status: string;
  adminReply?: string | null;
  repliedAt?: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
    email: string;
  };
}

/**
 * Persists user feedback into the PostgreSQL database.
 * Enforces authenticated userId attribution.
 */
export async function submitFeedback(userId: string, input: CreateFeedbackInput): Promise<FeedbackRecord> {
  const record = await (prisma as any).feedback.create({
    data: {
      userId,
      type: input.type,
      message: input.message,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
    },
  });

  return record;
}

/**
 * Retrieves feedback submitted by the authenticated user.
 */
export async function listUserFeedback(userId: string): Promise<FeedbackRecord[]> {
  const records = await (prisma as any).feedback.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
    },
  });

  return records;
}
