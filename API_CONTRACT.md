# REST API SPECIFICATION & CONTRACT

**Canonical Companion:** Refer to [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md) for data schemas and error formats.

---

## 1. Summary of Routes

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | No | Create user account and initialize character |
| `POST` | `/api/auth/login` | No | Authenticate user and return JWT |
| `GET` | `/api/auth/me` | Yes | Get currently authenticated user info |
| `GET` | `/api/character` | Yes | Get full character stats, XP, gold, level, and attributes |
| `PATCH`| `/api/character/equip` | Yes | Equip an unlocked theme or title |
| `GET` | `/api/tasks` | Yes | Fetch user's tasks (filterable with `?status=PENDING\|COMPLETED`) |
| `POST` | `/api/tasks` | Yes | Create a new task |
| `GET` | `/api/tasks/:id` | Yes | Fetch single task by ID |
| `PATCH`| `/api/tasks/:id` | Yes | Update task title, description, difficulty, attribute |
| `DELETE`| `/api/tasks/:id` | Yes | Delete a task |
| `POST` | `/api/tasks/:id/complete` | Yes | Authoritative quest completion & reward transaction |
| `GET` | `/api/shop/items` | Yes | View catalog of purchasable items & themes |
| `POST` | `/api/shop/purchase` | Yes | Purchase an item with Gold |
| `GET` | `/api/inventory` | Yes | View all owned items and badges |
| `GET` | `/api/activity` | Yes | Fetch recent quest completion history |
| `GET` | `/api/health` | No | Public server & database health check |

---

## 2. Authentication Header Convention
All protected routes require:
```http
Authorization: Bearer <JWT_TOKEN>
```
If missing or invalid:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required to access this resource"
  }
}
```

---

## 3. Detailed Endpoint Specs

### Task Completion: `POST /api/tasks/:id/complete`
- **Request:** Empty JSON `{}`.
- **Behavior:**
  - Guarantees idempotent reward dispensing.
  - Rejects second completion with `409 TASK_ALREADY_COMPLETED`.
  - Atomically computes and persists new Level, XP, Gold, Streak, and Attributes.

### Shop Purchase: `POST /api/shop/purchase`
- **Request:**
  ```json
  {
    "itemId": "theme_cyberpunk"
  }
  ```
- **Error Responses:**
  - `INSUFFICIENT_GOLD`: When `character.gold < item.cost`.
  - `ITEM_ALREADY_OWNED`: When purchasing a unique item already present in `Inventory`.
  - `NOT_FOUND`: When `itemId` is invalid.

### Health Check: `GET /api/health`
- **Request:** None.
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-12T10:00:00.000Z",
    "database": "connected",
    "uptimeSeconds": 3600
  }
  ```
