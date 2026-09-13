# SECURITY & ANTI-CHEAT SPECIFICATION

**Canonical Authority:** Server-Authoritative Enforcement  
**Scope:** Authentication, Session Security, Tenant Isolation, Anti-Cheat, Input Validation

---

## 1. Server-Side Anti-Cheat Invariants

Because a Life RPG's fun and legitimacy relies on progression feeling earned, the backend enforces strict anti-cheat rules:

1. **Zero Client Trust for Stats & Rewards:**  
   The client NEVER sends `xp`, `gold`, `level`, `streak`, `attribute`, or `price` in any API request. If any client payload includes such fields, they are stripped or rejected by validation schemas.
2. **Authoritative Task Completion:**  
   When a user completes a task via `POST /api/tasks/:id/complete`, the server:
   - Verifies the authenticated user owns `id`.
   - Checks that the task is currently `PENDING`.
   - Reads the task's database `difficulty`.
   - Calculates the exact XP, Gold, and Attribute gains using pure server functions.
   - Updates the database atomically.
3. **Double-Spend & Replay Protection:**  
   If a task is already `COMPLETED`, attempting to call `/complete` again immediately yields `409 TASK_ALREADY_COMPLETED` without awarding points.
4. **Authoritative Shop Pricing:**  
   Item costs are loaded directly from the PostgreSQL `Item` table. The client cannot forge or discount prices.

---

## 2. Authentication & Session Security

1. **Password Hashing:**  
   All user passwords must be hashed using `bcrypt` (minimum 12 rounds) or `argon2id` before saving. Cleartext passwords never touch database logs or responses.
2. **JWT Signing & Expiration:**  
   - Signed with a high-entropy secret (`JWT_SECRET` $\ge$ 32 characters).
   - Standard payload: `{ "userId": "...", "iat": ..., "exp": ... }`.
   - Default validity: 7 days.
3. **Context Injection:**  
   An authentication middleware verifies the token and attaches `req.user = { id: payload.userId }`. All downstream controllers read the user ID strictly from `req.user.id`.

---

## 3. Multi-Tenant Data Isolation (Row-Level Security)

Every database query accessing user data MUST include a mandatory `where: { userId: req.user.id }` clause. 

Example Prisma query:
```typescript
const task = await prisma.task.findFirst({
  where: {
    id: taskId,
    userId: req.user.id // Guarantees User B cannot read or modify User A's quest
  }
});

if (!task) {
  throw new AppError(404, "NOT_FOUND", "Quest not found");
}
```

---

## 4. Input Validation & Sanitization

- All request payloads are strictly validated using `zod` schemas.
- Payloads with unknown extra keys are stripped.
- String fields (like task titles and descriptions) are trimmed and length-bounded (e.g. title: 1–120 characters).

---

## 5. Network & Transport Security

- **CORS:** Restricted to the designated frontend origin (`FRONTEND_URL`), disallowing wildcard `*` in production.
- **Security Headers:** Enforced via `helmet` (HSTS, X-Content-Type-Options: nosniff, Frameguard: deny).
