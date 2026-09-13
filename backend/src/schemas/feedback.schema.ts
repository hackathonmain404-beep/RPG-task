import { z } from 'zod';

export const feedbackTypeSchema = z.enum(['BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL']);

export const createFeedbackSchema = z.object({
  type: feedbackTypeSchema,
  message: z
    .string()
    .min(3, { message: 'Feedback message must be at least 3 characters.' })
    .max(3000, { message: 'Feedback message cannot exceed 3000 characters.' })
    .transform((msg) => msg.trim()),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type FeedbackType = z.infer<typeof feedbackTypeSchema>;
