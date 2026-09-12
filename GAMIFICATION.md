# GAMIFICATION SYSTEM SPECIFICATION

**Canonical Authority:** Server-Side Authoritative  
**Covers:** Streaks, Attributes, In-Game Economy, Shop Purchases, Badges

---

## 1. Streaks Engine

### Streak Rules
1. **Time Window:** Evaluated against UTC calendar days (or user-configured timezone offset).
2. **First Activity Ever:** `streakDays = 1`.
3. **Same Day Completion:** If a user completes another task on the same UTC day as `lastActiveDate`, the streak count remains intact (does not double-increment).
4. **Consecutive Day Completion:** If the current UTC day is exactly 1 calendar day after `lastActiveDate`, `streakDays` increments by 1.
5. **Broken Streak:** If more than 1 calendar day has elapsed since `lastActiveDate`, the streak resets to 1.

### Streak Calculation Logic

```typescript
export interface StreakResult {
  streakDays: number;
  isStreakIncreased: boolean;
  isStreakReset: boolean;
}

export function evaluateStreak(lastActiveDate: Date | null, currentDate: Date = new Date()): StreakResult {
  if (!lastActiveDate) {
    return { streakDays: 1, isStreakIncreased: true, isStreakReset: false };
  }

  const lastUtc = Date.UTC(lastActiveDate.getUTCFullYear(), lastActiveDate.getUTCMonth(), lastActiveDate.getUTCDate());
  const currentUtc = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
  const diffDays = Math.floor((currentUtc - lastUtc) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day
    return { streakDays: -1, isStreakIncreased: false, isStreakReset: false };
  } else if (diffDays === 1) {
    // Consecutive day
    return { streakDays: 1, isStreakIncreased: true, isStreakReset: false };
  } else {
    // Broken streak
    return { streakDays: 1, isStreakIncreased: false, isStreakReset: true };
  }
}
```

---

## 2. Character Attributes

Tasks are assigned one of 5 RPG attributes:

| Attribute | Focus Area | Example Real-World Activities |
|---|---|---|
| **`STRENGTH`** | Physical Power & Fitness | Weightlifting, calisthenics, running, martial arts |
| **`INTELLECT`** | Knowledge & Problem Solving | Coding, reading textbooks, research, puzzles |
| **`DISCIPLINE`** | Routine & Willpower | Deep work blocks, waking at 6 AM, cleaning room |
| **`CREATIVITY`** | Artistic & Lateral Expression | Writing, sketching, guitar practice, UI design |
| **`VITALITY`** | Health & Recovery | 8 hours sleep, hydration, meditation, healthy meals |

### Attribute Milestones & Tiers
- **Novice (10 - 49):** Baseline starting stats.
- **Adept (50 - 99):** Unlocks Adept class title for that attribute.
- **Master (100 - 199):** Unlocks special glowing badge and profile flair.
- **Grandmaster (200+):** Apex tier.

---

## 3. Virtual Economy & Shop

### Gold Economy
- Starting Balance: **50 Gold** upon user registration.
- Income:
  - `TRIVIAL`: +5 Gold
  - `EASY`: +15 Gold
  - `MEDIUM`: +35 Gold
  - `HARD`: +75 Gold
  - `EPIC`: +150 Gold
  - Streak Bonus: Every 7 consecutive days awards a **+50 Gold** milestone bonus.

### Purchase Transaction Rules
1. **Server Pricing:** Prices are strictly queried from the `Item` database table.
2. **Balance Verification:** The transaction checks `character.gold >= item.cost`. If not, rejects with `INSUFFICIENT_GOLD`.
3. **Uniqueness Check:** If `item.isUnique === true`, the database checks if `[userId, itemId]` exists in `Inventory`. If yes, rejects with `ITEM_ALREADY_OWNED`.
4. **Atomic Execution:** `character.gold` deduction and `Inventory` row insertion occur inside a single atomic transaction.
