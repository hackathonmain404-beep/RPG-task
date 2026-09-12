import { z } from 'zod';

const VALID_CATEGORIES = ['intellect', 'strength', 'wisdom', 'charisma', 'vitality'] as const;
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .transform((v) => v.trim())
    .optional()
    .nullable(),
  categoryKey: z.enum(VALID_CATEGORIES).default('intellect'),
  difficulty: z.enum(VALID_DIFFICULTIES).default('medium'),
  dueDate: z.string().optional().nullable(),
}).strict();

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .transform((v) => v.trim())
    .optional()
    .nullable(),
  categoryKey: z.enum(VALID_CATEGORIES).optional(),
  difficulty: z.enum(VALID_DIFFICULTIES).optional(),
  dueDate: z.string().optional().nullable(),
}).strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
