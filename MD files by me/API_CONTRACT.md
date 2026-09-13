# API Contract

All authenticated endpoints require an authenticated user unless stated otherwise.

Base:
`/api`

## Auth

### POST /auth/register
Creates user + character.

### POST /auth/login
Creates authenticated session.

### POST /auth/logout
Invalidates session.

### GET /auth/me
Returns current user/character summary.

## Tasks

### GET /tasks
Returns only current user's tasks.

### POST /tasks

```json
{
  "title": "Study React",
  "description": "Finish hooks lesson",
  "categoryKey": "intellect",
  "difficulty": "medium",
  "dueDate": "2026-09-13"
}
```

### PATCH /tasks/:id
Update user-owned task.

### DELETE /tasks/:id
Delete user-owned task.

### POST /tasks/:id/complete

No reward values are accepted from the client.

Response example:

```json
{
  "task": {
    "id": "task-1",
    "completed": true
  },
  "rewards": {
    "xp": 65,
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
    "nextLevelXp": 720
  },
  "streak": {
    "current": 4,
    "best": 9
  }
}
```

## Character

### GET /character
Returns current user's character and attributes.

### GET /character/history
Returns progression/activity history.

## Shop

### GET /shop
Public catalog or authenticated catalog.

### POST /shop/:itemId/purchase

Server verifies:
- authentication
- active item
- current price
- sufficient gold
- duplicate ownership rules

### POST /inventory/:itemId/equip
Equip owned theme/profile cosmetic.

## Badges

### GET /badges
Returns catalog/unlock state.

## Error contract

```json
{
  "error": {
    "code": "INSUFFICIENT_GOLD",
    "message": "You need 40 more Gold."
  }
}
```

Never return stack traces.

## Idempotency

Completion must not reward the same task twice.

The server must reject:
- already completed task
- repeated reward request
- forged reward amounts

## Transactions

Use a database transaction for completion and purchase flows where multiple related records change.
