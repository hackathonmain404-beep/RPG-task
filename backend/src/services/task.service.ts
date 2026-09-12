import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema.js';
import {
  calculateReward,
  computeProgression,
  calculateStreak,
} from './rpg.engine.js';
import { checkAndUnlockBadges } from './badge.service.js';

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
    // 1. Lock Character row to serialize progression updates for this user
    await tx.$queryRaw`SELECT id FROM "Character" WHERE "userId" = ${userId} FOR UPDATE;`;

    // 2. Re-check task state inside transaction (race condition guard)
    const task = await tx.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Quest not found.');
    }

    if (task.completed) {
      throw new AppError(409, 'TASK_ALREADY_COMPLETED', 'This quest has already been completed.');
    }

    // 3. Calculate reward from server-defined matrix (NEVER from client)
    const reward = calculateReward(task.difficulty, task.categoryKey);

    // 4. Atomic Compare-And-Swap task completion (prevents duplicate completion race conditions)
    const updateResult = await tx.task.updateMany({
      where: { id: taskId, userId, completed: false },
      data: {
        completed: true,
        completedAt: now,
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });

    if (updateResult.count === 0) {
      throw new AppError(409, 'TASK_ALREADY_COMPLETED', 'This quest has already been completed.');
    }

    // 5. Get freshly locked character with attributes
    const character = await tx.character.findUnique({
      where: { userId },
      include: { attributes: true },
    });

    if (!character) {
      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Character not found for user.');
    }

    // 6. Compute XP progression and level transition
    const progression = computeProgression(character.totalXp, reward.xp);

    // 7. Calculate streak
    const streak = calculateStreak(
      character.lastActivityDate,
      character.streakCurrent,
      character.streakBest,
      now
    );

    // 8. Create CompletionEvent audit record
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

    // 9. Update character (XP, level, gold, streak)
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

    // 10. Update attribute value and record AttributeEvent
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
        id: task.id,
        completed: true,
        completedAt: now,
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
  }, { maxWait: 15000, timeout: 25000 });

  // Post-transaction: check badge unlocks (non-blocking)
  try {
    const completedCount = await prisma.task.count({
      where: { userId, completed: true },
    });
    const totalGoldEarned = await prisma.completionEvent.aggregate({
      where: { userId },
      _sum: { goldAwarded: true },
    });

    const newBadges = await checkAndUnlockBadges(userId, {
      questsCompleted: completedCount,
      streakCurrent: result.streak.current,
      level: result.progression.levelAfter,
      totalGoldEarned: totalGoldEarned._sum.goldAwarded || 0,
    });

    if (newBadges.length > 0) {
      (result as Record<string, unknown>).badgesUnlocked = newBadges;
    }
  } catch {
    // Badge check is non-critical
  }

  return result;
}
