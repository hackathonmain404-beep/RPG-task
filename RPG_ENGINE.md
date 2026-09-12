# RPG Progression Engine

## Goal

Create a non-linear level system where every next level requires more XP than the previous level.

---

## 1. Recommended Formula

Use cumulative XP thresholds:

$$\text{XPToReachLevel}(L) = \lfloor \text{BASE\_XP} \times L^{1.65} \rfloor$$

with $\text{BASE\_XP} = 100$.

Do not rely on floating-point equality. Round thresholds deterministically.

### Cumulative Progression Table

| Level ($L$) | Cumulative XP to Reach Level | Incremental XP for This Level |
|:---:|:---:|:---:|
| **1** | 0 XP | — |
| **2** | 100 XP | 100 XP |
| **3** | 310 XP | 210 XP |
| **4** | 621 XP | 311 XP |
| **5** | 1,000 XP | 379 XP |
| **6** | 1,444 XP | 444 XP |
| **7** | 1,947 XP | 503 XP |
| **8** | 2,508 XP | 561 XP |
| **9** | 3,122 XP | 614 XP |
| **10** | 3,788 XP | 666 XP |

The exact values are implementation-defined but MUST strictly increase.

---

## 2. Engine API Requirements

The engine must expose pure, deterministic functions:

```typescript
export interface LevelProgression {
  levelBefore: number;
  levelAfter: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.65));
}

export function getLevelForXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getXpIntoCurrentLevel(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const currentLevelFloor = getXpRequiredForLevel(level);
  return totalXp - currentLevelFloor;
}

export function getXpNeededForNextLevel(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const nextLevelThreshold = getXpRequiredForLevel(level + 1);
  return nextLevelThreshold - totalXp;
}

export function getProgressPercent(totalXp: number): number {
  const level = getLevelForXp(totalXp);
  const currentFloor = getXpRequiredForLevel(level);
  const nextFloor = getXpRequiredForLevel(level + 1);
  const span = nextFloor - currentFloor;
  if (span <= 0) return 100;
  const progress = ((totalXp - currentFloor) / span) * 100;
  return Number(progress.toFixed(2));
}
```

---

## 3. Level-Up Behavior

When completing a task:
1. Read current `totalXp`.
2. Calculate new `totalXp = currentTotalXp + xpAwarded`.
3. Determine `levelBefore = getLevelForXp(currentTotalXp)`.
4. Determine `levelAfter = getLevelForXp(newTotalXp)`.
5. If `levelAfter > levelBefore`:
   - Create level-up event / log.
   - Unlock level-based rewards if configured.
   - Return level-up state and notifications to frontend.

---

## 4. Multi-Level Jumps

If one reward causes multiple level increases, the engine must support it safely.
Example: Level 3 $\rightarrow$ Level 5 from a large reward.

---

## 5. Anti-Cheat

Level and XP are strictly server-owned.

Never allow:
`PATCH /character` with `{ xp: ... }`.

---

## 6. Testing Invariants

For levels 1..N:

$$\text{threshold}(\text{level} + 1) > \text{threshold}(\text{level})$$

Also test:
- 0 XP
- Exact threshold
- One XP below threshold
- One XP above threshold
- Large XP reward
- Multi-level jumps
