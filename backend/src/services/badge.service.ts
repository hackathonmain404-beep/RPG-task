import { prisma } from '../utils/prisma.js';

/**
 * Returns all badges with the user's unlock state.
 * Badge unlock status is determined by UserBadge existence.
 */
export async function getBadgeCatalog(userId: string) {
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
