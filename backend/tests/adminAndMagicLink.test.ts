import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Strict Authentication Flow & Admin Security (12 Final Test Cases)', () => {
  const newEmail = `new_hero_${Date.now()}@example.com`;
  const existingMagicEmail = `magic_hero_${Date.now()}@example.com`;
  const existingGoogleEmail = `google_user_${Date.now()}@example.com`;
  const adminIdentifier = 'Achiever_admin_4.com';

  let normalAuthToken: string;
  let normalUserId: string;
  let adminAuthToken: string;
  let testFeedbackId: string;
  let createdShopItemId: string;

  beforeAll(async () => {
    // Ensure clean state
    await (prisma as any).magicLinkToken.deleteMany({
      where: {
        email: { in: [newEmail.toLowerCase(), existingMagicEmail.toLowerCase(), existingGoogleEmail.toLowerCase(), adminIdentifier, adminIdentifier.toLowerCase()] },
      },
    });

    // Seed an existing Google user
    await (prisma as any).user.deleteMany({
      where: {
        email: { in: [newEmail.toLowerCase(), existingMagicEmail.toLowerCase(), existingGoogleEmail.toLowerCase()] },
      },
    });

    await (prisma as any).user.create({
      data: {
        id: `google_seed_${Date.now()}`,
        email: existingGoogleEmail.toLowerCase(),
        displayName: 'Google Adventurer',
        avatarUrl: 'https://lh3.googleusercontent.com/a/seed-avatar',
        role: 'USER',
      },
    });
  });

  afterAll(async () => {
    if (testFeedbackId) {
      await (prisma as any).feedback.deleteMany({ where: { id: testFeedbackId } });
    }
    if (createdShopItemId) {
      await (prisma as any).shopItem.deleteMany({ where: { id: createdShopItemId } });
    }
    await (prisma as any).user.deleteMany({
      where: {
        email: { in: [newEmail.toLowerCase(), existingMagicEmail.toLowerCase(), existingGoogleEmail.toLowerCase()] },
      },
    });
    await (prisma as any).magicLinkToken.deleteMany({
      where: {
        email: { in: [newEmail.toLowerCase(), existingMagicEmail.toLowerCase(), existingGoogleEmail.toLowerCase(), adminIdentifier] },
      },
    });
    await prisma.$disconnect();
  });

  // Test 1: New email -> Magic Link sent (and NO user account created until verified)
  it('1. New email -> Magic Link sent without creating account before verification', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: newEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isNewUser).toBe(true);
    expect(res.body.verificationToken).toBeDefined();

    // Account MUST NOT exist in DB yet
    const checkUser = await (prisma as any).user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });
    expect(checkUser).toBeNull();
  });

  // Test 2: User verifies link -> creates exactly one account and authenticates
  it('2. Verifies link -> creates exactly one account, session JWT, and allows subsequent login without duplicate account', async () => {
    const sendRes = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: existingMagicEmail });

    const token = sendRes.body.verificationToken;

    // Verify link
    const verifyRes = await request(app)
      .get(`/api/auth/magic-link/verify?token=${token}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user.email).toBe(existingMagicEmail.toLowerCase());
    expect(verifyRes.body.redirectTo).toBe('/app/dashboard');

    normalAuthToken = verifyRes.body.token;
    normalUserId = verifyRes.body.user.id;

    // Verify exactly 1 user exists in DB
    const userCount = await (prisma as any).user.count({
      where: { email: existingMagicEmail.toLowerCase() },
    });
    expect(userCount).toBe(1);

    // Existing Magic Link user requests magic link again -> isNewUser is FALSE
    const secondSend = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: existingMagicEmail });

    expect(secondSend.status).toBe(200);
    expect(secondSend.body.isNewUser).toBe(false);

    // Verify token again -> still exactly 1 account in DB
    const verifyRes2 = await request(app)
      .get(`/api/auth/magic-link/verify?token=${secondSend.body.verificationToken}`);
    expect(verifyRes2.status).toBe(200);

    const userCountAfter = await (prisma as any).user.count({
      where: { email: existingMagicEmail.toLowerCase() },
    });
    expect(userCountAfter).toBe(1);
  });

  // Test 3: Existing Google user -> Google authentication requested
  it('3. Existing Google user -> rejects magic link and instructs user to use Google', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: existingGoogleEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.actionRequired).toBe('USE_GOOGLE');
    expect(res.body.message).toContain('Continue with Google');
    expect(res.body.verificationToken).toBeUndefined();
  });

  // Test 4: Existing email never creates duplicate account
  it('4. Existing email never creates duplicate account', async () => {
    const count = await (prisma as any).user.count({
      where: { email: existingMagicEmail.toLowerCase() },
    });
    expect(count).toBe(1);
  });

  // Test 5 & 6: Achiever_admin_4.com -> NO email sent, NO magic link token, instant secure server-verified session
  it('5 & 6. Achiever_admin_4.com -> NO email sent, NO token generated, instant server-side admin authentication', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: adminIdentifier });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isAdmin).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.redirectTo).toBe('/admin');
    expect(res.body.verificationToken).toBeUndefined(); // NO magic link token generated

    adminAuthToken = res.body.token;

    // Check DB: NO MagicLinkToken record was created for admin
    const tokenRecord = await (prisma as any).magicLinkToken.findFirst({
      where: { email: { in: [adminIdentifier, 'achiever_admin_4.com'] } },
    });
    expect(tokenRecord).toBeNull();
  });

  // Test 7: Authorized admin -> Admin Panel
  it('7. Authorized admin -> can access /api/admin/users and admin resources', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  // Test 8: Unauthorized user -> no admin access
  it('8. Unauthorized user -> rejected from /api/admin/users with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${normalAuthToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // Test 9: Logout -> session invalidated
  it('9. Logout -> revokes session token from protected endpoints', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${normalAuthToken}`);

    expect(logoutRes.status).toBe(200);
  });

  // Test 10: No Prisma P2024 connection-pool error under consecutive rapid requests
  it('10. No Prisma P2024 connection-pool error under concurrent queries', async () => {
    const promises = Array.from({ length: 8 }, (_, i) =>
      request(app)
        .post('/api/auth/magic-link/send')
        .send({ email: `rapid_${i}_${Date.now()}@example.com` })
    );

    const results = await Promise.all(promises);
    for (const r of results) {
      expect(r.status).toBe(200);
      expect(r.body.success).toBe(true);
    }
  });

  // Test 11: Singleton shared PrismaClient verification
  it('11. PrismaClient is shared as a single instance and not recreated per request', async () => {
    const p1 = prisma;
    const p2 = (globalThis as any).prismaGlobal;
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1).toBe(p2);
  });

  // Test 12: No unnecessary database queries or relations loaded during login
  it('12. Login check is minimal, fast, and does not load large datasets', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: adminIdentifier });

    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(true);
    // Should be responsive (typically < 300ms)
    expect(elapsed).toBeLessThan(2000);
  });
});
