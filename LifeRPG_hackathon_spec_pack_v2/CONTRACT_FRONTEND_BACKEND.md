# Frontend ↔ Backend Contract

## Purpose

This document is the shared integration contract between the frontend and backend.

Its purpose is to prevent merge conflicts, mismatched payloads, broken assumptions and integration failures.

This file must be treated as a **shared source of truth**.

## Golden rule

### Frontend asks. Backend decides.

Frontend may request:
- create task
- update task
- delete task
- complete task
- buy item
- equip item

Backend decides:
- whether allowed
- reward amount
- XP
- Gold
- level
- streak
- attribute changes
- inventory ownership
- authoritative task state

---

# 1. Shared conventions

## IDs

All IDs are opaque strings/UUIDs.

Frontend must never parse business meaning from IDs.

## Dates

Use ISO-8601 timestamps over the API.

Example:

```text
2026-09-12T10:30:00.000Z
```

Do not return locale-specific display strings from the backend.

## Nullability

If a field can be absent, document it explicitly as nullable.

Do not randomly omit fields between responses.

## Errors

All API errors use:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Frontend should branch on `code`, not on parsing human messages.

## HTTP status

Use:
- 200 for successful read/update
- 201 for creation
- 204 for successful deletion where no body is needed
- 400 for invalid request
- 401 for unauthenticated
- 403 for unauthorized
- 404 for not found
- 409 for state conflicts
- 422 for validation where appropriate
- 429 for rate limiting
- 500 for unexpected server failure

---

# 2. Auth contract

### GET `/api/auth/me`

Success:

```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "displayName": "Player"
  },
  "character": {
    "level": 5,
    "totalXp": 720,
    "gold": 430,
    "streakCurrent": 4,
    "streakBest": 9
  }
}
```

If not authenticated:

`401`

---

# 3. Tasks

### GET `/api/tasks`

Returns only authenticated user's tasks.

### POST `/api/tasks`

Request:

```json
{
  "title": "Study React",
  "description": "Complete the hooks lesson",
  "categoryKey": "intellect",
  "difficulty": "medium",
  "dueDate": "2026-09-13"
}
```

Backend calculates/retrieves reward policy.

Do not require frontend to send authoritative XP/Gold.

### PATCH `/api/tasks/:id`

Only owner can update.

### DELETE `/api/tasks/:id`

Only owner can delete.

---

# 4. Complete task

### POST `/api/tasks/:id/complete`

No reward numbers accepted.

Success:

```json
{
  "task": {
    "id": "task_123",
    "completed": true,
    "completedAt": "2026-09-12T10:30:00.000Z"
  },
  "rewards": {
    "xp": 70,
    "gold": 18,
    "attribute": {
      "key": "intellect",
      "amount": 8
    }
  },
  "progression": {
    "levelBefore": 4,
    "levelAfter": 5,
    "totalXp": 540,
    "currentLevelXp": 500,
    "nextLevelXp": 720,
    "progressPercent": 11.36
  },
  "streak": {
    "current": 4,
    "best": 9
  }
}
```

Possible conflict:

```text
409 TASK_ALREADY_COMPLETED
```

## Idempotency rule

A task completion may reward a task only once.

Double-clicks/retries must not duplicate:
- XP
- Gold
- attribute progression
- streak progression
- completion events

---

# 5. Character

### GET `/api/character`

Returns:

```json
{
  "level": 5,
  "totalXp": 540,
  "gold": 430,
  "streakCurrent": 4,
  "streakBest": 9,
  "attributes": [
    {
      "key": "intellect",
      "displayName": "Intellect",
      "value": 18
    }
  ]
}
```

---

# 6. Shop

### GET `/api/shop`

Returns catalog.

### POST `/api/shop/:itemId/purchase`

Request body should contain no authoritative price.

Backend loads current price from DB.

Success:

```json
{
  "purchase": {
    "itemId": "theme_neon",
    "price": 250
  },
  "wallet": {
    "gold": 180
  },
  "inventoryItem": {
    "id": "inv_123",
    "itemId": "theme_neon"
  }
}
```

Conflict:
`409 INSUFFICIENT_GOLD`

---

# 7. Inventory

### GET `/api/inventory`

Returns authenticated user's inventory only.

### POST `/api/inventory/:itemId/equip`

Server verifies ownership before equipping.

---

# 8. Frontend request rules

Frontend must:
- send only documented fields
- ignore unknown response fields safely
- handle errors by error code
- show loading state
- prevent duplicate actions when an operation is already pending
- reconcile optimistic state after server response

Frontend must NOT:
- alter returned XP
- invent Gold
- increment streak locally as authority
- assume purchase succeeded before server confirmation
- send another user's ID as authority

---

# 9. Backend response rules

Backend must:
- keep field names stable
- return the same shape for equivalent success cases
- return authoritative reward values
- include sufficient data for the UI to update without another unnecessary request where practical

Do not introduce breaking response changes without updating this contract.

---

# 10. Shared TypeScript contract

Where practical, generate or manually maintain shared types under:

```text
shared/contracts/
```

The frontend imports API/domain types from the shared contract.

The backend validates its own input with runtime schemas.

The frontend must not share server implementation files; only contract/type definitions may be shared.

---

# 11. Change protocol

If frontend needs a new field:
1. open a contract change
2. update this file
3. update shared types
4. backend implements it
5. backend tests it
6. frontend integrates it
7. end-to-end test runs
8. merge

Never:
- silently rename fields
- remove fields without checking consumers
- change enum strings casually
- change numeric units silently

---

# 12. Merge gate

A frontend/backend merge is allowed only when:

```text
API starts
↓
DB connects
↓
Frontend starts
↓
Auth works
↓
Request reaches backend
↓
Response matches contract
↓
Frontend renders response
↓
Mutation persists
↓
Refresh preserves result
↓
Tests pass
```

If any step fails, the merge is not release-ready.
