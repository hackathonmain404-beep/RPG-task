import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { getLevelForXp } from './rpg.engine.js';

export interface GrantEconomyInput {
  xp?: number;
  coins?: number;
  title?: string;
  reason?: string;
}

export interface CreateShopItemInput {
  name: string;
  description: string;
  itemType: string; // THEME, BADGE, COSMETIC, TITLE
  category?: string;
  price: number;
  rarity?: string;
  imageUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

// --------------------------------------------------
// --------------------------------------------------
// 0. TITLE HELPER
// --------------------------------------------------

export async function getUserLatestTitle(userId: string): Promise<string | null> {
  try {
    const logs = await (prisma as any).activityLog.findMany({
      where: {
        userId,
        OR: [
          { eventType: 'TITLE_GRANT' },
          { eventType: 'ADMIN_GRANT' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    for (const log of logs) {
      const t = (log.metadataJson as any)?.title;
      if (t && typeof t === 'string' && t.trim().length > 0) {
        return t.trim();
      }
    }
  } catch (err) {
    console.error('Failed to get user title:', err);
  }
  return null;
}

// --------------------------------------------------
// 1. USERS & ECONOMY
// --------------------------------------------------

export async function listRegisteredUsers(query?: string) {
  const whereClause: any = {};

  if (query && query.trim()) {
    const term = query.trim().toLowerCase();
    whereClause.OR = [
      { displayName: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { id: { contains: term, mode: 'insensitive' } },
      { githubUsername: { contains: term, mode: 'insensitive' } },
    ];
  }

  const users = await (prisma as any).user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      githubUsername: true,
      role: true,
      createdAt: true,
      lastActiveAt: true,
      character: {
        select: {
          id: true,
          level: true,
          totalXp: true,
          gold: true,
          streakCurrent: true,
          streakBest: true,
        },
      },
    },
  });

  // Ensure every real user has a character row in database
  for (const u of users) {
    if (!u.character) {
      try {
        u.character = await (prisma as any).character.create({
          data: {
            userId: u.id,
            level: 1,
            totalXp: 0,
            gold: 50,
            streakCurrent: 0,
            streakBest: 0,
          },
        });
      } catch {
        // Character might have been concurrently created
      }
    }
  }

  // Fetch all recent title logs for these users
  const userIds = users.map((u: any) => u.id);
  const titleLogs = await (prisma as any).activityLog.findMany({
    where: {
      userId: { in: userIds },
      OR: [
        { eventType: 'TITLE_GRANT' },
        { eventType: 'ADMIN_GRANT' },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  const userTitleMap = new Map<string, string>();
  for (const log of titleLogs) {
    const t = (log.metadataJson as any)?.title;
    if (t && typeof t === 'string' && t.trim().length > 0 && !userTitleMap.has(log.userId)) {
      userTitleMap.set(log.userId, t.trim());
    }
  }

  return users.map((u: any) => {
    const title = userTitleMap.get(u.id) || null;
    const level = u.character?.level ?? 1;
    const totalXp = u.character?.totalXp ?? 0;
    const gold = u.character?.gold ?? 50;
    const streakCurrent = u.character?.streakCurrent ?? 0;
    const streakBest = u.character?.streakBest ?? 0;

    return {
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      githubUsername: u.githubUsername,
      role: u.role || 'USER',
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
      title,
      level,
      totalXp,
      coins: gold,
      gold,
      streakCurrent,
      streakBest,
      character: {
        level,
        totalXp,
        gold,
        streakCurrent,
        streakBest,
        title,
      },
    };
  });
}

export async function grantUserEconomy(
  adminUserId: string,
  targetUserId: string,
  input: GrantEconomyInput
) {
  const targetUser = await (prisma as any).user.findUnique({
    where: { id: targetUserId },
    include: { character: true },
  });

  if (!targetUser) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Target user not found.');
  }

  let character = targetUser.character;
  if (!character) {
    character = await (prisma as any).character.create({
      data: {
        userId: targetUserId,
        level: 1,
        totalXp: 0,
        gold: 50,
        streakCurrent: 0,
        streakBest: 0,
      },
    });
  }

  const xpToAdd = Math.max(0, Number(input.xp) || 0);
  const coinsToAdd = Math.max(0, Number(input.coins ?? (input as any).gold) || 0);
  const grantedTitle = input.title ? input.title.trim() : undefined;

  const newTotalXp = character.totalXp + xpToAdd;
  const newGold = character.gold + coinsToAdd;

  // Recalculate level authoritative progression
  const newLevel = Math.max(character.level, getLevelForXp(newTotalXp));

  // Update in database transaction
  const updatedChar = await (prisma as any).$transaction(async (tx: any) => {
    const updated = await tx.character.update({
      where: { id: character.id },
      data: {
        totalXp: newTotalXp,
        gold: newGold,
        level: newLevel,
      },
    });

    // Save title in audit log if provided
    if (grantedTitle) {
      await tx.activityLog.create({
        data: {
          userId: targetUserId,
          eventType: 'TITLE_GRANT',
          metadataJson: {
            title: grantedTitle,
            adminUserId,
            reason: input.reason || 'Citadel Treasury Dispatch',
          },
        },
      });
    }

    // General Audit log
    await tx.activityLog.create({
      data: {
        userId: targetUserId,
        eventType: 'ADMIN_GRANT',
        metadataJson: {
          adminUserId,
          xpGranted: xpToAdd,
          coinsGranted: coinsToAdd,
          title: grantedTitle || null,
          reason: input.reason || 'Admin granted bonus',
          newLevel,
        },
      },
    });

    return updated;
  });

  const effectiveTitle = grantedTitle || (await getUserLatestTitle(targetUserId)) || null;

  const userPayload = {
    id: targetUser.id,
    email: targetUser.email,
    displayName: targetUser.displayName,
    role: targetUser.role || 'USER',
    createdAt: targetUser.createdAt,
    updatedAt: targetUser.updatedAt,
    title: effectiveTitle,
    level: updatedChar.level,
    totalXp: updatedChar.totalXp,
    coins: updatedChar.gold,
    gold: updatedChar.gold,
    streakCurrent: updatedChar.streakCurrent,
    streakBest: updatedChar.streakBest,
    character: {
      level: updatedChar.level,
      totalXp: updatedChar.totalXp,
      gold: updatedChar.gold,
      streakCurrent: updatedChar.streakCurrent,
      streakBest: updatedChar.streakBest,
      title: effectiveTitle,
    },
  };

  return {
    success: true,
    message: `Granted ${xpToAdd} XP and ${coinsToAdd} Gold${grantedTitle ? ` with title "${grantedTitle}"` : ''} to hero!`,
    userId: targetUserId,
    user: userPayload,
    character: userPayload.character,
    granted: {
      xp: xpToAdd,
      coins: coinsToAdd,
      gold: coinsToAdd,
      title: grantedTitle,
    },
  };
}

// --------------------------------------------------
// 2. BROADCAST BANNER
// --------------------------------------------------

export async function getActiveBroadcast() {
  const broadcast = await (prisma as any).broadcast.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  return broadcast;
}

export async function setBroadcast(input: {
  type: string;
  message: string;
  actionLabel?: string;
}) {
  // Deactivate existing
  await (prisma as any).broadcast.updateMany({
    where: { active: true },
    data: { active: false },
  });

  const created = await (prisma as any).broadcast.create({
    data: {
      type: input.type || 'info',
      message: input.message,
      actionLabel: input.actionLabel?.trim() || null,
      active: true,
    },
  });

  return created;
}

export async function dismissBroadcast() {
  await (prisma as any).broadcast.updateMany({
    where: { active: true },
    data: { active: false },
  });

  return { success: true };
}

// --------------------------------------------------
// 3. GLOBAL 2X SURGE EVENT ENGINE
// --------------------------------------------------

export async function getSurgeStatus() {
  const activeSurge = await (prisma as any).surgeEvent.findFirst({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeSurge) {
    // Check if any expired surge is still marked active and clean it up
    await (prisma as any).surgeEvent.updateMany({
      where: {
        active: true,
        expiresAt: { lte: new Date() },
      },
      data: { active: false },
    });

    return {
      active: false,
      multiplier: 1.0,
      durationHours: 0,
      startedAt: null,
      expiresAt: null,
      remainingSeconds: 0,
    };
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(activeSurge.expiresAt).getTime() - Date.now()) / 1000)
  );

  return {
    active: true,
    id: activeSurge.id,
    multiplier: activeSurge.multiplier,
    durationHours: activeSurge.durationHours,
    startedAt: activeSurge.startedAt,
    expiresAt: activeSurge.expiresAt,
    remainingSeconds,
  };
}

export async function startSurgeEvent(durationHours: number) {
  const hours = Math.max(1, Math.min(48, Number(durationHours) || 2));
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + hours * 60 * 60 * 1000);

  // Deactivate prior surges
  await (prisma as any).surgeEvent.updateMany({
    where: { active: true },
    data: { active: false },
  });

  const surge = await (prisma as any).surgeEvent.create({
    data: {
      multiplier: 2.0,
      durationHours: hours,
      active: true,
      startedAt,
      expiresAt,
    },
  });

  return {
    active: true,
    id: surge.id,
    multiplier: 2.0,
    durationHours: hours,
    startedAt: surge.startedAt,
    expiresAt: surge.expiresAt,
    remainingSeconds: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  };
}

export async function endSurgeEvent() {
  await (prisma as any).surgeEvent.updateMany({
    where: { active: true },
    data: { active: false },
  });

  return { active: false, multiplier: 1.0 };
}

// --------------------------------------------------
// 4. FEEDBACK DESK
// --------------------------------------------------

export async function listAllFeedback(typeFilter?: string) {
  const where: any = {};
  if (typeFilter && typeFilter !== 'ALL') {
    where.type = typeFilter;
  }

  const feedbacks = await (prisma as any).feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return feedbacks.map((f: any) => ({
    id: f.id,
    userId: f.userId,
    userEmail: f.user?.email || '',
    userName: f.user?.displayName || 'Adventurer',
    type: f.type,
    message: f.message,
    status: f.status,
    adminReply: f.adminReply || null,
    repliedAt: f.repliedAt ? (f.repliedAt instanceof Date ? f.repliedAt.toISOString() : f.repliedAt) : null,
    createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
    updatedAt: f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt,
    user: {
      id: f.user?.id || f.userId,
      displayName: f.user?.displayName || 'Adventurer',
      email: f.user?.email || '',
      avatarUrl: f.user?.avatarUrl || null,
    },
  }));
}

export async function replyFeedback(
  feedbackId: string,
  replyText: string,
  newStatus?: string
) {
  const record = await (prisma as any).feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!record) {
    throw new AppError(404, 'NOT_FOUND', 'Feedback submission not found.');
  }

  const statusToSet = newStatus || 'REVIEWED';

  const updated = await (prisma as any).feedback.update({
    where: { id: feedbackId },
    data: {
      adminReply: replyText.trim(),
      status: statusToSet,
      repliedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    userEmail: updated.user?.email || '',
    userName: updated.user?.displayName || 'Adventurer',
    type: updated.type,
    message: updated.message,
    status: updated.status,
    adminReply: updated.adminReply,
    repliedAt: updated.repliedAt ? (updated.repliedAt instanceof Date ? updated.repliedAt.toISOString() : updated.repliedAt) : null,
    createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
    updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt,
    user: {
      id: updated.user?.id || updated.userId,
      displayName: updated.user?.displayName || 'Adventurer',
      email: updated.user?.email || '',
      avatarUrl: updated.user?.avatarUrl || null,
    },
  };
}

export async function deleteFeedback(feedbackId: string) {
  await (prisma as any).feedback.delete({
    where: { id: feedbackId },
  });

  return { success: true, id: feedbackId };
}

// --------------------------------------------------
// 5. MARKET STUDIO
// --------------------------------------------------

export async function listMarketItems() {
  const items = await (prisma as any).shopItem.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: { inventoryItems: true },
      },
    },
  });

  return items.map((item: any) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    itemType: item.itemType,
    category: item.category || 'Cosmetic',
    price: item.price,
    rarity: item.rarity || 'common',
    imageUrl: item.imageUrl || null,
    displayOrder: item.displayOrder ?? 0,
    active: item.active,
    metadata: item.metadataJson,
    totalPurchases: item._count?.inventoryItems ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function createMarketItem(input: CreateShopItemInput) {
  const sku = `ITEM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const item = await (prisma as any).shopItem.create({
    data: {
      sku,
      name: input.name.trim(),
      description: input.description.trim(),
      itemType: input.itemType || 'COSMETIC',
      category: input.category?.trim() || 'Cosmetic',
      price: Math.max(0, Math.floor(Number(input.price) || 50)),
      rarity: input.rarity || 'common',
      imageUrl: input.imageUrl?.trim() || null,
      displayOrder: Number(input.displayOrder) || 0,
      active: input.active !== undefined ? input.active : true,
    },
  });

  return item;
}

export async function updateMarketItem(
  itemId: string,
  input: Partial<CreateShopItemInput>
) {
  const existing = await (prisma as any).shopItem.findUnique({
    where: { id: itemId },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Shop item not found.');
  }

  const dataToUpdate: any = {};
  if (input.name !== undefined) dataToUpdate.name = input.name.trim();
  if (input.description !== undefined) dataToUpdate.description = input.description.trim();
  if (input.itemType !== undefined) dataToUpdate.itemType = input.itemType;
  if (input.category !== undefined) dataToUpdate.category = input.category.trim();
  if (input.price !== undefined) dataToUpdate.price = Math.max(0, Math.floor(Number(input.price)));
  if (input.rarity !== undefined) dataToUpdate.rarity = input.rarity;
  if (input.imageUrl !== undefined) dataToUpdate.imageUrl = input.imageUrl.trim() || null;
  if (input.displayOrder !== undefined) dataToUpdate.displayOrder = Number(input.displayOrder);
  if (input.active !== undefined) dataToUpdate.active = Boolean(input.active);

  const updated = await (prisma as any).shopItem.update({
    where: { id: itemId },
    data: dataToUpdate,
  });

  return updated;
}

export async function deleteMarketItem(itemId: string) {
  const existing = await (prisma as any).shopItem.findUnique({
    where: { id: itemId },
    include: {
      _count: { select: { inventoryItems: true } },
    },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Shop item not found.');
  }

  // Safe delete: if item has been purchased by users, deactivate instead of foreign key error
  if (existing._count?.inventoryItems > 0) {
    await (prisma as any).shopItem.update({
      where: { id: itemId },
      data: { active: false },
    });
    return { success: true, id: itemId, deactivated: true };
  }

  await (prisma as any).shopItem.delete({
    where: { id: itemId },
  });

  return { success: true, id: itemId, deleted: true };
}
