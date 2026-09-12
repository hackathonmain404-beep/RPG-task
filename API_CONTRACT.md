# API Contract

All authenticated endpoints require an authenticated user unless stated otherwise.

Base URL: `/api`

---

## 1. Auth

### `POST /api/auth/register`
Creates user + character.

### `POST /api/auth/login`
Creates authenticated session.

### `POST /api/auth/logout`
Invalidates session.

### `GET /api/auth/me`
Returns current user and character summary.

---

## 2. Tasks

### `GET /api/tasks`
Returns only the current user's tasks. Optional filter: `?completed=false|true`.

### `POST /api/tasks`
```json
{
  "title": "Study React",
  "description": "Finish hooks lesson",
  "categoryKey": "intellect",
  "difficulty": "medium",
  "dueDate": "2026-09-13"
}
```

### `PATCH /api/tasks/:id`
Update user-owned task properties.

### `DELETE /api/tasks/:id`
Delete user-owned task.

### `POST /api/tasks/:id/complete`
Authoritative completion transaction. No reward values are accepted from the client.

Response example:
```json
{
  "task": {
    "id": "task-1",
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

---

## 3. Character

### `GET /api/character`
Returns current user's character and attributes.

### `GET /api/character/history`
Returns progression and completion activity history.

---

## 4. Shop & Inventory

### `GET /api/shop`
Returns active shop catalog (items, themes, badges).

### `POST /api/shop/:itemId/purchase`
Server verifies:
- authenticated user
- active item exists in catalog
- current price loaded from DB
- user has sufficient gold
- duplicate ownership rules for unique items

Success Response:
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

### `GET /api/inventory`
Returns authenticated user's inventory items.

### `POST /api/inventory/:itemId/equip`
Equip owned theme or cosmetic item.

---

## 5. Badges & Themes

### `GET /api/badges`
Returns badges catalog and user unlock states.

### `GET /api/themes`
Returns available visual themes.

---

## 6. Health & Observability

### `GET /api/health`
Returns service availability, uptime, and database connection status.

---

## 7. Error Contract

```json
{
  "error": {
    "code": "INSUFFICIENT_GOLD",
    "message": "You need more Gold to purchase this item.",
    "details": {}
  }
}
```

Never return stack traces to clients.

---

## 8. Idempotency & Anti-Cheat

Completion must not reward the same task twice. The server strictly rejects:
- already completed task (`409 TASK_ALREADY_COMPLETED`)
- repeated reward requests
- client-forged reward amounts
