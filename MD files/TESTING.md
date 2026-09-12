# BACKEND TESTING SPECIFICATION

**Canonical Authority:** Backend Branch  
**Frameworks:** Vitest / Jest, Supertest

---

## 1. Test Architecture

The backend test suite verifies mathematical correctness, anti-cheat enforcement, transactional safety, and multi-tenant security.

```
tests/
├── unit/
│   ├── rpgEngine.test.ts     # Formula verification & level progression
│   ├── streak.test.ts        # Calendar day math & streak reset logic
│   └── validation.test.ts    # Zod payload schema checks
└── integration/
    ├── auth.test.ts          # Sign-up, login, password hashing, JWT
    ├── taskLifecycle.test.ts # CRUD, completion transaction, double-spend guard
    └── shopEconomy.test.ts   # Purchasing, balance checks, uniqueness enforcement
```

---

## 2. Critical Unit Test Cases

### 2.1. RPG Non-Linear Formula Tests (`rpgEngine.test.ts`)
- **Assertion 1 (Non-linear scaling):** Verify $\text{XP}(L+1) > \text{XP}(L)$ for all levels 1 to 50.
- **Assertion 2 (Deterministic progression):**
  - Level 1 with 100 XP gained $\rightarrow$ Level 2 with 0 remainder XP.
  - Level 1 with 150 XP gained $\rightarrow$ Level 2 with 50 remainder XP.
- **Assertion 3 (Multi-level jumps):** Earning 1,000 XP at Level 1 correctly jumps past multiple thresholds to Level 4 without dropping XP.

### 2.2. Daily Streak Tests (`streak.test.ts`)
- **Same Day:** Completing tasks on the same calendar day retains the same streak count.
- **Next Day:** Completing a task exactly 1 UTC day later increments streak by 1.
- **Lapsed Day:** Completing a task 2+ days later resets streak to 1.

---

## 3. Integration & Anti-Cheat Tests

### 3.1. Quest Completion Isolation
```typescript
test("User cannot complete another user's quest", async () => {
  const userA = await createTestUser();
  const userB = await createTestUser();
  const taskA = await createTestTask(userA.id);

  const res = await request(app)
    .post(`/api/tasks/${taskA.id}/complete`)
    .set("Authorization", `Bearer ${userB.token}`);

  expect(res.status).toBe(404);
  expect(res.body.error.code).toBe("NOT_FOUND");
});
```

### 3.2. Double Completion Prevention
```typescript
test("Prevents double completion and double rewards", async () => {
  const user = await createTestUser();
  const task = await createTestTask(user.id);

  // First completion
  const res1 = await request(app)
    .post(`/api/tasks/${task.id}/complete`)
    .set("Authorization", `Bearer ${user.token}`);
  expect(res1.status).toBe(200);

  // Second completion attempt
  const res2 = await request(app)
    .post(`/api/tasks/${task.id}/complete`)
    .set("Authorization", `Bearer ${user.token}`);
  expect(res2.status).toBe(409);
  expect(res2.body.error.code).toBe("TASK_ALREADY_COMPLETED");
});
```

---

## 4. Test Commands
```bash
npm run test           # Run all unit & integration tests
npm run test:unit      # Fast unit tests only
npm run test:coverage  # Coverage report
```
