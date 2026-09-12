import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Feedback System API', () => {
  const testUser = {
    email: `feedback_tester_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Feedback Tester',
  };

  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register user to get JWT token
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    // Clean up feedbacks and user
    if (userId) {
      await (prisma as any).feedback.deleteMany({
        where: { userId },
      });
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    }
    await prisma.$disconnect();
  });

  it('1. rejects unauthenticated feedback submission with 401', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        type: 'BUG_REPORT',
        message: 'The sound effects did not play on quest complete.',
      });

    expect(res.status).toBe(401);
  });

  it('2. successfully creates a BUG_REPORT feedback with authenticated session', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'BUG_REPORT',
        message: 'Quests list took 3 seconds to re-render after completing daily task.',
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback).toBeDefined();
    expect(res.body.feedback.id).toBeDefined();
    expect(res.body.feedback.userId).toBe(userId);
    expect(res.body.feedback.type).toBe('BUG_REPORT');
    expect(res.body.feedback.message).toContain('Quests list took 3 seconds');
    expect(res.body.feedback.status).toBe('PENDING');
  });

  it('3. successfully creates a FEATURE_REQUEST feedback', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'FEATURE_REQUEST',
        message: 'Add a dark obsidian theme to the Armory catalog!',
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback.type).toBe('FEATURE_REQUEST');
  });

  it('4. successfully creates a GENERAL feedback', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'GENERAL',
        message: 'Loving the RPG momentum system so far. Great work!',
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback.type).toBe('GENERAL');
  });

  it('5. rejects invalid feedback type with 400', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'INVALID_TYPE',
        message: 'Some feedback message',
      });

    expect(res.status).toBe(400);
  });

  it('6. rejects message shorter than minimum length with 400', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'BUG_REPORT',
        message: 'no',
      });

    expect(res.status).toBe(400);
  });

  it('7. retrieves list of user feedbacks with GET /api/feedback', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.feedbacks)).toBe(true);
    expect(res.body.feedbacks.length).toBeGreaterThanOrEqual(3);
    expect(res.body.feedbacks[0].userId).toBe(userId);
  });
});
