import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Authentication & Session API', () => {
  const testUser = {
    email: `tester_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Test Adventurer',
  };

  let authToken: string;
  let authCookie: string;

  beforeAll(async () => {
    // Ensure clean state for test email
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Cleanup created test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and initialize character', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.displayName).toBe(testUser.displayName);
      expect(res.body.character).toBeDefined();
      expect(res.body.character.level).toBe(1);
      expect(res.body.character.totalXp).toBe(0);
      expect(res.body.character.gold).toBe(50);
      expect(res.body.character.streakCurrent).toBe(0);
      expect(res.body.character.streakBest).toBe(0);
      expect(res.body.token).toBeDefined();

      // Check cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('should reject duplicate registration with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already exists');
    });

    it('should reject registration with invalid input (e.g. short password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid@example.com',
          password: '123',
          displayName: 'A',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login and return JWT + set cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.character.level).toBe(1);
      expect(res.body.token).toBeDefined();

      authToken = res.body.token;
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      authCookie = cookies[0];
    });

    it('should reject login with wrong password (401 INVALID_CREDENTIALS)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with non-existent email (401 INVALID_CREDENTIALS)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doesnotexist@example.com',
          password: 'anyPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me (Protected Endpoint)', () => {
    it('should reject requests without authorization token (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with malformed token (401 UNAUTHORIZED)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token_123');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user and character profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.displayName).toBe(testUser.displayName);
      expect(res.body.character).toBeDefined();
      expect(res.body.character.level).toBe(1);
      expect(res.body.character.gold).toBe(50);
    });

    it('should return user and character profile with valid cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.character.level).toBe(1);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookies and return success', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Cookie should be cleared (max-age=0 or expires in past)
      const tokenCleared = cookies.some((c: string) => c.includes('token=;') || c.includes('Expires=Thu, 01 Jan 1970'));
      expect(tokenCleared).toBe(true);
    });
  });
});
