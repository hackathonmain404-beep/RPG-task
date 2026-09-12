# Backend Specification

## Responsibility

The Backend owns all server-side behavior and all authoritative user/progression data.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Zod or equivalent request validation
- Secure session/cookie authentication

## Backend owns

- Authentication
- Session management
- User authorization
- Task CRUD
- Task completion
- XP calculation
- Level calculation
- Streak calculation
- Attribute progression
- Gold/currency calculation
- Shop purchases
- Inventory
- Badges/themes
- Activity history
- Database transactions
- Anti-cheat rules

## Backend must NOT trust the frontend for

- XP earned
- Gold earned
- level
- streak
- attribute values
- item prices
- inventory ownership
- userId
- task ownership

The server calculates authoritative values.

## Required API areas

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

## Completion transaction

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
→ commit
```

This must be atomic where practical.

## Database

Prisma is the only normal persistence interface used by application code.

Do not put raw database access throughout route handlers.

Preferred layering:

```text
route
→ controller
→ domain/service
→ repository/Prisma
```

## Security

Every authenticated request obtains identity from the server-side auth context.

Do not accept `userId` from the client as authority.

## Errors

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

## Backend testing

Minimum:
- auth
- authorization
- CRUD
- completion idempotency
- RPG formulas
- streaks
- purchases
- inventory
- database transactions

## Integration rule

The backend implementation must follow `CONTRACT_FRONTEND_BACKEND.md`.

If the contract must change:
1. update the contract
2. update affected backend code
3. notify frontend
4. update tests
5. merge only after both sides agree
