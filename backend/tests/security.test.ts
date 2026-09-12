import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

/**
 * FINAL SECURITY AUDIT & HOSTILE ADVERSARY TEST SUITE
 * 
 * Hostile verification of:
 * - Tenant isolation & IDOR (read, modify, delete, complete, equip)
 * - Anti-cheat payload rejection (forging XP, Gold, Level, Streak, Attributes)
 * - Economy & Shop integrity (insufficient gold, price tampering, duplicate items)
 * - Race condition exploitation (concurrent task completion double-reward, concurrent purchase double-spend)
 * - Authentication & Session protection (unauthenticated access, token tampering)
 */
describe('Final Security Audit — Hostile Penetration Testing', () => {
  let userA: { token: string; id: string; email: string };
  let userB: { token: string; id: string; email: string };
  let userATaskId: string;
  let testShopItemId: string;
  let secondShopItemId: string;

  beforeAll(async () => {
    // 1. Create User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        email: `victim_${Date.now()}@security.com`,
        password: 'password123',
        displayName: 'Victim User',
      });
    expect(resA.status).toBe(201);
    userA = {
      token: resA.body.token,
      id: resA.body.user.id,
      email: resA.body.user.email,
    };

    // 2. Create User B (Adversary)
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        email: `adversary_${Date.now()}@security.com`,
        password: 'password123',
        displayName: 'Hostile Adversary',
      });
    expect(resB.status).toBe(201);
    userB = {
      token: resB.body.token,
      id: resB.body.user.id,
      email: resB.body.user.email,
    };

    // 3. User A creates a task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        title: "User A's Secret Quest",
        description: 'Classified task',
        categoryKey: 'intellect',
        difficulty: 'medium',
      });
    expect(taskRes.status).toBe(201);
    userATaskId = taskRes.body.task.id;

    // 4. Ensure test shop items exist
    const item1 = await prisma.shopItem.upsert({
      where: { sku: 'security_test_theme_1' },
      update: { price: 50, active: true },
      create: {
        sku: 'security_test_theme_1',
        name: 'Dark Matrix Theme',
        description: 'A test theme',
        itemType: 'THEME',
        price: 50,
        active: true,
      },
    });
    testShopItemId = item1.id;

    const item2 = await prisma.shopItem.upsert({
      where: { sku: 'security_test_theme_2' },
      update: { price: 50, active: true },
      create: {
        sku: 'security_test_theme_2',
        name: 'Cyberpunk Theme',
        description: 'Another test theme',
        itemType: 'THEME',
        price: 50,
        active: true,
      },
    });
    secondShopItemId = item2.id;
  });

  describe('1. Tenant Isolation & IDOR Verification', () => {
    it('Hostile user CANNOT read another user’s tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      const containsUserATask = res.body.tasks.some((t: any) => t.id === userATaskId);
      expect(containsUserATask).toBe(false);
    });

    it('Hostile user CANNOT modify another user’s task (IDOR)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userB.token}`)
        .send({ title: 'Hacked Quest Title' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify task in DB unchanged
      const taskInDb = await prisma.task.findUnique({ where: { id: userATaskId } });
      expect(taskInDb?.title).toBe("User A's Secret Quest");
    });

    it('Hostile user CANNOT complete another user’s task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${userATaskId}/complete`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify task remains incomplete
      const taskInDb = await prisma.task.findUnique({ where: { id: userATaskId } });
      expect(taskInDb?.completed).toBe(false);
    });

    it('Hostile user CANNOT delete another user’s task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify task still exists in DB
      const taskInDb = await prisma.task.findUnique({ where: { id: userATaskId } });
      expect(taskInDb).not.toBeNull();
    });

    it('Hostile user CANNOT equip another user’s inventory item', async () => {
      // User A buys an item
      await request(app)
        .post(`/api/shop/${testShopItemId}/purchase`)
        .set('Authorization', `Bearer ${userA.token}`);

      const invA = await prisma.inventoryItem.findFirst({
        where: { userId: userA.id },
      });
      expect(invA).not.toBeNull();

      // User B attempts to equip User A's inventory item
      const equipRes = await request(app)
        .post(`/api/inventory/${invA!.id}/equip`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(equipRes.status).toBe(404);
      expect(equipRes.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('2. Anti-Cheat & Progression Integrity Verification', () => {
    it('Hostile user CANNOT forge XP in task creation payload', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'Hacked XP Quest',
          difficulty: 'easy',
          xp: 999999, // Injected cheat field
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Hostile user CANNOT forge Gold in task creation payload', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'Hacked Gold Quest',
          difficulty: 'easy',
          gold: 999999, // Injected cheat field
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Hostile user CANNOT forge Level in task update payload', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'Legit Quest',
          difficulty: 'easy',
        });
      const taskId = taskRes.body.task.id;

      const cheatRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          level: 100, // Injected cheat field
        });

      expect(cheatRes.status).toBe(400);
      expect(cheatRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Hostile user CANNOT forge Streak or Attributes in task payload', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'Legit Quest 2',
          difficulty: 'easy',
          streak: 50,
          attribute: { intellect: 999 },
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Completion rewards are strictly server-authoritative and ignore request bodies', async () => {
      // Create an easy task (award: 35 XP, 10 Gold)
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'Easy Test Quest',
          difficulty: 'easy',
          categoryKey: 'intellect',
        });
      const taskId = taskRes.body.task.id;

      // Attempt to send forged rewards in completion body
      const completeRes = await request(app)
        .post(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          xp: 1000000,
          gold: 500000,
          level: 99,
        });

      expect(completeRes.status).toBe(200);
      // Server strictly gave standard easy reward (35 XP, 10 Gold)
      expect(completeRes.body.rewards.xp).toBe(35);
      expect(completeRes.body.rewards.gold).toBe(10);
    });

    it('Duplicate completion rewards are strictly prevented (Sequential replay)', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({
          title: 'One-Time Quest',
          difficulty: 'medium',
        });
      const taskId = taskRes.body.task.id;

      // First completion -> 200
      const res1 = await request(app)
        .post(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${userB.token}`);
      expect(res1.status).toBe(200);

      // Replay attempt -> 409
      const res2 = await request(app)
        .post(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${userB.token}`);
      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('TASK_ALREADY_COMPLETED');
    });
  });

  describe('3. Economy & Shop Integrity Verification', () => {
    it('Hostile user CANNOT purchase without enough Gold', async () => {
      // Adversary started with 50 gold, earned 10 from easy task = 60 gold.
      // Make a luxury item costing 999 gold
      const expensiveItem = await prisma.shopItem.upsert({
        where: { sku: 'luxury_crown' },
        update: { price: 999, active: true },
        create: {
          sku: 'luxury_crown',
          name: 'Golden Crown',
          description: 'Too expensive',
          itemType: 'COSMETIC',
          price: 999,
          active: true,
        },
      });

      const res = await request(app)
        .post(`/api/shop/${expensiveItem.id}/purchase`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_GOLD');
    });

    it('Hostile user CANNOT manipulate item price via request payload', async () => {
      const expensiveItem = await prisma.shopItem.findUnique({
        where: { sku: 'luxury_crown' },
      });

      // Send payload attempting to set price to 0
      const res = await request(app)
        .post(`/api/shop/${expensiveItem!.id}/purchase`)
        .set('Authorization', `Bearer ${userB.token}`)
        .send({ price: 0, cost: 0, discount: 100 });

      // Still fails because server loads price from database
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_GOLD');
    });

    it('Duplicate purchases of unique items are rejected', async () => {
      // Adversary buys testShopItemId (price: 50, adversary has enough)
      const res1 = await request(app)
        .post(`/api/shop/${testShopItemId}/purchase`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res1.status).toBe(200);

      // Duplicate attempt
      const res2 = await request(app)
        .post(`/api/shop/${testShopItemId}/purchase`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('ALREADY_OWNED');
    });
  });

  describe('4. Concurrency & Race Condition Exploitation', () => {
    it('Concurrent Task Completion (10 simultaneous requests) awards XP and Gold EXACTLY ONCE', async () => {
      // Create fresh user for clean balance check
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `race_task_${Date.now()}@security.com`,
          password: 'password123',
          displayName: 'Race Tester',
        });
      const raceToken = userRes.body.token;
      const raceUserId = userRes.body.user.id;

      // Create a hard task (140 XP, 40 Gold)
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${raceToken}`)
        .send({
          title: 'High Concurrency Quest',
          difficulty: 'hard',
          categoryKey: 'intellect',
        });
      const taskId = taskRes.body.task.id;

      // Fire 10 simultaneous completion requests
      const concurrentRequests = Array.from({ length: 10 }).map(() =>
        request(app)
          .post(`/api/tasks/${taskId}/complete`)
          .set('Authorization', `Bearer ${raceToken}`)
      );

      const results = await Promise.all(concurrentRequests);

      const successCount = results.filter((r) => r.status === 200).length;
      const alreadyCompletedCount = results.filter(
        (r) => r.status === 409 && r.body.error.code === 'TASK_ALREADY_COMPLETED'
      ).length;

      // EXACTLY 1 request must succeed, all 9 others must be rejected
      expect(successCount).toBe(1);
      expect(alreadyCompletedCount).toBe(9);

      // Check final DB state: character should have gained EXACTLY 140 XP and 40 Gold
      const finalChar = await prisma.character.findUnique({
        where: { userId: raceUserId },
      });
      // Initial: 0 XP, 50 Gold. After 1 hard task: 140 XP, 90 Gold.
      expect(finalChar?.totalXp).toBe(140);
      expect(finalChar?.gold).toBe(90);

      // Verify only 1 CompletionEvent was written
      const completionEvents = await prisma.completionEvent.findMany({
        where: { taskId },
      });
      expect(completionEvents.length).toBe(1);
    });

    it('Concurrent Shop Purchases (Gold Double-Spend Attack) strictly enforces non-negative balance', async () => {
      // Fresh user starts with exactly 50 gold
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `race_shop_${Date.now()}@security.com`,
          password: 'password123',
          displayName: 'Double Spend Tester',
        });
      const raceToken = userRes.body.token;
      const raceUserId = userRes.body.user.id;

      // Both testShopItemId (50 gold) and secondShopItemId (50 gold) cost 50 gold.
      // Total cost would be 100 gold, but user only has 50 gold.
      // An adversary attempts to buy both simultaneously to double-spend the 50 gold.
      const req1 = request(app)
        .post(`/api/shop/${testShopItemId}/purchase`)
        .set('Authorization', `Bearer ${raceToken}`);

      const req2 = request(app)
        .post(`/api/shop/${secondShopItemId}/purchase`)
        .set('Authorization', `Bearer ${raceToken}`);

      const [res1, res2] = await Promise.all([req1, req2]);

      const statuses = [res1.status, res2.status];
      const successCount = statuses.filter((s) => s === 200).length;
      const failedCount = statuses.filter((s) => s === 400).length;

      // Exactly ONE must succeed (200) and ONE must fail with 400 INSUFFICIENT_GOLD
      expect(successCount).toBe(1);
      expect(failedCount).toBe(1);

      // Verify final gold balance in database is 0, NEVER negative
      const finalChar = await prisma.character.findUnique({
        where: { userId: raceUserId },
      });
      expect(finalChar?.gold).toBe(0);

      // Verify only 1 inventory item was created
      const inventory = await prisma.inventoryItem.findMany({
        where: { userId: raceUserId },
      });
      expect(inventory.length).toBe(1);
    });
  });

  describe('5. Authentication & Session Security Verification', () => {
    it('All protected endpoints reject unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const endpoints = [
        { method: 'get', url: '/api/auth/me' },
        { method: 'get', url: '/api/tasks' },
        { method: 'post', url: '/api/tasks' },
        { method: 'patch', url: '/api/tasks/fake-id' },
        { method: 'delete', url: '/api/tasks/fake-id' },
        { method: 'post', url: '/api/tasks/fake-id/complete' },
        { method: 'get', url: '/api/shop' },
        { method: 'post', url: '/api/shop/fake-id/purchase' },
        { method: 'get', url: '/api/inventory' },
        { method: 'post', url: '/api/inventory/fake-id/equip' },
        { method: 'get', url: '/api/badges' },
        { method: 'get', url: '/api/badges/themes' },
      ];

      for (const ep of endpoints) {
        let reqBuilder: any = (request(app) as any)[ep.method](ep.url);
        const res = await reqBuilder;
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('Rejects tampered JWT signatures with 401 UNAUTHORIZED', async () => {
      // Take a valid token and tamper with the signature
      const tamperedToken = userA.token.slice(0, -5) + 'XXXXX';

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Public endpoints (health, register, login) remain accessible without auth', async () => {
      const healthRes = await request(app).get('/api/health');
      expect(healthRes.status).toBe(200);
      expect(healthRes.body.status).toBe('healthy');
    });

    it('Enforces HTTP Security Headers via Helmet', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('Rejects unexpected payload fields in /api/auth/register (Strict Schema)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `strict_${Date.now()}@security.com`,
          password: 'password123',
          displayName: 'Strict User',
          isAdmin: true, // Injected unexpected field
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Rejects unexpected payload fields in /api/auth/login (Strict Schema)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userA.email,
          password: 'password123',
          role: 'admin', // Injected unexpected field
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/themes complies with API Contract and requires authentication', async () => {
      // Unauthenticated -> 401
      const unauthRes = await request(app).get('/api/themes');
      expect(unauthRes.status).toBe(401);

      // Authenticated -> 200
      const authRes = await request(app)
        .get('/api/themes')
        .set('Authorization', `Bearer ${userA.token}`);
      expect(authRes.status).toBe(200);
      expect(Array.isArray(authRes.body.themes)).toBe(true);
    });

    it('POST /api/auth/logout immediately revokes the JWT token from subsequent requests', async () => {
      // Create a dedicated user session to test logout revocation
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `logout_test_${Date.now()}@security.com`,
          password: 'password123',
          displayName: 'Logout Tester',
        });
      const logoutToken = regRes.body.token;

      // Verify token works initially
      const meResBefore = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${logoutToken}`);
      expect(meResBefore.status).toBe(200);

      // Logout with Bearer token
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${logoutToken}`);
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Subsequent request using the revoked token must fail with 401
      const meResAfter = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${logoutToken}`);
      expect(meResAfter.status).toBe(401);
      expect(meResAfter.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
