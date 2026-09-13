import { prisma } from '../utils/prisma.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Purge chat messages older than 3 days from the database.
 * Returns the count of deleted messages.
 */
export async function purgeExpiredChatMessages(): Promise<number> {
  try {
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);
    const result = await prisma.communityChatMessage.deleteMany({
      where: { createdAt: { lt: threeDaysAgo } },
    });
    if (result.count > 0) {
      console.log(`[ChatCleanup] Purged ${result.count} expired chat message(s) older than 3 days.`);
    }
    return result.count;
  } catch (err) {
    console.error('[ChatCleanup] Error purging expired messages:', err);
    return 0;
  }
}

/**
 * Start the periodic chat message cleanup worker.
 * Runs immediately on boot, then every 30 minutes.
 */
export function startChatCleanupWorker(): void {
  if (cleanupInterval) return; // Already running

  // Run immediately on startup
  purgeExpiredChatMessages();

  // Schedule every 30 minutes
  cleanupInterval = setInterval(() => {
    purgeExpiredChatMessages();
  }, 30 * 60 * 1000);

  console.log('[ChatCleanup] 3-day message retention worker started (runs every 30 min).');
}

/**
 * Stop the cleanup worker (used during graceful shutdown).
 */
export function stopChatCleanupWorker(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
