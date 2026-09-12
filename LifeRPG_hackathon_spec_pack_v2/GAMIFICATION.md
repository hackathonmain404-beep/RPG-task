# Gamification System

## 1. Streaks

### Definition

A streak counts consecutive calendar days on which the user completes at least one task.

The timezone policy must be explicit. Recommended:
use the user's profile timezone or a server-defined default and compare calendar dates in that timezone.

### Rules

Same day:
- completing multiple tasks does not add multiple streak days.

Next consecutive day:
- streak +1.

More than one missed calendar day:
- reset to 1 on the next active day.

Best streak:
- store historical maximum.

### Feedback

Completing today's first quest can trigger:
- streak flame animation
- current streak
- best streak
- motivational copy

## 2. Attributes

Recommended:
- Intellect
- Strength
- Wisdom
- Charisma
- Vitality

Example category mapping:

```text
Coding         → Intellect
Study          → Wisdom
Gym            → Strength
Social         → Charisma
Sleep/Health   → Vitality
```

Completing a task gives attribute XP/value according to category.

Do not allow the client to choose arbitrary attribute rewards outside valid category mappings.

## 3. Rewards

Completion can award:
- XP
- Gold
- attribute progression

Reward magnitude should depend on:
- category
- difficulty
- optional effort/time
- anti-abuse constraints

Avoid reward inflation.

## 4. Economy

Gold can purchase:
- themes
- profile frames
- badges
- avatars/cosmetics
- unlockable UI decorations

Every purchase:
- checks current price server-side
- atomically deducts gold
- creates inventory ownership

## 5. Badges

Example badges:
- First Quest
- Seven-Day Flame
- Quest Master
- Early Riser
- Scholar
- Iron Will
- Jack of All Trades

Unlock conditions should be deterministic from server data.

## 6. Reward presentation

Rewards should feel immediate:
- XP number floats
- progress bar moves
- gold count updates
- attribute meter fills
- toast/celebration appears
- level-up gets a stronger presentation

Animations must not block keyboard or screen-reader interaction.
