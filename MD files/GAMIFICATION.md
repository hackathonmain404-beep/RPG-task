# Gamification System

## 1. Streaks

### Definition

A streak counts consecutive calendar days on which the user completes at least one task.

The timezone policy must be explicit. Recommended:
use the user's profile timezone or a server-defined default (UTC) and compare calendar dates in that timezone.

### Rules

- **Same day:** completing multiple tasks does not add multiple streak days.
- **Next consecutive day:** `streakCurrent + 1`. If `streakCurrent > streakBest`, update `streakBest = streakCurrent`.
- **More than one missed calendar day:** reset `streakCurrent` to 1 on the next active day.
- **Best streak:** store historical maximum in `streakBest`.

### Feedback

Completing today's first quest triggers:
- streak flame animation
- current streak count display
- best streak notification
- motivational feedback

---

## 2. Attributes

5 core character attributes:
- **Intellect**
- **Strength**
- **Wisdom**
- **Charisma**
- **Vitality**

### Category Mapping

| Category | Target Attribute | Real-World Activities |
|---|---|---|
| **Coding / Technical** | `intellect` | Programming, algorithmic problems, debugging |
| **Study / Reading** | `wisdom` | Academic courses, non-fiction reading, language learning |
| **Gym / Fitness** | `strength` | Weightlifting, cardio, sports, physical endurance |
| **Social / Community** | `charisma` | Networking, public speaking, team collaboration |
| **Sleep / Health** | `vitality` | 8 hours sleep, hydration, nutrition, meditation |

Completing a task gives attribute XP/value according to its registered category. The client is never allowed to submit arbitrary attribute rewards.

---

## 3. Rewards

Completion awards:
- **XP**
- **Gold**
- **Attribute progression**

Reward magnitude depends authoritatively on:
- category
- difficulty (`easy`, `medium`, `hard`)

*Standard Reward Matrix:*
- `easy`: +35 XP, +10 Gold, +4 Attribute
- `medium`: +70 XP, +18 Gold, +8 Attribute
- `hard`: +140 XP, +40 Gold, +16 Attribute

Avoid reward inflation.

---

## 4. Economy

Gold can purchase:
- themes (e.g. Cyberpunk, Lo-Fi, Retro)
- profile frames
- badges / relics
- avatars / cosmetics
- unlockable UI decorations

Every purchase:
- checks current price server-side from database
- atomically deducts gold
- creates inventory ownership (`InventoryItem` / `UserTheme` / `UserBadge`)

---

## 5. Badges

Deterministic milestone badges:
- **First Quest:** Complete your first task.
- **Seven-Day Flame:** Achieve a 7-day streak.
- **Quest Master:** Complete 50 total tasks.
- **Early Riser:** Complete a task before 8:00 AM.
- **Scholar:** Reach 50 Wisdom.
- **Iron Will:** Reach 50 Strength.
- **Jack of All Trades:** Raise all 5 attributes above 20.

Unlock conditions are evaluated deterministically from server data during the completion transaction.

---

## 6. Reward Presentation

Rewards feel tactile and immediate:
- floating XP numbers
- smooth animated progress bars
- gold counter roll-up animation
- attribute meter filling
- celebratory toasts / modals upon level-up
- animations must never block keyboard or screen-reader interaction
