# RPG PROGRESSION ENGINE SPECIFICATION

**Canonical Authority:** Server-Side Authoritative  
**Primary File:** `src/services/rpgEngine.service.ts`

---

## 1. Core Mathematical Philosophy

The progression engine translates real-world habits into an engaging, non-linear virtual progression loop. To maintain engagement and provide long-term progression without runaway inflation, the level curve is strictly non-linear: **each subsequent level requires progressively more XP than the last**.

---

## 2. Non-Linear Leveling Formula

### Formula
For a character at Level $L$, the XP required to reach Level $L + 1$ is calculated by:

$$\text{NextLevelXP}(L) = \lfloor 100 \times L^{1.5} \rfloor$$

### Level Progression Table (Levels 1 to 15)

| Level ($L$) | XP Needed for Next Level | Cumulative XP from Level 1 |
|:---:|:---:|:---:|
| **1** | 100 XP | 0 XP |
| **2** | 282 XP | 100 XP |
| **3** | 519 XP | 382 XP |
| **4** | 800 XP | 901 XP |
| **5** | 1,118 XP | 1,701 XP |
| **6** | 1,469 XP | 2,819 XP |
| **7** | 1,852 XP | 4,288 XP |
| **8** | 2,262 XP | 6,140 XP |
| **9** | 2,700 XP | 8,402 XP |
| **10** | 3,162 XP | 11,102 XP |
| **11** | 3,648 XP | 14,264 XP |
| **12** | 4,156 XP | 17,912 XP |
| **13** | 4,687 XP | 22,068 XP |
| **14** | 5,239 XP | 26,755 XP |
| **15** | 5,813 XP | 31,994 XP |

---

## 3. Server-Authoritative Reward Matrix

Clients only submit task IDs. The server looks up the task's registered difficulty in the database and authoritatively dispenses XP and Gold:

| Difficulty | Base XP Reward | Base Gold Reward | Attribute Gain |
|---|:---:|:---:|:---:|
| `TRIVIAL` | +10 XP | +5 Gold | +1 |
| `EASY` | +25 XP | +15 Gold | +2 |
| `MEDIUM` | +50 XP | +35 Gold | +5 |
| `HARD` | +100 XP | +75 Gold | +10 |
| `EPIC` | +200 XP | +150 Gold | +20 |

---

## 4. Level-Up Transition Algorithm

When a quest is completed, `currentXp` increases. If `currentXp >= nextLevelXp`, the character transitions to the next level. If the XP gained is large enough to bridge multiple levels, the loop processes each transition sequentially:

```typescript
export interface LevelState {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  didLevelUp: boolean;
  oldLevel: number;
}

export function calculateXpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function processXpGain(
  currentLevel: number,
  currentXp: number,
  totalXp: number,
  xpEarned: number
): LevelState {
  let level = currentLevel;
  let xp = currentXp + xpEarned;
  const newTotalXp = totalXp + xpEarned;
  let nextXp = calculateXpForNextLevel(level);
  let didLevelUp = false;

  while (xp >= nextXp) {
    xp -= nextXp;
    level += 1;
    didLevelUp = true;
    nextXp = calculateXpForNextLevel(level);
  }

  return {
    level,
    currentXp: xp,
    nextLevelXp: nextXp,
    totalXp: newTotalXp,
    didLevelUp,
    oldLevel: currentLevel
  };
}
```

---

## 5. Anti-Cheat & Determinism Invariants

1. **Client Trust:** No XP, Gold, or stat parameter from the client is ever honored.
2. **Double Completion Guard:** `Task.status` MUST be `PENDING` at the start of the transaction. A second completion request immediately returns `TASK_ALREADY_COMPLETED (409)`.
3. **Idempotent State Changes:** All calculations are pure, deterministic functions driven strictly by the task's database records.
