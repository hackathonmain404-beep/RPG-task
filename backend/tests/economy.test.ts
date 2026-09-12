import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

/**
 * Phase 5 Integration Tests — Economy + Inventory
 *
 * Tests: shop catalog, purchase transactions, inventory ownership,
 * user isolation, badge/theme catalogs, equip functionality.
 */
describe('Economy & Inventory — Integration', () => {
  // ─── Test Users ────────────────────────────────────────────────────────────

  const userA = {
    email: `econ_a_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Economy User A',
  };
  const userB = {
    email: `econ_b_${Date.now()}@example.com`,
    password: 'securePassword123!',
    displayName: 'Economy User B',
  };
  let tokenA: string;
  let tokenB: string;
  let shopItemId: string;
  let cheapItemId: string;

  beforeAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({ where: { email: { in: [userA.email, userB.email] } } });

    // Register users
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.token;

    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenB = resB.body.token;

    // Seed shop items for testing
    const expensiveItem = await prisma.shopItem.upsert({
      where: { sku: 'test_expensive' },
      update: { price: 9999, active: true },
      create: {
        sku: 'test_expensive',
        name: 'Expensive Test Item',
        description: 'Too expensive for default gold',
        itemType: 'COSMETIC',
        price: 9999,
        rarity: 'legendary',
      },
    });

    const cheapItem = await prisma.shopItem.upsert({
      where: { sku: 'test_cheap' },
      update: { price: 10, active: true },
      create: {
        sku: 'test_cheap',
        name: 'Cheap Test Item',
        description: 'Affordable test item',
        itemType: 'COSMETIC',
        price: 10,
        rarity: 'common',
      },
    });

    shopItemId = expensiveItem.id;
    cheapItemId = cheapItem.id;

    // Seed an inactive item
    await prisma.shopItem.upsert({
      where: { sku: 'test_inactive' },
      update: { active: false },
      create: {
        sku: 'test_inactive',
        name: 'Inactive Item',
        description: 'This item is not available',
        itemType: 'COSMETIC',
        price: 1,
        active: false,
      },
    });

    // Seed badges for catalog testing
    await prisma.badge.upsert({
      where: { key: 'test_badge' },
      update: {},
      create: {
        key: 'test_badge',
        name: 'Test Badge',
        description: 'A test badge',
        icon: 'flask',
      },
    });

    // Seed themes for catalog testing
    await prisma.theme.upsert({
      where: { key: 'test_theme' },
      update: { price: 10, active: true },
      create: {
        key: 'test_theme',
        name: 'Test Theme',
        description: 'A test theme',
        price: 10,
        themeJson: { primary: '#ff0000' },
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.activityLog.deleteMany({
      where: { user: { email: { in: [userA.email, userB.email] } } },
    });
    await prisma.inventoryItem.deleteMany({
      where: { user: { email: { in: [userA.email, userB.email] } } },
    });
    await prisma.user.deleteMany({ where: { email: { in: [userA.email, userB.email] } } });
    await prisma.shopItem.deleteMany({ where: { sku: { startsWith: 'test_' } } });
    await prisma.badge.deleteMany({ where: { key: 'test_badge' } });
    await prisma.theme.deleteMany({ where: { key: 'test_theme' } });
    await prisma.$disconnect();
  });

  // ─── SHOP CATALOG ──────────────────────────────────────────────────────────

  describe('GET /api/shop', () => {
    it('should return active shop items', async () => {
      const res = await request(app)
        .get('/api/shop')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);

      // All returned items must be active
      for (const item of res.body.items) {
        expect(item.active).toBe(true);
      }
    });

    it('should NOT include inactive items', async () => {
      const res = await request(app)
        .get('/api/shop')
        .set('Authorization', `Bearer ${tokenA}`);

      const inactiveItem = res.body.items.find((i: { sku: string }) => i.sku === 'test_inactive');
      expect(inactiveItem).toBeUndefined();
    });

    it('should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/shop');
      expect(res.status).toBe(401);
    });
  });

  // ─── PURCHASE ──────────────────────────────────────────────────────────────

  describe('POST /api/shop/:itemId/purchase', () => {
    it('should successfully purchase an affordable item', async () => {
      const res = await request(app)
        .post(`/api/shop/${cheapItemId}/purchase`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.purchase).toBeDefined();
      expect(res.body.purchase.price).toBe(10);
      expect(res.body.wallet).toBeDefined();
      expect(res.body.wallet.gold).toBe(40); // 50 starting - 10
      expect(res.body.inventoryItem).toBeDefined();
      expect(res.body.inventoryItem.itemId).toBe(cheapItemId);
    });

    it('should reject purchase with insufficient gold', async () => {
      const res = await request(app)
        .post(`/api/shop/${shopItemId}/purchase`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_GOLD');
    });

    it('should reject duplicate purchase (ALREADY_OWNED)', async () => {
      const res = await request(app)
        .post(`/api/shop/${cheapItemId}/purchase`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_OWNED');
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .post('/api/shop/nonexistent_id/purchase')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject unauthenticated purchase (401)', async () => {
      const res = await request(app)
        .post(`/api/shop/${cheapItemId}/purchase`);

      expect(res.status).toBe(401);
    });
  });

  // ─── INVENTORY ─────────────────────────────────────────────────────────────

  describe('GET /api/inventory', () => {
    it('should return User A\'s purchased items', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);

      // Should contain the cheap item we purchased
      const cheapInv = res.body.items.find(
        (i: { shopItem: { sku: string } }) => i.shopItem.sku === 'test_cheap'
      );
      expect(cheapInv).toBeDefined();
    });

    it('should NOT show User A\'s items in User B\'s inventory (user isolation)', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(0); // B hasn't purchased anything
    });

    it('should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/inventory');
      expect(res.status).toBe(401);
    });
  });

  // ─── PURCHASE PERSISTENCE ──────────────────────────────────────────────────

  describe('Purchase Persistence', () => {
    it('should persist gold deduction across API calls', async () => {
      // Check that User A's gold was actually deducted
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(meRes.status).toBe(200);
      // User A started with 50 gold, spent 10
      expect(meRes.body.user.character.gold).toBe(40);
    });

    it('should persist inventory ownership across API calls', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── EQUIP ─────────────────────────────────────────────────────────────────

  describe('POST /api/inventory/:itemId/equip', () => {
    it('should equip an owned item', async () => {
      // First get the inventory item ID
      const invRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokenA}`);

      const inventoryItemId = invRes.body.items[0].id;

      const res = await request(app)
        .post(`/api/inventory/${inventoryItemId}/equip`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.equipped).toBeDefined();
      expect(res.body.equipped.id).toBe(inventoryItemId);
    });

    it('should return 404 for unowned item', async () => {
      const res = await request(app)
        .post('/api/inventory/nonexistent_id/equip')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent User B from equipping User A\'s item', async () => {
      const invRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${tokenA}`);

      const inventoryItemId = invRes.body.items[0].id;

      const res = await request(app)
        .post(`/api/inventory/${inventoryItemId}/equip`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it('should reject unauthenticated equip (401)', async () => {
      const res = await request(app)
        .post('/api/inventory/any_id/equip');
      expect(res.status).toBe(401);
    });
  });

  // ─── BADGES ────────────────────────────────────────────────────────────────

  describe('GET /api/badges', () => {
    it('should return badge catalog with unlock states', async () => {
      const res = await request(app)
        .get('/api/badges')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.badges)).toBe(true);
      expect(res.body.badges.length).toBeGreaterThanOrEqual(1);

      // Each badge should have unlock state
      for (const badge of res.body.badges) {
        expect(typeof badge.unlocked).toBe('boolean');
        expect(badge.name).toBeDefined();
        expect(badge.icon).toBeDefined();
      }
    });

    it('should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/badges');
      expect(res.status).toBe(401);
    });
  });

  // ─── THEMES ────────────────────────────────────────────────────────────────

  describe('GET /api/badges/themes', () => {
    it('should return theme catalog with ownership state', async () => {
      const res = await request(app)
        .get('/api/badges/themes')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.themes)).toBe(true);
      expect(res.body.themes.length).toBeGreaterThanOrEqual(1);

      // Each theme should have ownership state
      for (const theme of res.body.themes) {
        expect(typeof theme.owned).toBe('boolean');
        expect(theme.name).toBeDefined();
        expect(theme.price).toBeDefined();
      }
    });

    it('should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/badges/themes');
      expect(res.status).toBe(401);
    });
  });

  // ─── ACTIVITY LOG (audit) ──────────────────────────────────────────────────

  describe('ActivityLog Audit Trail', () => {
    it('should record purchase activity in database', async () => {
      const userRecord = await prisma.user.findUnique({
        where: { email: userA.email },
      });

      const logs = await prisma.activityLog.findMany({
        where: { userId: userRecord!.id, eventType: 'PURCHASE' },
      });

      expect(logs.length).toBeGreaterThanOrEqual(1);
      const purchaseLog = logs[0];
      expect(purchaseLog.eventType).toBe('PURCHASE');
      expect(purchaseLog.metadataJson).toBeDefined();
    });
  });
});
