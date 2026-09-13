import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { getUserLatestTitle } from '../services/admin.service.js';

export async function getCharacter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const title = await getUserLatestTitle(userId);

    const char = await prisma.character.findUnique({
      where: { userId },
      include: { attributes: true },
    });

    if (!char) {
      // New user with no character yet — return defaults
      res.status(200).json({
        level: 1,
        totalXp: 0,
        gold: 50,
        streakCurrent: 0,
        streakBest: 0,
        title,
        attributes: [
          { key: 'intellect', displayName: 'Intellect', value: 0 },
          { key: 'strength', displayName: 'Strength', value: 0 },
          { key: 'wisdom', displayName: 'Wisdom', value: 0 },
          { key: 'charisma', displayName: 'Charisma', value: 0 },
          { key: 'vitality', displayName: 'Vitality', value: 0 },
        ],
      });
      return;
    }

    res.status(200).json({
      level: char.level,
      totalXp: char.totalXp,
      gold: char.gold,
      streakCurrent: char.streakCurrent,
      streakBest: char.streakBest,
      title,
      attributes: char.attributes.map(a => ({
        key: a.key,
        displayName: a.displayName,
        value: a.value,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const events = await prisma.completionEvent.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    const history = events.map(e => ({
      id: e.id,
      type: e.levelAfter > e.levelBefore ? 'level_up' : 'quest_completed',
      title: e.task.title,
      description: e.task.description,
      categoryKey: e.task.categoryKey,
      difficulty: e.task.difficulty,
      timestamp: e.completedAt.toISOString(),
      xpGained: e.xpAwarded,
      goldGained: e.goldAwarded,
      levelBefore: e.levelBefore,
      levelAfter: e.levelAfter,
      streakCurrent: e.streakAfter,
    }));

    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
}
