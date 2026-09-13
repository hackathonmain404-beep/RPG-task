import { describe, it, expect } from 'vitest';
import {
  getXpRequiredForLevel,
  getLevelForXp,
  getXpIntoCurrentLevel,
  getXpNeededForNextLevel,
  getProgressPercent,
  computeProgression,
  calculateReward,
  calculateStreak,
} from '../src/services/rpg.engine.js';

// ─── XP Threshold Tests ──────────────────────────────────────────────────────

describe('RPG Engine — XP Thresholds', () => {
  it('Level 1 requires 0 XP', () => {
    expect(getXpRequiredForLevel(1)).toBe(0);
  });

  it('Level 0 and below require 0 XP', () => {
    expect(getXpRequiredForLevel(0)).toBe(0);
    expect(getXpRequiredForLevel(-1)).toBe(0);
  });

  it('Level 2 requires floor(100 * 2^1.65) XP', () => {
    const expected = Math.floor(100 * Math.pow(2, 1.65));
    expect(getXpRequiredForLevel(2)).toBe(expected);
  });

  it('Level 3 requires floor(100 * 3^1.65) XP', () => {
    const expected = Math.floor(100 * Math.pow(3, 1.65));
    expect(getXpRequiredForLevel(3)).toBe(expected);
  });

  it('Non-linear scaling: each level requires strictly more XP than the previous (levels 1–50)', () => {
    for (let level = 2; level <= 50; level++) {
      const current = getXpRequiredForLevel(level);
      const next = getXpRequiredForLevel(level + 1);
      expect(next).toBeGreaterThan(current);
    }
  });

  it('Threshold values are deterministic and match floor(100 * L^1.65) for levels 1-10', () => {
    for (let level = 1; level <= 10; level++) {
      const expected = level <= 1 ? 0 : Math.floor(100 * Math.pow(level, 1.65));
      expect(getXpRequiredForLevel(level)).toBe(expected);
    }
  });
});

// ─── Level For XP Tests ──────────────────────────────────────────────────────

describe('RPG Engine — getLevelForXp', () => {
  const L2 = getXpRequiredForLevel(2); // floor(100 * 2^1.65) = 313
  const L3 = getXpRequiredForLevel(3);
  const L5 = getXpRequiredForLevel(5);

  it('0 XP → Level 1', () => {
    expect(getLevelForXp(0)).toBe(1);
  });

  it(`${L2 - 1} XP → Level 1 (just below L2 threshold)`, () => {
    expect(getLevelForXp(L2 - 1)).toBe(1);
  });

  it(`${L2} XP → Level 2 (exact L2 threshold)`, () => {
    expect(getLevelForXp(L2)).toBe(2);
  });

  it(`${L2 + 1} XP → Level 2 (just above L2 threshold)`, () => {
    expect(getLevelForXp(L2 + 1)).toBe(2);
  });

  it(`${L3 - 1} XP → Level 2 (just below L3 threshold)`, () => {
    expect(getLevelForXp(L3 - 1)).toBe(2);
  });

  it(`${L3} XP → Level 3 (exact L3 threshold)`, () => {
    expect(getLevelForXp(L3)).toBe(3);
  });

  it(`${L3 + 1} XP → Level 3 (just above L3 threshold)`, () => {
    expect(getLevelForXp(L3 + 1)).toBe(3);
  });

  it('Multi-level jump: L5 threshold XP → Level 5', () => {
    expect(getLevelForXp(L5)).toBe(5);
  });

  it('Multi-level jump from Level 1: large XP crosses multiple levels correctly', () => {
    // Give enough XP to land exactly at L5
    const level = getLevelForXp(L5);
    expect(level).toBe(5);
    // Just below L5 should be L4
    expect(getLevelForXp(L5 - 1)).toBe(4);
  });

  it('Huge XP: 100,000 XP → correct high level', () => {
    const level = getLevelForXp(100000);
    expect(level).toBeGreaterThan(20);

    // Verify the level is correct by checking thresholds
    const currentThreshold = getXpRequiredForLevel(level);
    const nextThreshold = getXpRequiredForLevel(level + 1);
    expect(100000).toBeGreaterThanOrEqual(currentThreshold);
    expect(100000).toBeLessThan(nextThreshold);
  });

  it('Very huge XP: 1,000,000 XP → correct level', () => {
    const level = getLevelForXp(1000000);
    expect(level).toBeGreaterThan(50);

    const currentThreshold = getXpRequiredForLevel(level);
    const nextThreshold = getXpRequiredForLevel(level + 1);
    expect(1000000).toBeGreaterThanOrEqual(currentThreshold);
    expect(1000000).toBeLessThan(nextThreshold);
  });
});

// ─── Progress & Current Level XP Tests ───────────────────────────────────────

describe('RPG Engine — Progress Tracking', () => {
  const L2 = getXpRequiredForLevel(2);
  const L3 = getXpRequiredForLevel(3);

  it('0 XP into current level at Level 1', () => {
    expect(getXpIntoCurrentLevel(0)).toBe(0);
  });

  it('XP into current level after crossing L2 threshold', () => {
    // At L2 + 50 XP, should be 50 XP into L2
    expect(getXpIntoCurrentLevel(L2 + 50)).toBe(50);
  });

  it('XP needed for next level at 0 XP', () => {
    expect(getXpNeededForNextLevel(0)).toBe(L2); // Need L2 threshold to reach L2
  });

  it('Progress percent at 0 XP is 0%', () => {
    expect(getProgressPercent(0)).toBe(0);
  });

  it('Progress percent at exactly L2 threshold is 0% (into L2)', () => {
    expect(getProgressPercent(L2)).toBe(0);
  });

  it('Progress percent is between 0 and 100 within a level', () => {
    const midXp = L2 + Math.floor((L3 - L2) / 2);
    const progress = getProgressPercent(midXp);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });

  it('Progress percent at halfway through L1 is ~50%', () => {
    const halfL1 = Math.floor(L2 / 2);
    const progress = getProgressPercent(halfL1);
    // Should be roughly 50% (within tolerance for floor rounding)
    expect(progress).toBeGreaterThan(45);
    expect(progress).toBeLessThan(55);
  });
});

// ─── Compute Progression Tests ───────────────────────────────────────────────

describe('RPG Engine — computeProgression', () => {
  const L2 = getXpRequiredForLevel(2);
  const L3 = getXpRequiredForLevel(3);
  const L5 = getXpRequiredForLevel(5);

  it('Level up from L1 to L2 with exact L2 threshold XP', () => {
    const result = computeProgression(0, L2);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBe(2);
    expect(result.totalXp).toBe(L2);
  });

  it('No level up: small XP at Level 1 stays Level 1', () => {
    const result = computeProgression(0, 50);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBe(1);
    expect(result.totalXp).toBe(50);
  });

  it('Multi-level jump: 0 XP + L5 threshold XP → Level 5', () => {
    const result = computeProgression(0, L5);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBe(5);
    expect(result.totalXp).toBe(L5);
  });

  it('Progression includes correct currentLevelXp and nextLevelXp', () => {
    const result = computeProgression(0, L2);
    expect(result.currentLevelXp).toBe(L2);
    expect(result.nextLevelXp).toBe(L3);
  });

  it('Level stays same when XP is not enough for next level', () => {
    const result = computeProgression(L2, 10); // L2 + 10 XP, not enough for L3
    expect(result.levelBefore).toBe(2);
    expect(result.levelAfter).toBe(2);
    expect(result.totalXp).toBe(L2 + 10);
  });

  it('Huge XP from Level 1 results in very high level', () => {
    const result = computeProgression(0, 100000);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBeGreaterThan(20);
    expect(result.totalXp).toBe(100000);
  });
});

// ─── Reward Calculation Tests ────────────────────────────────────────────────

describe('RPG Engine — calculateReward', () => {
  it('Easy difficulty: +35 XP, +10 Gold, +4 Attribute', () => {
    const reward = calculateReward('easy', 'intellect');
    expect(reward.xp).toBe(35);
    expect(reward.gold).toBe(10);
    expect(reward.attribute.key).toBe('intellect');
    expect(reward.attribute.amount).toBe(4);
  });

  it('Medium difficulty: +70 XP, +18 Gold, +8 Attribute', () => {
    const reward = calculateReward('medium', 'strength');
    expect(reward.xp).toBe(70);
    expect(reward.gold).toBe(18);
    expect(reward.attribute.key).toBe('strength');
    expect(reward.attribute.amount).toBe(8);
  });

  it('Hard difficulty: +140 XP, +40 Gold, +16 Attribute', () => {
    const reward = calculateReward('hard', 'wisdom');
    expect(reward.xp).toBe(140);
    expect(reward.gold).toBe(40);
    expect(reward.attribute.key).toBe('wisdom');
    expect(reward.attribute.amount).toBe(16);
  });

  it('Unknown difficulty falls back to medium', () => {
    const reward = calculateReward('legendary', 'charisma');
    expect(reward.xp).toBe(70);
    expect(reward.gold).toBe(18);
    expect(reward.attribute.amount).toBe(8);
  });

  it('Reward maps to correct attribute key', () => {
    const vitality = calculateReward('easy', 'vitality');
    expect(vitality.attribute.key).toBe('vitality');

    const charisma = calculateReward('hard', 'charisma');
    expect(charisma.attribute.key).toBe('charisma');
  });
});

// ─── Streak Calculation Tests ────────────────────────────────────────────────

describe('RPG Engine — calculateStreak', () => {
  it('First activity: streak starts at 1', () => {
    const result = calculateStreak(null, 0, 0, new Date('2026-09-12T10:00:00Z'));
    expect(result.current).toBe(1);
    expect(result.best).toBe(1);
  });

  it('Same day: streak unchanged', () => {
    const lastActivity = new Date('2026-09-12T08:00:00Z');
    const now = new Date('2026-09-12T20:00:00Z');
    const result = calculateStreak(lastActivity, 5, 10, now);
    expect(result.current).toBe(5);
    expect(result.best).toBe(10);
  });

  it('Next consecutive day: streak + 1', () => {
    const lastActivity = new Date('2026-09-11T23:00:00Z');
    const now = new Date('2026-09-12T06:00:00Z');
    const result = calculateStreak(lastActivity, 3, 5, now);
    expect(result.current).toBe(4);
    expect(result.best).toBe(5);
  });

  it('Next consecutive day with new best: updates streakBest', () => {
    const lastActivity = new Date('2026-09-11T10:00:00Z');
    const now = new Date('2026-09-12T10:00:00Z');
    const result = calculateStreak(lastActivity, 7, 7, now);
    expect(result.current).toBe(8);
    expect(result.best).toBe(8);
  });

  it('Lapsed day(s): streak resets to 1', () => {
    const lastActivity = new Date('2026-09-10T10:00:00Z');
    const now = new Date('2026-09-12T10:00:00Z');
    const result = calculateStreak(lastActivity, 5, 10, now);
    expect(result.current).toBe(1);
    expect(result.best).toBe(10); // Best preserved
  });

  it('Multiple lapsed days: streak resets to 1', () => {
    const lastActivity = new Date('2026-09-01T10:00:00Z');
    const now = new Date('2026-09-12T10:00:00Z');
    const result = calculateStreak(lastActivity, 20, 30, now);
    expect(result.current).toBe(1);
    expect(result.best).toBe(30);
  });
});
