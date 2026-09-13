import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { getProgressPercent } from '../services/rpg.engine.js';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sortBy = (req.query.sortBy as string) || 'level';
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));
    const currentUserId = req.user?.id;

    // Fetch all real registered players with their characters
    // Strictly filter out any admin, test, or dummy accounts
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { role: { not: 'ADMIN' } },
          { email: { not: 'Achiever_admin_4.com' } },
          { email: { not: { endsWith: '@security.com' } } },
          { email: { not: { endsWith: '@example.com' } } },
        ],
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        githubUsername: true,
        createdAt: true,
        character: {
          select: {
            level: true,
            totalXp: true,
            gold: true,
            streakCurrent: true,
          },
        },
      },
    });

    // Map each user to a clean record with default character stats if needed
    const adventurers = users.map(u => {
      const level = u.character?.level ?? 1;
      const totalXp = u.character?.totalXp ?? 0;
      const gold = u.character?.gold ?? 0;
      const streakCurrent = u.character?.streakCurrent ?? 0;
      const progressPercent = getProgressPercent(totalXp);

      return {
        userId: u.id,
        displayName: u.displayName || 'Adventurer',
        avatarUrl: u.avatarUrl,
        role: u.role || 'USER',
        githubUsername: u.githubUsername,
        createdAt: u.createdAt,
        level,
        totalXp,
        gold,
        streakCurrent,
        progressPercent,
      };
    });

    // Deterministic sorting based on selected tab
    adventurers.sort((a, b) => {
      if (sortBy === 'xp') {
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
        if (b.level !== a.level) return b.level - a.level;
        if (b.gold !== a.gold) return b.gold - a.gold;
        return a.createdAt.getTime() - b.createdAt.getTime();
      }

      if (sortBy === 'coins') {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.level !== a.level) return b.level - a.level;
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
        return a.createdAt.getTime() - b.createdAt.getTime();
      }

      // Default: 'level'
      if (b.level !== a.level) return b.level - a.level;
      if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
      if (b.gold !== a.gold) return b.gold - a.gold;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Assign sequential ranks (1-indexed)
    const rankedLeaderboard = adventurers.map((adv, index) => ({
      rank: index + 1,
      userId: adv.userId,
      displayName: adv.displayName,
      avatarUrl: adv.avatarUrl,
      role: adv.role,
      githubUsername: adv.githubUsername,
      level: adv.level,
      totalXp: adv.totalXp,
      gold: adv.gold,
      streakCurrent: adv.streakCurrent,
      progressPercent: adv.progressPercent,
    }));

    // Find current user's rank
    let currentUserRank = null;
    if (currentUserId) {
      const userIndex = rankedLeaderboard.findIndex(r => r.userId === currentUserId);
      if (userIndex !== -1) {
        currentUserRank = {
          rank: rankedLeaderboard[userIndex].rank,
          level: rankedLeaderboard[userIndex].level,
          totalXp: rankedLeaderboard[userIndex].totalXp,
          gold: rankedLeaderboard[userIndex].gold,
        };
      }
    }

    res.status(200).json({
      sortBy,
      totalAdventurers: rankedLeaderboard.length,
      currentUserRank,
      leaderboard: rankedLeaderboard.slice(0, limit),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
