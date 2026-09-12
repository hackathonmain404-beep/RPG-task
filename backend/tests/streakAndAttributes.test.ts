import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import {
  CATEGORY_ATTRIBUTE_MAP,
  STREAK_TIMEZONE_POLICY,
  calculateReward,
} from '../src/services/rpg.engine.js';

/**
 * Phase 4 Integration Tests — Streaks + Attributes
 *
 * These tests verify streak and attribute behavior across real HTTP
 * completion requests, ensuring the full transaction produces correct
 * streak increments, attribute gains, and progression history records.
 */
describe('Streaks & Attributes — Integration', () => {
  const testUser = {
    email: `streak_attr_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Streak Tester',
  };
  let token: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = res.body.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  // Helper: create a task with a specific category and difficulty
  async function createTask(categoryKey: string, difficulty: string = 'medium') {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `Test ${categoryKey} ${difficulty}`,
        categoryKey,
        difficulty,
      });
    expect(res.status).toBe(201);
    return res.body.task;
  }

  // Helper: complete a task
  async function completeTaskRequest(taskId: string) {
    return request(app)
      .post(`/api/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ─── TIMEZONE POLICY ───────────────────────────────────────────────────────

  describe('Timezone Policy', () => {
    it('should use explicit UTC timezone policy', () => {
      expect(STREAK_TIMEZONE_POLICY).toBe('UTC');
    });
  });

  // ─── CATEGORY → ATTRIBUTE MAPPING ──────────────────────────────────────────

  describe('Category → Attribute Mapping', () => {
    it('should have deterministic mapping for all 5 categories', () => {
      expect(CATEGORY_ATTRIBUTE_MAP['intellect']).toEqual({ key: 'intellect', displayName: 'Intellect' });
      expect(CATEGORY_ATTRIBUTE_MAP['strength']).toEqual({ key: 'strength', displayName: 'Strength' });
      expect(CATEGORY_ATTRIBUTE_MAP['wisdom']).toEqual({ key: 'wisdom', displayName: 'Wisdom' });
      expect(CATEGORY_ATTRIBUTE_MAP['charisma']).toEqual({ key: 'charisma', displayName: 'Charisma' });
      expect(CATEGORY_ATTRIBUTE_MAP['vitality']).toEqual({ key: 'vitality', displayName: 'Vitality' });
    });

    it('intellect task rewards intellect attribute', () => {
      const reward = calculateReward('medium', 'intellect');
      expect(reward.attribute.key).toBe('intellect');
      expect(reward.attribute.amount).toBe(8);
    });

    it('strength task rewards strength attribute', () => {
      const reward = calculateReward('hard', 'strength');
      expect(reward.attribute.key).toBe('strength');
      expect(reward.attribute.amount).toBe(16);
    });

    it('wisdom task rewards wisdom attribute', () => {
      const reward = calculateReward('easy', 'wisdom');
      expect(reward.attribute.key).toBe('wisdom');
      expect(reward.attribute.amount).toBe(4);
    });

    it('charisma task rewards charisma attribute', () => {
      const reward = calculateReward('medium', 'charisma');
      expect(reward.attribute.key).toBe('charisma');
      expect(reward.attribute.amount).toBe(8);
    });

    it('vitality task rewards vitality attribute', () => {
      const reward = calculateReward('hard', 'vitality');
      expect(reward.attribute.key).toBe('vitality');
      expect(reward.attribute.amount).toBe(16);
    });
  });

  // ─── ATTRIBUTE REWARDS VIA COMPLETION ──────────────────────────────────────

  describe('Attribute Rewards via Task Completion', () => {
    it('should reward correct attribute for intellect task', async () => {
      const task = await createTask('intellect', 'easy');
      const res = await completeTaskRequest(task.id);

      expect(res.status).toBe(200);
      expect(res.body.rewards.attribute.key).toBe('intellect');
      expect(res.body.rewards.attribute.amount).toBe(4);
    });

    it('should reward correct attribute for strength task', async () => {
      const task = await createTask('strength', 'medium');
      const res = await completeTaskRequest(task.id);

      expect(res.status).toBe(200);
      expect(res.body.rewards.attribute.key).toBe('strength');
      expect(res.body.rewards.attribute.amount).toBe(8);
    });

    it('should reward correct attribute for wisdom task', async () => {
      const task = await createTask('wisdom', 'hard');
      const res = await completeTaskRequest(task.id);

      expect(res.status).toBe(200);
      expect(res.body.rewards.attribute.key).toBe('wisdom');
      expect(res.body.rewards.attribute.amount).toBe(16);
    });

    it('should reward correct attribute for charisma task', async () => {
      const task = await createTask('charisma', 'easy');
      const res = await completeTaskRequest(task.id);

      expect(res.status).toBe(200);
      expect(res.body.rewards.attribute.key).toBe('charisma');
      expect(res.body.rewards.attribute.amount).toBe(4);
    });

    it('should reward correct attribute for vitality task', async () => {
      const task = await createTask('vitality', 'medium');
      const res = await completeTaskRequest(task.id);

      expect(res.status).toBe(200);
      expect(res.body.rewards.attribute.key).toBe('vitality');
      expect(res.body.rewards.attribute.amount).toBe(8);
    });
  });

  // ─── PROGRESSION HISTORY (AttributeEvent) ──────────────────────────────────

  describe('Progression History — AttributeEvent', () => {
    it('should record AttributeEvent on task completion', async () => {
      const task = await createTask('intellect', 'medium');
      await completeTaskRequest(task.id);

      // Verify AttributeEvent was recorded in DB
      const events = await prisma.attributeEvent.findMany({
        where: { sourceId: task.id, sourceType: 'task_completion' },
      });

      expect(events.length).toBe(1);
      expect(events[0].attributeKey).toBe('intellect');
      expect(events[0].amount).toBe(8);
      expect(events[0].sourceType).toBe('task_completion');
      expect(events[0].sourceId).toBe(task.id);
    });

    it('should record CompletionEvent on task completion', async () => {
      const task = await createTask('strength', 'hard');
      await completeTaskRequest(task.id);

      const events = await prisma.completionEvent.findMany({
        where: { taskId: task.id },
      });

      expect(events.length).toBe(1);
      expect(events[0].xpAwarded).toBe(140);
      expect(events[0].goldAwarded).toBe(40);
    });
  });

  // ─── STREAK BEHAVIOR VIA COMPLETION ────────────────────────────────────────

  describe('Streak via Task Completion', () => {
    it('first completion: streak starts at 1', async () => {
      // Create a fresh user for streak isolation
      const freshUser = {
        email: `streak_fresh_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'Fresh Streak User',
      };
      await prisma.user.deleteMany({ where: { email: freshUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(freshUser);
      const freshToken = regRes.body.token;

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${freshToken}`)
        .send({ title: 'First Task', categoryKey: 'intellect', difficulty: 'easy' });

      const completeRes = await request(app)
        .post(`/api/tasks/${taskRes.body.task.id}/complete`)
        .set('Authorization', `Bearer ${freshToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.streak.current).toBe(1);
      expect(completeRes.body.streak.best).toBe(1);

      // Cleanup
      await prisma.user.deleteMany({ where: { email: freshUser.email } });
    });

    it('same-day completion: streak stays the same', async () => {
      // Create user, complete two tasks on the "same day"
      const sdUser = {
        email: `streak_sameday_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'Same Day User',
      };
      await prisma.user.deleteMany({ where: { email: sdUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(sdUser);
      const sdToken = regRes.body.token;

      // First task
      const task1Res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${sdToken}`)
        .send({ title: 'Task 1', categoryKey: 'intellect', difficulty: 'easy' });
      const complete1 = await request(app)
        .post(`/api/tasks/${task1Res.body.task.id}/complete`)
        .set('Authorization', `Bearer ${sdToken}`);
      expect(complete1.body.streak.current).toBe(1);

      // Second task (same day — streak should stay at 1)
      const task2Res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${sdToken}`)
        .send({ title: 'Task 2', categoryKey: 'strength', difficulty: 'medium' });
      const complete2 = await request(app)
        .post(`/api/tasks/${task2Res.body.task.id}/complete`)
        .set('Authorization', `Bearer ${sdToken}`);
      expect(complete2.body.streak.current).toBe(1); // Same day — no increment

      // Cleanup
      await prisma.user.deleteMany({ where: { email: sdUser.email } });
    });

    it('consecutive day completion: streak increments by 1', async () => {
      // Create user, simulate yesterday activity via direct DB update
      const cdUser = {
        email: `streak_consec_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'Consecutive Day User',
      };
      await prisma.user.deleteMany({ where: { email: cdUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(cdUser);
      const cdToken = regRes.body.token;

      // Set character's lastActivityDate to yesterday UTC
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      await prisma.character.updateMany({
        where: { user: { email: cdUser.email } },
        data: {
          lastActivityDate: yesterday,
          streakCurrent: 3,
          streakBest: 5,
        },
      });

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${cdToken}`)
        .send({ title: 'Consecutive Task', categoryKey: 'wisdom', difficulty: 'medium' });

      const completeRes = await request(app)
        .post(`/api/tasks/${taskRes.body.task.id}/complete`)
        .set('Authorization', `Bearer ${cdToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.streak.current).toBe(4); // 3 + 1
      expect(completeRes.body.streak.best).toBe(5);    // Best unchanged (4 < 5)

      // Cleanup
      await prisma.user.deleteMany({ where: { email: cdUser.email } });
    });

    it('missed day: streak resets to 1', async () => {
      const mdUser = {
        email: `streak_missed_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'Missed Day User',
      };
      await prisma.user.deleteMany({ where: { email: mdUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(mdUser);
      const mdToken = regRes.body.token;

      // Set character's lastActivityDate to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

      await prisma.character.updateMany({
        where: { user: { email: mdUser.email } },
        data: {
          lastActivityDate: threeDaysAgo,
          streakCurrent: 10,
          streakBest: 15,
        },
      });

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${mdToken}`)
        .send({ title: 'After Break Task', categoryKey: 'vitality', difficulty: 'easy' });

      const completeRes = await request(app)
        .post(`/api/tasks/${taskRes.body.task.id}/complete`)
        .set('Authorization', `Bearer ${mdToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.streak.current).toBe(1);  // Reset
      expect(completeRes.body.streak.best).toBe(15);     // Best preserved

      // Cleanup
      await prisma.user.deleteMany({ where: { email: mdUser.email } });
    });

    it('consecutive day with new best: updates streakBest', async () => {
      const nbUser = {
        email: `streak_newbest_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'New Best User',
      };
      await prisma.user.deleteMany({ where: { email: nbUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(nbUser);
      const nbToken = regRes.body.token;

      // Set character's lastActivityDate to yesterday, current streak equals best
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      await prisma.character.updateMany({
        where: { user: { email: nbUser.email } },
        data: {
          lastActivityDate: yesterday,
          streakCurrent: 7,
          streakBest: 7,
        },
      });

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${nbToken}`)
        .send({ title: 'New Record Task', categoryKey: 'charisma', difficulty: 'hard' });

      const completeRes = await request(app)
        .post(`/api/tasks/${taskRes.body.task.id}/complete`)
        .set('Authorization', `Bearer ${nbToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.streak.current).toBe(8);  // 7 + 1
      expect(completeRes.body.streak.best).toBe(8);      // New best!

      // Cleanup
      await prisma.user.deleteMany({ where: { email: nbUser.email } });
    });
  });

  // ─── DUPLICATE COMPLETION (anti-cheat) ─────────────────────────────────────

  describe('Duplicate Completion Prevention', () => {
    it('should reject double completion and not duplicate attribute rewards', async () => {
      const task = await createTask('intellect', 'easy');

      // Get attribute before
      const charBefore = await prisma.character.findFirst({
        where: { user: { email: testUser.email } },
        include: { attributes: true },
      });
      const intellectBefore = charBefore!.attributes.find(a => a.key === 'intellect')!.value;

      // First completion
      const res1 = await completeTaskRequest(task.id);
      expect(res1.status).toBe(200);

      // Get attribute after first completion
      const charAfter1 = await prisma.character.findFirst({
        where: { user: { email: testUser.email } },
        include: { attributes: true },
      });
      const intellectAfter1 = charAfter1!.attributes.find(a => a.key === 'intellect')!.value;
      expect(intellectAfter1).toBe(intellectBefore + 4); // easy = +4

      // Second completion attempt
      const res2 = await completeTaskRequest(task.id);
      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('TASK_ALREADY_COMPLETED');

      // Verify attribute did NOT change after rejected completion
      const charAfter2 = await prisma.character.findFirst({
        where: { user: { email: testUser.email } },
        include: { attributes: true },
      });
      const intellectAfter2 = charAfter2!.attributes.find(a => a.key === 'intellect')!.value;
      expect(intellectAfter2).toBe(intellectAfter1); // No extra reward
    });
  });

  // ─── CUMULATIVE ATTRIBUTE PROGRESSION ──────────────────────────────────────

  describe('Cumulative Attribute Progression', () => {
    it('should accumulate attribute values across multiple completions', async () => {
      // Create a fresh user for clean state
      const accumUser = {
        email: `accum_${Date.now()}@example.com`,
        password: 'securePassword123!',
        displayName: 'Accumulator',
      };
      await prisma.user.deleteMany({ where: { email: accumUser.email } });

      const regRes = await request(app)
        .post('/api/auth/register')
        .send(accumUser);
      const accumToken = regRes.body.token;

      // Complete 3 intellect tasks (easy=+4 each)
      for (let i = 0; i < 3; i++) {
        const taskRes = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accumToken}`)
          .send({ title: `Intellect ${i}`, categoryKey: 'intellect', difficulty: 'easy' });

        const completeRes = await request(app)
          .post(`/api/tasks/${taskRes.body.task.id}/complete`)
          .set('Authorization', `Bearer ${accumToken}`);
        expect(completeRes.status).toBe(200);
      }

      // Check attribute: started at 10, gained 4+4+4 = 12, should be 22
      const character = await prisma.character.findFirst({
        where: { user: { email: accumUser.email } },
        include: { attributes: true },
      });
      const intellect = character!.attributes.find(a => a.key === 'intellect');
      expect(intellect!.value).toBe(10 + 4 * 3); // 22

      // Verify AttributeEvents count
      const events = await prisma.attributeEvent.findMany({
        where: {
          userId: character!.userId,
          attributeKey: 'intellect',
        },
      });
      expect(events.length).toBe(3);
      events.forEach(e => {
        expect(e.amount).toBe(4);
        expect(e.sourceType).toBe('task_completion');
      });

      // Cleanup
      await prisma.user.deleteMany({ where: { email: accumUser.email } });
    });
  });
});
