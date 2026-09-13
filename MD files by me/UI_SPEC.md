# UI Specification

## Creative direction

The statement explicitly rejects generic enterprise dashboards and rewards a cohesive, alive, tactile theme. fileciteturn2file0L13-L27

Recommended direction:

# **Adventure HUD / Modern RPG**

Dark, premium, slightly mysterious, with strong typography and restrained glowing accents.

Do not copy an existing game's visual identity.

## Main dashboard

```text
┌──────────────────────────────────────────────────────────────┐
│ LIFE RPG          LVL 12 · 1,840 XP         1,240 GOLD      │
├────────────┬───────────────────────────────┬────────────────┤
│ QUESTS     │        TODAY'S QUESTS          │ CHARACTER      │
│            │                               │                │
│ Dashboard  │ [ ] Study React      +70 XP   │ Intellect  18  │
│ Quests     │ [ ] Gym              +55 XP   │ Strength   14  │
│ Character  │ [✓] Read 20 pages    +40 XP   │ Wisdom     21  │
│ Armory     │                               │ Charisma   10  │
│ History    │     STREAK: 🔥 7 DAYS         │ Vitality   13  │
│            │                               │                │
│            │  ████████████░░  78%          │ [View Stats]   │
└────────────┴───────────────────────────────┴────────────────┘
```

## Core visual hierarchy

1. Today's actionable quests.
2. Character progression.
3. Streak.
4. Rewards.
5. Secondary statistics.

Do not overload the screen with 30 metrics.

## Celebration system

### Task complete

Use:
- checkmark transformation
- XP fly-up
- subtle particle burst
- gold counter increment
- progress animation
- attribute pulse

### Level up

Use:
- modal or full-width celebration
- level number
- unlocked item/reward
- strong visual animation
- dismissible interaction

## Optimistic UI

The statement explicitly encourages loading skeletons, optimistic updates and smooth transitions. fileciteturn2file0L25-L27

Use optimistic feedback only where rollback is safe.

Do not show permanent reward numbers before server confirmation when the final value can differ.

## Mobile

The mobile layout must prioritize:
- today quests
- complete action
- XP/streak
- character
- shop access

Use bottom navigation or compact navigation when useful.

## Components

- AppShell
- Sidebar/Nav
- QuestCard
- QuestComposer
- XPBar
- LevelBadge
- StreakWidget
- AttributeCard
- RewardToast
- LevelUpModal
- CharacterPanel
- ShopItemCard
- InventoryGrid
- BadgeCard
- ConfirmationDialog
- ErrorBanner
- LoadingSkeleton

## Forms

Every form needs:
- labels
- validation
- disabled submit while pending
- clear errors
- keyboard support

## Theme system

Themes should be actual persisted inventory-owned cosmetics.

Equipping a theme should update the application's design tokens, not replace the application logic.

## Avoid

- default Shadcn-looking screens
- giant gradient hero sections
- random glassmorphism
- excessive neon
- animation everywhere
- confetti on every click
