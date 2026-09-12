# Testing Strategy & Verification Plan — Life RPG

## 1. Testing Philosophy & Pillars

The frontend testing architecture ensures:
1. **Zero Progression Discrepancy**: The frontend never invents or persists progression numbers independently of the backend API contract.
2. **Accessible Interaction**: Critical user journeys (creating, completing, purchasing, equipping) are verified with keyboard-only navigation.
3. **Resilient Recovery**: Network interruptions, rate-limiting, and error codes gracefully roll back optimistic states without corrupting the UI.

---

## 2. Test Pyramid & Tooling

| Layer | Tools | Scope |
|---|---|---|
| **Unit Tests** | **Vitest** | Pure math functions, formatters, progress percent calculation, date utils. |
| **Component Tests** | **React Testing Library** | Component states, accessibility attributes, keyboard triggers, inline form errors. |
| **Contract Integration** | **Vitest + Mock Service Worker (MSW)** | Verifies frontend service layer against `CONTRACT_FRONTEND_BACKEND.md` endpoints. |
| **E2E Smoke Tests** | **Playwright** | Full browser journey: Register -> Create Quest -> Complete -> Refresh -> Armory -> Equip. |

---

## 3. Frontend Unit & Component Test Scenarios

### A. Pure Utility & Helper Tests (`src/utils/*.test.ts`)
1. **XP Progress Calculation**:
   - `calcProgressPercent(currentXp, nextLevelXp)`: returns `0%` when `currentXp === 0`.
   - Returns deterministic percentage with 2 decimal precision (e.g. `1840 / 2400` -> `76.67%`).
   - Caps display safely at `100%` if unexpected values occur.
2. **Discipline / Category Color Resolver**:
   - Returns correct CSS variable token for `intellect`, `strength`, `wisdom`, `charisma`, `vitality`.
   - Defaults safely to neutral tone for unknown category keys.
3. **Tabular Number Formatter**:
   - Formats large numbers cleanly: `1240` -> `"1,240"`.

### B. Component Integration Tests (`src/components/**/*.test.tsx`)
1. **`QuestCard`**:
   - Renders title, discipline badge, difficulty badge, and XP reward pill.
   - Pressing `Space` or clicking checkbox toggles checked state and invokes `onComplete(id)`.
   - While mutation is pending, button is disabled with `aria-busy="true"`.
2. **`QuestComposer`**:
   - Traps focus inside modal when opened.
   - Displays validation error if title is submitted empty.
   - Submits valid payload with `title`, `categoryKey`, `difficulty`, and optional `dueDate`.
   - Pressing `Escape` invokes `onClose()`.
3. **`XPBar` & `HeaderHUD`**:
   - Verifies `role="progressbar"` with correct `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
   - Verifies Gold counter displays tabular numbers.
   - Verifies Streak flame displays the current streak count.
4. **`LevelUpCelebrationModal`**:
   - Mounts when `levelAfter > levelBefore`.
   - Focus is automatically placed on `[Continue Questing]` button.
   - Pressing `Escape` or clicking the button dismisses the modal.

---

## 4. Contract Compatibility & Mock Scenarios (MSW)

All API mock handlers strictly enforce the contract shapes defined in `CONTRACT_FRONTEND_BACKEND.md`:

### Test Scenario 1: Authoritative Quest Completion
- **Action**: User clicks complete on quest `task_101`.
- **Mock Endpoint**: `POST /api/tasks/task_101/complete`
- **Mock Response**:
  ```json
  {
    "task": { "id": "task_101", "completed": true, "completedAt": "2026-09-12T10:30:00.000Z" },
    "rewards": { "xp": 70, "gold": 18, "attribute": { "key": "intellect", "amount": 8 } },
    "progression": { "levelBefore": 4, "levelAfter": 5, "totalXp": 540, "currentLevelXp": 500, "nextLevelXp": 720, "progressPercent": 18.18 },
    "streak": { "current": 4, "best": 9 }
  }
  ```
- **Assertions**:
  - Header HUD XP bar smoothly animates to `18.18%`.
  - Header Gold counter increments by `18`.
  - LevelUpCelebrationModal is triggered (`levelAfter: 5 > levelBefore: 4`).
  - QuestCard displays completed state.

### Test Scenario 2: Double-Click Prevention & Idempotency
- **Action**: User rapidly clicks the complete checkbox 5 times within 100ms.
- **Assertion**: Exactly **one** HTTP request is dispatched; subsequent clicks are blocked while pending.

### Test Scenario 3: Task Already Completed Conflict (409)
- **Mock Endpoint**: `POST /api/tasks/task_101/complete` -> responds with HTTP `409` `{ "error": { "code": "TASK_ALREADY_COMPLETED" } }`.
- **Assertions**:
  - Card remains marked complete.
  - No duplicate XP/Gold is awarded.
  - Toast displays: *"Quest was already marked complete."*

### Test Scenario 4: Insufficient Gold Purchase (409)
- **Mock Endpoint**: `POST /api/shop/item_neon/purchase` -> responds with HTTP `409` `{ "error": { "code": "INSUFFICIENT_GOLD", "message": "You need 40 more Gold." } }`.
- **Assertions**:
  - Gold balance in HUD is unchanged.
  - Error banner informs the user: *"You need 40 more Gold."*
  - Purchase button re-enables.

### Test Scenario 5: Session Expiry (401)
- **Mock Endpoint**: Any endpoint responds with HTTP `401` `{ "error": { "code": "UNAUTHENTICATED" } }`.
- **Assertions**:
  - Protected state is wiped.
  - User is smoothly redirected to `/login`.

---

## 5. Accessibility Automated & Manual Testing

1. **Axe Core Linter**: Run `@axe-core/react` during development and Vitest component runs. Zero violations allowed for `color-contrast`, `button-name`, `aria-roles`, and `label`.
2. **Keyboard-Only Traversal**:
   - Unplug mouse. Navigate full dashboard flow using only `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow` keys, and `Escape`.
3. **Screen Reader Verification**:
   - Test with NVDA (Windows) or VoiceOver (macOS).
   - Ensure reward toasts are announced via `aria-live="polite"`.

---

## 6. End-to-End Persistence Proof Test (The Video Script Flow)

```text
1. Visit https://liferpg.app/
2. Click [Begin Your Adventure] -> Register as "TestAdventurer"
3. Verify initial state: Level 1, 0 XP, 50 Gold, 0 Streak
4. Create quest: "Verify Database Persistence" (Category: Intellect, Difficulty: Medium)
5. Complete quest -> Observe +65 XP and +18 Gold in Header HUD
6. Trigger hard browser refresh (Ctrl+Shift+R)
7. ASSERT: Level 1, 65 XP, 68 Gold, Streak 1, quest marked completed
8. Visit Armory -> Purchase starter item -> Equip theme
9. Refresh browser
10. ASSERT: Theme remains applied and item remains owned in Inventory
11. Sign out -> Sign in -> All data intact!
```

---

## 7. Release Gate & Blocker Criteria

The frontend cannot be merged or released if any of the following exist:
- ❌ Any unhandled runtime error or blank screen in browser console.
- ❌ Incompatibility with `CONTRACT_FRONTEND_BACKEND.md` endpoints or types.
- ❌ Loss of state upon browser refresh.
- ❌ Failure of keyboard navigation on core completion or purchase actions.
- ❌ Lighthouse Performance, Accessibility, Best Practices, or SEO scores below 95.
