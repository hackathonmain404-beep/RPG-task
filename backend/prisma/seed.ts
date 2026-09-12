import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding economy data...');

  // ─── Shop Items ───────────────────────────────────────────────────────────

  const shopItems = [
    {
      sku: 'theme_cyberpunk',
      name: 'Cyberpunk Theme',
      description: 'Neon-soaked dystopian interface with glitch effects',
      itemType: 'THEME',
      price: 250,
      rarity: 'rare',
    },
    {
      sku: 'theme_lofi',
      name: 'Lo-Fi Theme',
      description: 'Calm pastel aesthetic with smooth animations',
      itemType: 'THEME',
      price: 200,
      rarity: 'uncommon',
    },
    {
      sku: 'theme_retro',
      name: 'Retro Theme',
      description: 'Pixel-art inspired classic gaming interface',
      itemType: 'THEME',
      price: 150,
      rarity: 'uncommon',
    },
    {
      sku: 'frame_golden',
      name: 'Golden Frame',
      description: 'A shimmering golden border for your profile',
      itemType: 'COSMETIC',
      price: 300,
      rarity: 'epic',
    },
    {
      sku: 'badge_shadow',
      name: 'Shadow Badge',
      description: 'A mysterious dark emblem of dedication',
      itemType: 'BADGE',
      price: 100,
      rarity: 'common',
    },
    {
      sku: 'avatar_phoenix',
      name: 'Phoenix Avatar',
      description: 'Rise from the ashes with this legendary avatar',
      itemType: 'COSMETIC',
      price: 500,
      rarity: 'legendary',
    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { sku: item.sku },
      update: item,
      create: item,
    });
  }
  console.log(`  ✅ ${shopItems.length} shop items seeded`);

  // ─── Badges ───────────────────────────────────────────────────────────────

  const badges = [
    {
      key: 'first_quest',
      name: 'First Quest',
      description: 'Complete your first task.',
      icon: 'sword',
      unlockRuleJson: { type: 'task_count', threshold: 1 },
    },
    {
      key: 'seven_day_flame',
      name: 'Seven-Day Flame',
      description: 'Achieve a 7-day streak.',
      icon: 'flame',
      unlockRuleJson: { type: 'streak', threshold: 7 },
    },
    {
      key: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 50 total tasks.',
      icon: 'trophy',
      unlockRuleJson: { type: 'task_count', threshold: 50 },
    },
    {
      key: 'early_riser',
      name: 'Early Riser',
      description: 'Complete a task before 8:00 AM.',
      icon: 'sunrise',
      unlockRuleJson: { type: 'early_completion', hour: 8 },
    },
    {
      key: 'scholar',
      name: 'Scholar',
      description: 'Reach 50 Wisdom.',
      icon: 'books',
      unlockRuleJson: { type: 'attribute', key: 'wisdom', threshold: 50 },
    },
    {
      key: 'iron_will',
      name: 'Iron Will',
      description: 'Reach 50 Strength.',
      icon: 'muscle',
      unlockRuleJson: { type: 'attribute', key: 'strength', threshold: 50 },
    },
    {
      key: 'jack_of_all_trades',
      name: 'Jack of All Trades',
      description: 'Raise all 5 attributes above 20.',
      icon: 'mask',
      unlockRuleJson: { type: 'all_attributes', threshold: 20 },
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: { name: badge.name, description: badge.description, icon: badge.icon, unlockRuleJson: badge.unlockRuleJson },
      create: badge,
    });
  }
  console.log(`  ✅ ${badges.length} badges seeded`);

  // ─── Themes ───────────────────────────────────────────────────────────────

  const themes = [
    {
      key: 'default',
      name: 'Default',
      description: 'The classic Life RPG experience',
      price: 0,
      themeJson: { primary: '#6366f1', secondary: '#8b5cf6', background: '#0f172a' },
    },
    {
      key: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Neon-soaked dystopian aesthetics',
      price: 250,
      themeJson: { primary: '#f43f5e', secondary: '#06b6d4', background: '#0a0a0a' },
    },
    {
      key: 'lofi',
      name: 'Lo-Fi',
      description: 'Calm pastel tones for a relaxed vibe',
      price: 200,
      themeJson: { primary: '#f472b6', secondary: '#a78bfa', background: '#1e1b2e' },
    },
    {
      key: 'retro',
      name: 'Retro',
      description: 'Pixel-art inspired classic gaming',
      price: 150,
      themeJson: { primary: '#4ade80', secondary: '#facc15', background: '#1a1a2e' },
    },
    {
      key: 'dark_scholar',
      name: 'Dark Scholar',
      description: 'Elegant dark theme for the studious',
      price: 180,
      themeJson: { primary: '#c084fc', secondary: '#67e8f9', background: '#0c0a1d' },
    },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { key: theme.key },
      update: { name: theme.name, description: theme.description, price: theme.price, themeJson: theme.themeJson },
      create: theme,
    });
  }
  console.log(`  ✅ ${themes.length} themes seeded`);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
