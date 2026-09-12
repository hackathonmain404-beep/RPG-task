import { prisma } from '../utils/prisma.js';

const DEMO_BADGES = [
  {
    id: 'badge-1',
    key: 'first_quest',
    name: 'First Blood',
    description: 'Completed your very first quest in the Citadel.',
    icon: '⚔️',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'badge-2',
    key: 'streak_3',
    name: 'Steadfast Explorer',
    description: 'Maintained a questing streak for 3 consecutive days.',
    icon: '🔥',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'badge-3',
    key: 'level_5',
    name: 'Veteran Ascendant',
    description: 'Reached character level 5.',
    icon: '🛡️',
    unlocked: false,
    unlockedAt: null,
  },
];

const DEMO_THEMES = [
  {
    id: 'theme-1',
    key: 'citadel_dark',
    name: 'Citadel Dark (Default)',
    description: 'The standard dark armor of Citadel operatives.',
    price: 0,
    themeJson: { primary: '#0ea5e9', background: '#0b0f19' },
    owned: true,
    equipped: true,
    purchasedAt: new Date().toISOString(),
  },
  {
    id: 'theme-2',
    key: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Neon magenta and cyan cybernetic glow.',
    price: 250,
    themeJson: { primary: '#f43f5e', background: '#050508' },
    owned: false,
    equipped: false,
    purchasedAt: null,
  },
];

/**
 * Returns all badges with the user's unlock state.
 * Badge unlock status is determined by UserBadge existence.
 */
export async function getBadgeCatalog(userId: string) {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        userBadges: {
          where: { userId },
          select: { id: true, unlockedAt: true },
        },
      },
    });

    if (badges.length > 0) {
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
    return DEMO_BADGES;
  } catch {
    return DEMO_BADGES;
  }
}

/**
 * Returns all themes with user ownership and equip state.
 */
export async function getThemeCatalog(userId: string) {
  try {
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

    if (themes.length > 0) {
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
    return DEMO_THEMES;
  } catch {
    return DEMO_THEMES;
  }
}

