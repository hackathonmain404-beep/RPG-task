import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Task CRUD & Completion API', () => {
  // Test user A
  const userA = {
    email: `task_tester_a_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Adventurer A',
  };
  let tokenA: string;

  // Test user B (for ownership isolation tests)
  const userB = {
    email: `task_tester_b_${Date.now()}@example.com`,
    password: 'securePassword456!',
    displayName: 'Adventurer B',
  };
  let tokenB: string;

  let taskIdA: string; // A task owned by User A
  let taskIdForComplete: string; // Another task owned by User A for completion tests

  beforeAll(async () => {
    // Clean up any pre-existing test users
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email, userB.email] } },
    });

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send(userA);
    tokenA = resA.body.token;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send(userB);
    tokenB = resB.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.task.deleteMany({
      where: {
        user: { email: { in: [userA.email, userB.email] } },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email, userB.email] } },
    });
    await prisma.$disconnect();
  });

  // ─── CREATE ─────────────────────────────────────────────────────────────

  describe('POST /api/tasks', () => {
    it('should create a task and return 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Study React',
          description: 'Finish hooks lesson',
          categoryKey: 'intellect',
          difficulty: 'medium',
          dueDate: '2026-09-13',
        });

      expect(res.status).toBe(201);
      expect(res.body.task).toBeDefined();
      expect(res.body.task.title).toBe('Study React');
      expect(res.body.task.description).toBe('Finish hooks lesson');
      expect(res.body.task.categoryKey).toBe('intellect');
      expect(res.body.task.difficulty).toBe('medium');
      expect(res.body.task.completed).toBe(false);
      expect(res.body.task.completedAt).toBeNull();
      expect(res.body.task.dueDate).toBe('2026-09-13');
      expect(res.body.task.id).toBeDefined();

      taskIdA = res.body.task.id;
    });

    it('should create a second task for completion tests', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Morning Workout',
          categoryKey: 'strength',
          difficulty: 'hard',
        });

      expect(res.status).toBe(201);
      taskIdForComplete = res.body.task.id;
    });

    it('should reject task creation with missing title (400 VALIDATION_ERROR)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          description: 'No title provided',
          categoryKey: 'intellect',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject task creation with invalid categoryKey', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Bad Category Task',
          categoryKey: 'hacking',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject task creation with invalid difficulty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Bad Difficulty Task',
          difficulty: 'legendary',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject unauthenticated task creation (401)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthorized Task' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── LIST ───────────────────────────────────────────────────────────────

  describe('GET /api/tasks', () => {
    it('should return only the authenticated user\'s tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toBeDefined();
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBeGreaterThanOrEqual(2);

      // All returned tasks should belong to User A
      for (const task of res.body.tasks) {
        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
      }
    });

    it('should return empty array for user with no tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toEqual([]);
    });

    it('should filter tasks by ?completed=false', async () => {
      const res = await request(app)
        .get('/api/tasks?completed=false')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      for (const task of res.body.tasks) {
        expect(task.completed).toBe(false);
      }
    });

    it('should reject unauthenticated list (401)', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── UPDATE ─────────────────────────────────────────────────────────────

  describe('PATCH /api/tasks/:id', () => {
    it('should update a task owned by the user', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskIdA}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Study React Advanced',
          difficulty: 'hard',
        });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Study React Advanced');
      expect(res.body.task.difficulty).toBe('hard');
      // Unchanged fields preserved
      expect(res.body.task.categoryKey).toBe('intellect');
    });

    it('should return 404 when User B tries to update User A\'s task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hijacked Title' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent task ID', async () => {
      const res = await request(app)
        .patch('/api/tasks/nonexistent_id_xyz')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Ghost Task' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ─── COMPLETE ───────────────────────────────────────────────────────────

  describe('POST /api/tasks/:id/complete', () => {
    it('should complete a task and mark it as done', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskIdForComplete}/complete`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.task).toBeDefined();
      expect(res.body.task.id).toBe(taskIdForComplete);
      expect(res.body.task.completed).toBe(true);
      expect(res.body.task.completedAt).toBeDefined();
    });

    it('should reject double completion with 409 TASK_ALREADY_COMPLETED', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskIdForComplete}/complete`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('TASK_ALREADY_COMPLETED');
    });

    it('should reject a third duplicate completion attempt with 409', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskIdForComplete}/complete`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('TASK_ALREADY_COMPLETED');
    });

    it('should return 404 when User B tries to complete User A\'s task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskIdA}/complete`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject unauthenticated completion (401)', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskIdA}/complete`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── COMPLETED FILTER ──────────────────────────────────────────────────

  describe('GET /api/tasks?completed=true (after completion)', () => {
    it('should return the completed task in ?completed=true filter', async () => {
      const res = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
      for (const task of res.body.tasks) {
        expect(task.completed).toBe(true);
      }
    });
  });

  // ─── DELETE ─────────────────────────────────────────────────────────────

  describe('DELETE /api/tasks/:id', () => {
    it('should return 404 when User B tries to delete User A\'s task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should delete a task owned by the user', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskIdA}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 after deleting a non-existent task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskIdA}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject unauthenticated deletion (401)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskIdForComplete}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
