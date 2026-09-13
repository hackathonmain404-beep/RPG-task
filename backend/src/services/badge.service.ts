import { prisma } from '../utils/prisma.js';

/**
 * Badge definitions with their unlock rules.
 * These get seeded into the Badge table if they don't exist yet.
 */
const BADGE_DEFINITIONS = [
  {
    key: 'first_quest',
    name: 'First Blood',
    description: 'Completed your very first quest in the Citadel.',
    icon: '⚔️',
    rule: { type: 'quests_completed', threshold: 1 },
  },
  {
    key: 'quest_10',
    name: 'Dedicated Warrior',
    description: 'Completed 10 quests — a true champion emerges.',
    icon: '🗡️',
    rule: { type: 'quests_completed', threshold: 10 },
  },
  {
    key: 'quest_50',
    name: 'Century of Quests',
    description: 'Completed 50 quests with unwavering discipline.',
    icon: '🏆',
    rule: { type: 'quests_completed', threshold: 50 },
  },
  {
    key: 'streak_3',
    name: 'Steadfast Explorer',
    description: 'Maintained a questing streak for 3 consecutive days.',
    icon: '🔥',
    rule: { type: 'streak', threshold: 3 },
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day questing streak without fail.',
    icon: '💎',
    rule: { type: 'streak', threshold: 7 },
  },
  {
    key: 'streak_30',
    name: 'Iron Discipline',
    description: 'An unstoppable 30-day streak. You are legendary.',
    icon: '👑',
    rule: { type: 'streak', threshold: 30 },
  },
  {
    key: 'level_5',
    name: 'Veteran Ascendant',
    description: 'Reached character level 5.',
    icon: '🛡️',
    rule: { type: 'level', threshold: 5 },
  },
  {
    key: 'level_10',
    name: 'Grand Champion',
    description: 'Reached character level 10 — a true legend.',
    icon: '⭐',
    rule: { type: 'level', threshold: 10 },
  },
  {
    key: 'gold_500',
    name: 'Treasure Hoarder',
    description: 'Earned a lifetime total of 500 gold.',
    icon: '💰',
    rule: { type: 'gold_earned', threshold: 500 },
  },
];

/**
 * Ensures all badge definitions exist in the database.
 * Called once at startup or on first badge catalog request.
 */
let badgesSeeded = false;
async function ensureBadgesSeeded() {
  if (badgesSeeded) return;
  try {
    for (const def of BADGE_DEFINITIONS) {
      await prisma.badge.upsert({
        where: { key: def.key },
        update: {},
        create: {
          key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          unlockRuleJson: def.rule,
        },
      });
    }
    badgesSeeded = true;
  } catch {
    // Non-critical — badges will be empty until next try
  }
}

/**
 * Returns all badges with the user's unlock state.
 */
export async function getBadgeCatalog(userId: string) {
  await ensureBadgesSeeded();

  const badges = await prisma.badge.findMany({
    include: {
      userBadges: {
        where: { userId },
        select: { id: true, unlockedAt: true },
      },
    },
  });

  return badges.map((badge) => ({
    id: badge.id,
    key: badge.key,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    unlocked: badge.userBadges.length > 0,
    unlockedAt: badge.userBadges[0]?.unlockedAt ?? null,
  }));
}

/**
 * Checks and auto-unlocks badges for a user after a task completion.
 * Called from the task completion flow.
 * 
 * Returns array of newly unlocked badge keys (empty if none).
 */
export async function checkAndUnlockBadges(
  userId: string,
  stats: {
    questsCompleted: number;
    streakCurrent: number;
    level: number;
    totalGoldEarned: number;
  }
): Promise<string[]> {
  await ensureBadgesSeeded();

  const newlyUnlocked: string[] = [];

  try {
    const badges = await prisma.badge.findMany({
      include: {
        userBadges: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    for (const badge of badges) {
      // Already unlocked — skip
      if (badge.userBadges.length > 0) continue;

      const rule = badge.unlockRuleJson as { type: string; threshold: number } | null;
      if (!rule) continue;

      let earned = false;

      switch (rule.type) {
        case 'quests_completed':
          earned = stats.questsCompleted >= rule.threshold;
          break;
        case 'streak':
          earned = stats.streakCurrent >= rule.threshold;
          break;
        case 'level':
          earned = stats.level >= rule.threshold;
          break;
        case 'gold_earned':
          earned = stats.totalGoldEarned >= rule.threshold;
          break;
      }

      if (earned) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
        newlyUnlocked.push(badge.key);
      }
    }
  } catch {
    // Badge unlock is non-critical — don't fail the completion
  }

  return newlyUnlocked;
}

/**
 * Returns all themes with user ownership and equip state.
 */
export async function getThemeCatalog(userId: string) {
  const themes = await prisma.theme.findMany({
    where: { active: true },
    include: {
      userThemes: {
        where: { userId },
        select: { id: true, purchasedAt: true, equippedAt: true },
      },
    },
    orderBy: { price: 'asc' },
  });

  return themes.map((theme) => ({
    id: theme.id,
    key: theme.key,
    name: theme.name,
    description: theme.description,
    price: theme.price,
    themeJson: theme.themeJson,
    owned: theme.userThemes.length > 0,
    equipped: theme.userThemes[0]?.equippedAt != null,
    purchasedAt: theme.userThemes[0]?.purchasedAt ?? null,
  }));
}
