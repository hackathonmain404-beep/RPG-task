# Backend Specification

## 1. Responsibility

The Backend owns all server-side behavior and all authoritative user/progression data.

## 2. Stack

- **Runtime:** Node.js 20+ LTS
- **Framework:** Express with TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Validation:** Zod request validation
- **Authentication:** Secure session/cookie or JWT authentication
- **Testing:** Vitest, Supertest

## 3. Backend Authority Invariants

Backend strictly owns:
- Authentication & session management
- User authorization & row-level scoping
- Task CRUD
- Task completion
- XP calculation & non-linear curve
- Level calculation
- Streak calculation (`streakCurrent` & `streakBest`)
- Attribute progression (`intellect`, `strength`, `wisdom`, `charisma`, `vitality`)
- Gold/currency calculation
- Shop purchases & balance verification
- Inventory ownership
- Badges and theme unlocks
- Activity and audit history
- Database transactions
- Anti-cheat rules

The backend must **NOT** trust the frontend for:
- XP earned
- Gold earned
- level
- streak
- attribute values
- item prices
- inventory ownership
- `userId`
- task ownership

## 4. Required API Areas

```text
/api/auth/*
/api/tasks/*
/api/character/*
/api/shop/*
/api/inventory/*
/api/badges/*
/api/themes/*
/api/activity/*
/api/health
```

## 5. Completion Transaction

```text
authenticate
→ verify task ownership
→ verify task is incomplete
→ calculate authoritative reward
→ mark task complete
→ create completion event
→ update XP
→ calculate level transition
→ update attribute
→ update streak
→ update character
→ create activity/reward events
→ commit transaction
```

This must be atomic where practical (`prisma.$transaction`).

## 6. Database Layering

Prisma is the sole persistence interface used by application code. Do not put raw database access throughout route handlers.

Preferred layering:
```text
route
→ controller
→ domain/service
→ repository/Prisma
```

## 7. Security & Identity

Every authenticated request obtains identity from the server-side auth context (middleware). Do not accept `userId` from the client as authority.

## 8. Errors

Use stable machine-readable error codes:

```json
{
  "error": {
    "code": "TASK_ALREADY_COMPLETED",
    "message": "This quest has already been completed."
  }
}
```

Never expose stack traces to clients.

## 9. Integration Rule

The backend implementation must follow [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md).

If the contract must change:
1. Update the contract
2. Update affected backend code
3. Notify frontend
4. Update tests
5. Merge only after both sides agree
