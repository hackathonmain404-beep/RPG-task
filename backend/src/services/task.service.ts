import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema.js';

/**
 * Creates a new task owned by the authenticated user.
 * userId comes from auth middleware — never from request body.
 */
export async function createTask(userId: string, input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      categoryKey: input.categoryKey,
      difficulty: input.difficulty,
      dueDate: input.dueDate ?? null,
    },
  });

  return task;
}

/**
 * Lists tasks belonging to the authenticated user.
 * Optional completed filter via query param.
 */
export async function listTasks(userId: string, completedFilter?: boolean) {
  const where: { userId: string; completed?: boolean } = { userId };

  if (completedFilter !== undefined) {
    where.completed = completedFilter;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return tasks;
}

/**
 * Updates a task owned by the authenticated user.
 * Row-level security: query scoped by both task id AND userId.
 */
export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  // Verify ownership
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Quest not found.');
  }

  if (existing.completed) {
    throw new AppError(400, 'BAD_REQUEST', 'Cannot update a completed quest.');
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.categoryKey !== undefined && { categoryKey: input.categoryKey }),
      ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    },
  });

  return updated;
}

/**
 * Deletes a task owned by the authenticated user.
 * Row-level security: query scoped by both task id AND userId.
 */
export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Quest not found.');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { success: true };
}

/**
 * Completes a task owned by the authenticated user.
 *
 * Phase 2 boundary:
 *  - Verifies ownership (row-level security)
 *  - Verifies task is not already completed (anti-cheat)
 *  - Marks task as completed with timestamp
 *  - Does NOT calculate RPG rewards (that's Phase 3)
 *
 * Anti-cheat: double-completion returns 409 TASK_ALREADY_COMPLETED
 */
export async function completeTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Quest not found.');
  }

  if (existing.completed) {
    throw new AppError(409, 'TASK_ALREADY_COMPLETED', 'This quest has already been completed.');
  }

  const completedAt = new Date();

  const completed = await prisma.task.update({
    where: { id: taskId },
    data: {
      completed: true,
      completedAt,
    },
  });

  return {
    task: {
      id: completed.id,
      completed: completed.completed,
      completedAt: completed.completedAt,
    },
  };
}
