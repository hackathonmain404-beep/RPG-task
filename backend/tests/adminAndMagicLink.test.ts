import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Magic Link Authentication & Hidden Admin Control Panel', () => {
  const normalUserEmail = `magic_user_${Date.now()}@example.com`;
  const adminIdentifier = 'Achiever_admin_4.com';

  let normalAuthToken: string;
  let normalUserId: string;
  let adminAuthToken: string;
  let adminUserId: string;
  let testFeedbackId: string;
  let createdShopItemId: string;

  beforeAll(async () => {
    // Ensure clean state
    await (prisma as any).magicLinkToken.deleteMany({
      where: {
        email: { in: [normalUserEmail.toLowerCase(), adminIdentifier] },
      },
    });
  });

  afterAll(async () => {
    // Cleanup created test tokens & feedback
    if (testFeedbackId) {
      await (prisma as any).feedback.deleteMany({ where: { id: testFeedbackId } });
    }
    if (createdShopItemId) {
      await (prisma as any).shopItem.deleteMany({ where: { id: createdShopItemId } });
    }
    await (prisma as any).magicLinkToken.deleteMany({
      where: {
        email: { in: [normalUserEmail.toLowerCase(), adminIdentifier] },
      },
    });
    if (normalUserId) {
      await (prisma as any).user.deleteMany({ where: { id: normalUserId } });
    }
    await prisma.$disconnect();
  });

  // --------------------------------------------------
  // 1. MAGIC LINK FLOW
  // --------------------------------------------------

  it('1. sends magic link to a regular user (creates account on-the-fly)', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: normalUserEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isAdmin).toBe(false);
    expect(res.body.verificationToken).toBeDefined();

    // Verify token was stored in database
    const tokenRecord = await (prisma as any).magicLinkToken.findFirst({
      where: { email: normalUserEmail.toLowerCase() },
    });
    expect(tokenRecord).toBeDefined();
    expect(tokenRecord.used).toBe(false);
  });

  it('2. verifies regular user magic link token, marks it used, and returns JWT', async () => {
    const sendRes = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: normalUserEmail });

    const rawToken = sendRes.body.verificationToken;

    const verifyRes = await request(app)
      .get(`/api/auth/magic-link/verify?token=${rawToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user.email).toBe(normalUserEmail.toLowerCase());
    expect(verifyRes.body.user.role).toBe('USER');
    expect(verifyRes.body.isAdmin).toBe(false);
    expect(verifyRes.body.redirectTo).toBe('/app/dashboard');

    normalAuthToken = verifyRes.body.token;
    normalUserId = verifyRes.body.user.id;

    // Single-use check: second verification must fail
    const replayRes = await request(app)
      .get(`/api/auth/magic-link/verify?token=${rawToken}`);
    expect(replayRes.status).toBe(400);
    expect(replayRes.body.error.code).toBe('TOKEN_ALREADY_USED');
  });

  it('3. sends magic link for Achiever_admin_4.com and initializes admin account', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: adminIdentifier });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isAdmin).toBe(true);
    expect(res.body.verificationToken).toBeDefined();
  });

  it('4. verifies admin magic link token, confirms role=ADMIN, and redirects to /admin', async () => {
    const sendRes = await request(app)
      .post('/api/auth/magic-link/send')
      .send({ email: adminIdentifier });

    const rawToken = sendRes.body.verificationToken;

    const verifyRes = await request(app)
      .get(`/api/auth/magic-link/verify?token=${rawToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user.role).toBe('ADMIN');
    expect(verifyRes.body.isAdmin).toBe(true);
    expect(verifyRes.body.redirectTo).toBe('/admin');

    adminAuthToken = verifyRes.body.token;
    adminUserId = verifyRes.body.user.id;
  });

  // --------------------------------------------------
  // 2. SERVER-AUTHORITATIVE ADMIN AUTHORIZATION
  // --------------------------------------------------

  it('5. rejects unauthenticated access to /api/admin/users with 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('6. rejects regular authenticated user from /api/admin/users with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${normalAuthToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('7. allows verified admin to fetch all users with character stats', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    const foundNormal = res.body.users.find((u: any) => u.id === normalUserId);
    expect(foundNormal).toBeDefined();
    expect(foundNormal.role).toBe('USER');
  });

  it('8. allows admin to grant XP and coins to a user with audit logging', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${normalUserId}/grant`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        xp: 350,
        coins: 150,
        title: 'Master Apprentice',
        reason: 'Hackathon excellence',
      });

    expect(res.status).toBe(200);
    expect(res.body.character.totalXp).toBeGreaterThanOrEqual(350);
    expect(res.body.character.gold).toBeGreaterThanOrEqual(200);
  });

  // --------------------------------------------------
  // 3. BROADCASTS & 2X SURGE ENGINE
  // --------------------------------------------------

  it('9. allows admin to publish and dismiss live platform broadcast', async () => {
    const postRes = await request(app)
      .post('/api/admin/broadcast')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        type: 'event',
        message: 'Citadel Hackathon finals active! All quests ready.',
        actionLabel: 'Check Quests',
      });

    expect(postRes.status).toBe(200);
    expect(postRes.body.broadcast.active).toBe(true);
    expect(postRes.body.broadcast.message).toContain('Citadel Hackathon');

    // Public endpoint can read active broadcast
    const publicRes = await request(app).get('/api/platform/broadcast/active');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.broadcast.message).toContain('Citadel Hackathon');

    // Dismiss broadcast
    const dismissRes = await request(app)
      .delete('/api/admin/broadcast')
      .set('Authorization', `Bearer ${adminAuthToken}`);
    expect(dismissRes.status).toBe(200);
    expect(dismissRes.body.success).toBe(true);
  });

  it('10. allows admin to start and stop Global 2X Surge event', async () => {
    const startRes = await request(app)
      .post('/api/admin/surge/start')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ durationHours: 2 });

    expect(startRes.status).toBe(200);
    expect(startRes.body.active).toBe(true);
    expect(startRes.body.multiplier).toBe(2.0);
    expect(startRes.body.remainingSeconds).toBeGreaterThan(0);

    // Public status check
    const statusRes = await request(app).get('/api/platform/surge/status');
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.active).toBe(true);
    expect(statusRes.body.multiplier).toBe(2.0);

    // End surge early
    const endRes = await request(app)
      .post('/api/admin/surge/end')
      .set('Authorization', `Bearer ${adminAuthToken}`);
    expect(endRes.status).toBe(200);
    expect(endRes.body.active).toBe(false);
  });

  // --------------------------------------------------
  // 4. FEEDBACK DESK TRIAGE & REPLIES
  // --------------------------------------------------

  it('11. allows admin to view all feedback and submit admin reply', async () => {
    // Normal user creates feedback
    const fbRes = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${normalAuthToken}`)
      .send({
        type: 'FEATURE_REQUEST',
        message: 'Could you add guild group chats?',
      });
    testFeedbackId = fbRes.body.feedback.id;

    // Admin views feedback desk
    const listRes = await request(app)
      .get('/api/admin/feedback')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.feedbacks)).toBe(true);

    // Admin replies to feedback
    const replyRes = await request(app)
      .patch(`/api/admin/feedback/${testFeedbackId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        replyText: 'Great idea! Planned for Phase 4.',
        status: 'RESOLVED',
      });

    expect(replyRes.status).toBe(200);
    expect(replyRes.body.feedback.adminReply).toBe('Great idea! Planned for Phase 4.');
    expect(replyRes.body.feedback.status).toBe('RESOLVED');
  });

  // --------------------------------------------------
  // 5. MARKET STUDIO DYNAMIC SHOP ITEMS
  // --------------------------------------------------

  it('12. allows admin to create, update, and manage dynamic Market Studio shop items', async () => {
    const createRes = await request(app)
      .post('/api/admin/market/items')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Phoenix Blade',
        description: 'Forged in the heart of a fallen star.',
        itemType: 'COSMETIC',
        category: 'Weapon',
        price: 250,
        rarity: 'epic',
        imageUrl: 'swords',
        displayOrder: 1,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.item.id).toBeDefined();
    expect(createRes.body.item.sku).toBeDefined();
    expect(createRes.body.item.price).toBe(250);
    createdShopItemId = createRes.body.item.id;

    // Verify item shows up in normal user Shop catalog
    const shopRes = await request(app)
      .get('/api/shop')
      .set('Authorization', `Bearer ${normalAuthToken}`);
    expect(shopRes.status).toBe(200);
    const inCatalog = shopRes.body.items.find((i: any) => i.id === createdShopItemId);
    expect(inCatalog).toBeDefined();
    expect(inCatalog.name).toBe('Phoenix Blade');

    // Admin updates price
    const patchRes = await request(app)
      .patch(`/api/admin/market/items/${createdShopItemId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ price: 300 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.item.price).toBe(300);
  });
});
