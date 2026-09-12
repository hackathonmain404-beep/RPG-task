import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema.js';
import {
  calculateReward,
  computeProgression,
  calculateStreak,
} from './rpg.engine.js';

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
 * Full server-authoritative RPG transaction:
 *   authenticate → verify ownership → verify incomplete → calculate reward
 *   → mark complete → record completion → update XP → determine level
 *   → update attribute → update streak → update character → commit
 *
 * Anti-cheat:
 *   - Double-completion → 409 TASK_ALREADY_COMPLETED
 *   - No reward values accepted from client
 *   - All calculations are server-side (rpg.engine.ts)
 *
 * Atomic: entire flow runs in prisma.$transaction
 */
export async function completeTask(userId: string, taskId: string) {
  // Pre-flight checks outside transaction for fast failure
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Quest not found.');
  }

  if (existing.completed) {
    throw new AppError(409, 'TASK_ALREADY_COMPLETED', 'This quest has already been completed.');
  }

  const now = new Date();

  // Full atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Re-check task state inside transaction (race condition guard)
    const task = await tx.task.findFirst({
      where: { id: taskId, userId, completed: false },
    });

    if (!task) {
      throw new AppError(409, 'TASK_ALREADY_COMPLETED', 'This quest has already been completed.');
    }

    // 2. Get character with attributes
    const character = await tx.character.findUnique({
      where: { userId },
      include: { attributes: true },
    });

    if (!character) {
      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Character not found for user.');
    }

    // 3. Calculate reward from server-defined matrix (NEVER from client)
    const reward = calculateReward(task.difficulty, task.categoryKey);

    // 4. Compute XP progression and level transition
    const progression = computeProgression(character.totalXp, reward.xp);

    // 5. Calculate streak
    const streak = calculateStreak(
      character.lastActivityDate,
      character.streakCurrent,
      character.streakBest,
      now
    );

    // 6. Mark task as completed
    const completedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        completed: true,
        completedAt: now,
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });

    // 7. Create CompletionEvent audit record
    await tx.completionEvent.create({
      data: {
        userId,
        taskId,
        completedAt: now,
        xpAwarded: reward.xp,
        goldAwarded: reward.gold,
        streakAfter: streak.current,
        levelBefore: progression.levelBefore,
        levelAfter: progression.levelAfter,
      },
    });

    // 8. Update character (XP, level, gold, streak)
    await tx.character.update({
      where: { userId },
      data: {
        totalXp: progression.totalXp,
        level: progression.levelAfter,
        gold: character.gold + reward.gold,
        streakCurrent: streak.current,
        streakBest: streak.best,
        lastActivityDate: now,
      },
    });

    // 9. Update attribute value and record AttributeEvent
    const targetAttribute = character.attributes.find(
      (attr) => attr.key === reward.attribute.key
    );

    if (targetAttribute) {
      await tx.attribute.update({
        where: { id: targetAttribute.id },
        data: {
          value: targetAttribute.value + reward.attribute.amount,
        },
      });

      // 10. Record AttributeEvent for progression history
      await tx.attributeEvent.create({
        data: {
          userId,
          attributeKey: reward.attribute.key,
          amount: reward.attribute.amount,
          sourceType: 'task_completion',
          sourceId: taskId,
        },
      });
    }

    return {
      task: {
        id: completedTask.id,
        completed: completedTask.completed,
        completedAt: completedTask.completedAt,
      },
      rewards: {
        xp: reward.xp,
        gold: reward.gold,
        attribute: reward.attribute,
      },
      progression: {
        levelBefore: progression.levelBefore,
        levelAfter: progression.levelAfter,
        totalXp: progression.totalXp,
        currentLevelXp: progression.currentLevelXp,
        nextLevelXp: progression.nextLevelXp,
        progressPercent: progression.progressPercent,
      },
      streak: {
        current: streak.current,
        best: streak.best,
      },
    };
  });

  return result;
}

