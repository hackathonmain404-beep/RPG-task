/**
 * RPG Progression Engine — Pure, deterministic, zero-side-effect functions.
 *
 * All XP/level/reward calculations happen here.
 * NO Prisma, NO database access, NO side effects.
 *
 * Formula: XPToReachLevel(L) = floor(BASE_XP × L^EXPONENT)
 *   - BASE_XP = 100
 *   - EXPONENT = 1.65
 *   - Level 1 requires 0 XP (starting level)
 *
 * References:
 *   - RPG_ENGINE.md
 *   - GAMIFICATION.md
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_XP = 100;
const EXPONENT = 1.65;

// ─── Reward Matrix (GAMIFICATION.md §3) ───────────────────────────────────────

const REWARD_MATRIX: Record<string, { xp: number; gold: number; attribute: number }> = {
  easy:   { xp: 35,  gold: 10, attribute: 4  },
  medium: { xp: 70,  gold: 18, attribute: 8  },
  hard:   { xp: 140, gold: 40, attribute: 16 },
  epic:   { xp: 280, gold: 80, attribute: 32 },
};

// ─── Timezone Policy (GAMIFICATION.md §1) ─────────────────────────────────────

/**
 * EXPLICIT TIMEZONE POLICY:
 * All streak calculations use UTC calendar days.
 * This ensures deterministic, server-consistent behavior regardless of client timezone.
 * If user-profile timezone support is needed later, inject it into calculateStreak().
 */
export const STREAK_TIMEZONE_POLICY = 'UTC' as const;

// ─── Category → Attribute Mapping (GAMIFICATION.md §2) ───────────────────────

/**
 * Deterministic category-to-attribute mapping.
 * The categoryKey on a task determines which attribute receives progression.
 *
 * | Category Key | Attribute   | Real-World Activities                          |
 * |-------------|-------------|------------------------------------------------|
 * | intellect   | Intellect   | Coding, technical, programming, debugging      |
 * | wisdom      | Wisdom      | Study, reading, academic, language learning     |
 * | strength    | Strength    | Gym, fitness, weightlifting, cardio, sports     |
 * | charisma    | Charisma    | Social, community, networking, public speaking  |
 * | vitality    | Vitality    | Sleep, health, hydration, nutrition, meditation |
 */
export const CATEGORY_ATTRIBUTE_MAP: Record<string, { key: string; displayName: string }> = {
  intellect: { key: 'intellect', displayName: 'Intellect' },
  strength:  { key: 'strength',  displayName: 'Strength'  },
  wisdom:    { key: 'wisdom',    displayName: 'Wisdom'    },
  charisma:  { key: 'charisma',  displayName: 'Charisma'  },
  vitality:  { key: 'vitality',  displayName: 'Vitality'  },
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface LevelProgression {
  levelBefore: number;
  levelAfter: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface TaskReward {
  xp: number;
  gold: number;
  attribute: {
    key: string;
    amount: number;
  };
}

export interface StreakResult {
  current: number;
  best: number;
}

// ─── XP & Level Functions ─────────────────────────────────────────────────────

/**
 * Returns the cumulative XP required to REACH the given level.
 * Level 1 = 0 XP (starting point).
 * Level 2 = 100 XP.
 * Non-linear: each subsequent level requires more than the previous.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(level, EXPONENT));
}

/**
 * Determines the current level for a given total XP amount.
 * Iterates upward until the next level threshold exceeds totalXp.
 */
export function getLevelForXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Returns how much XP has been earned INTO the current level
 * (i.e., totalXp minus the threshold for the current level).
 */
export function getXpIntoCurrentLevel(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const currentLevelFloor = getXpRequiredForLevel(level);
  return totalXp - currentLevelFloor;
}

/**
 * Returns how much more XP is needed to reach the next level.
 */
export function getXpNeededForNextLevel(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const nextLevelThreshold = getXpRequiredForLevel(level + 1);
  return nextLevelThreshold - totalXp;
}

/**
 * Returns the percentage progress through the current level (0–100).
 * Rounded to 2 decimal places for deterministic display.
 */
export function getProgressPercent(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const currentFloor = getXpRequiredForLevel(level);
  const nextFloor = getXpRequiredForLevel(level + 1);
  const span = nextFloor - currentFloor;
  if (span <= 0) return 100;
  const progress = ((totalXp - currentFloor) / span) * 100;
  return Number(progress.toFixed(2));
}

/**
 * Computes full level progression after awarding XP.
 * Pure function — takes current state, returns new state.
 */
export function computeProgression(currentTotalXp: number, xpAwarded: number): LevelProgression {
  const levelBefore = getLevelForXp(currentTotalXp);
  const newTotalXp = currentTotalXp + xpAwarded;
  const levelAfter = getLevelForXp(newTotalXp);

  const currentLevelFloor = getXpRequiredForLevel(levelAfter);
  const nextLevelFloor = getXpRequiredForLevel(levelAfter + 1);

  return {
    levelBefore,
    levelAfter,
    totalXp: newTotalXp,
    currentLevelXp: currentLevelFloor,
    nextLevelXp: nextLevelFloor,
    progressPercent: getProgressPercent(newTotalXp),
  };
}

// ─── Reward Calculation ───────────────────────────────────────────────────────

/**
 * Calculates the authoritative reward for completing a task.
 * Reads from the server-defined reward matrix — NEVER from client input.
 *
 * @param difficulty - The task's difficulty (easy, medium, hard)
 * @param categoryKey - The task's category (maps to attribute)
 */
export function calculateReward(difficulty: string, categoryKey: string): TaskReward {
  const matrix = REWARD_MATRIX[difficulty];

  if (!matrix) {
    // Fallback to medium if difficulty is somehow invalid (shouldn't happen with Zod)
    const fallback = REWARD_MATRIX['medium'];
    return {
      xp: fallback.xp,
      gold: fallback.gold,
      attribute: { key: categoryKey, amount: fallback.attribute },
    };
  }

  return {
    xp: matrix.xp,
    gold: matrix.gold,
    attribute: { key: categoryKey, amount: matrix.attribute },
  };
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

/**
 * Calculates the new streak values based on the last activity date.
 * Uses UTC calendar days for consistency.
 *
 * Rules (GAMIFICATION.md §1):
 *   - Same day: streak unchanged
 *   - Next consecutive day: streak + 1
 *   - Missed day(s): reset to 1
 *
 * @param lastActivityDate - The date of the character's last activity (null if first ever)
 * @param currentStreak - The character's current streak count
 * @param currentBest - The character's best streak count
 * @param now - The current date/time (injectable for testing)
 */
export function calculateStreak(
  lastActivityDate: Date | null,
  currentStreak: number,
  currentBest: number,
  now: Date = new Date()
): StreakResult {
  // First ever activity
  if (!lastActivityDate) {
    return {
      current: 1,
      best: Math.max(currentBest, 1),
    };
  }

  // Compare UTC calendar dates
  const lastDate = toUTCDateString(lastActivityDate);
  const todayDate = toUTCDateString(now);

  if (lastDate === todayDate) {
    // Same day — no streak change
    return {
      current: currentStreak,
      best: currentBest,
    };
  }

  const daysDiff = getUTCDaysDifference(lastActivityDate, now);

  if (daysDiff === 1) {
    // Next consecutive day
    const newStreak = currentStreak + 1;
    return {
      current: newStreak,
      best: Math.max(currentBest, newStreak),
    };
  }

  // Missed one or more days — reset
  return {
    current: 1,
    best: currentBest,
  };
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function toUTCDateString(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getUTCDaysDifference(dateA: Date, dateB: Date): number {
  const utcA = Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate());
  const utcB = Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate());
  return Math.floor((utcB - utcA) / (1000 * 60 * 60 * 24));
}
