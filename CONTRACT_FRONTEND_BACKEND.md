# FRONTEND <-> BACKEND CONTRACT (SHARED SOURCE OF TRUTH)

**Status:** Canonical & Locked for Hackathon  
**Authority:** Server-Authoritative  
**Rule:** Neither Frontend nor Backend may alter field names, types, error codes, or semantics without updating this document.

---

## 1. Global Conventions

1. **Base URL:** `/api`
2. **Format:** JSON (`Content-Type: application/json`, `Accept: application/json`)
3. **Date/Time:** ISO 8601 UTC string (e.g., `2026-09-12T10:00:00.000Z`)
4. **Identifiers:** CUID or UUID strings (e.g., `clx01a...` or `550e8400-e29b-41d4-a716-446655440000`)
5. **Authentication:** 
   - `Authorization: Bearer <jwt_token>` header, or `token` in HTTP-only Cookie.
   - All authenticated routes infer the user identity strictly from the verified session token. The client NEVER passes a `userId` in the payload.

---

## 2. Standard Error Format

All error responses return standard HTTP error status codes (400, 401, 403, 404, 409, 422, 500) and follow this exact JSON structure:

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation for display or debugging.",
    "details": null
  }
}
```

### Standard Error Codes

| Error Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 / 422 | Invalid payload fields or missing required properties |
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid authentication token |
| `FORBIDDEN` | 403 | User does not have permission to access or modify resource |
| `NOT_FOUND` | 404 | Target resource (task, item, user) does not exist |
| `CONFLICT` | 409 | Resource already exists (e.g. duplicate email) |
| `TASK_ALREADY_COMPLETED` | 409 | Quest was already completed; duplicate rewards prevented |
| `INSUFFICIENT_GOLD` | 400 | User does not have enough Gold to purchase the item |
| `ITEM_ALREADY_OWNED` | 400 | User already owns this unique cosmetic or badge |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server error |

---

## 3. Core Enums & Value Sets

### Task Difficulty
Determines the base XP and Gold rewards calculated on the server.
```typescript
type TaskDifficulty = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD" | "EPIC";
```
*Server Rewards Mapping:*
- `TRIVIAL`: +10 XP, +5 Gold
- `EASY`: +25 XP, +15 Gold
- `MEDIUM`: +50 XP, +35 Gold
- `HARD`: +100 XP, +75 Gold
- `EPIC`: +200 XP, +150 Gold

### Task Attribute Category
Determines which character RPG stat is improved upon completion.
```typescript
type AttributeType = "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "CREATIVITY" | "VITALITY";
```
*Attribute Mapping:*
- `STRENGTH`: Workouts, physical fitness, sports
- `INTELLECT`: Coding, studying, reading, research
- `DISCIPLINE`: Chores, cleaning, waking early, admin tasks
- `CREATIVITY`: Writing, drawing, music, design
- `VITALITY`: Meditation, sleep, hydration, nutrition

### Task Status
```typescript
type TaskStatus = "PENDING" | "COMPLETED";
```

### Item Category
```typescript
type ItemCategory = "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE" | "POTION";
```

---

## 4. Endpoints & Data Payloads

### 4.1. Authentication

#### `POST /api/auth/register`
Create a new user and initialize their RPG character.
- **Request Body:**
  ```json
  {
    "email": "hero@example.com",
    "password": "StrongPassword123!",
    "username": "ShadowKnight"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "user": {
      "id": "usr_12345",
      "email": "hero@example.com",
      "username": "ShadowKnight"
    },
    "token": "eyJhbGciOi..."
  }
  ```

#### `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "hero@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "user": {
      "id": "usr_12345",
      "email": "hero@example.com",
      "username": "ShadowKnight"
    },
    "token": "eyJhbGciOi..."
  }
  ```

#### `GET /api/auth/me`
Validate active session and return current user credentials.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "user": {
      "id": "usr_12345",
      "email": "hero@example.com",
      "username": "ShadowKnight"
    }
  }
  ```

---

### 4.2. Character Profile & RPG State

#### `GET /api/character`
Fetches the full authoritative character progression state for the authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "character": {
      "id": "chr_12345",
      "userId": "usr_12345",
      "username": "ShadowKnight",
      "level": 3,
      "currentXp": 140,
      "nextLevelXp": 520,
      "totalXp": 640,
      "gold": 210,
      "streakDays": 4,
      "lastActiveDate": "2026-09-12T08:30:00.000Z",
      "attributes": {
        "STRENGTH": 45,
        "INTELLECT": 80,
        "DISCIPLINE": 30,
        "CREATIVITY": 20,
        "VITALITY": 50
      },
      "equippedTheme": "theme_cyberpunk",
      "equippedTitle": "Novice Bug Hunter"
    }
  }
  ```

#### `PATCH /api/character/equip`
Equip an unlocked theme or title from user inventory.
- **Request Body:**
  ```json
  {
    "equippedTheme": "theme_cyberpunk",
    "equippedTitle": "Novice Bug Hunter"
  }
  ```
- **Success Response (`200 OK`):** Updated character profile.

---

### 4.3. Quests (Tasks) CRUD & Completion

#### `GET /api/tasks`
List all tasks belonging to the authenticated user.
- **Query Params (Optional):** `?status=PENDING` or `?status=COMPLETED`
- **Success Response (`200 OK`):**
  ```json
  {
    "tasks": [
      {
        "id": "tsk_001",
        "title": "Study Dynamic Programming for 1 hour",
        "description": "Solve 2 LeetCode Mediums on Memoization",
        "difficulty": "MEDIUM",
        "attribute": "INTELLECT",
        "status": "PENDING",
        "dueDate": "2026-09-12T18:00:00.000Z",
        "completedAt": null,
        "createdAt": "2026-09-12T09:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/tasks`
Create a new quest.
- **Request Body:**
  ```json
  {
    "title": "Gym - Chest & Triceps workout",
    "description": "45 mins progressive overload",
    "difficulty": "HARD",
    "attribute": "STRENGTH",
    "dueDate": "2026-09-12T20:00:00.000Z"
  }
  ```
- **Success Response (`201 Created`):** Returns the created task object.

#### `PATCH /api/tasks/:id`
Update an existing quest details (cannot update completion status here; use `/complete`).
- **Request Body:**
  ```json
  {
    "title": "Updated Quest Title",
    "difficulty": "EASY"
  }
  ```
- **Success Response (`200 OK`):** Returns updated task.

#### `DELETE /api/tasks/:id`
Soft delete or permanently remove a task belonging to user.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "deletedTaskId": "tsk_001"
  }
  ```

#### `POST /api/tasks/:id/complete` (CRITICAL RPG TRANSACTION)
The authoritative server completion event.
- **Client Request Body:** `{}` (Empty; server calculates all rewards!)
- **Server Execution Flow:**
  1. Authenticates session.
  2. Verifies task belongs to session user and `status === 'PENDING'`.
  3. Authoritatively calculates XP, Gold, Attribute increment, and Streak.
  4. Checks for level-up threshold transition (`currentXp + earnedXp >= nextLevelXp`).
  5. Commits everything in an atomic database transaction.
- **Success Response (`200 OK`):**
  ```json
  {
    "task": {
      "id": "tsk_001",
      "status": "COMPLETED",
      "completedAt": "2026-09-12T10:15:30.000Z"
    },
    "rewards": {
      "xpEarned": 50,
      "goldEarned": 35,
      "attributeUpdated": "INTELLECT",
      "attributeIncrement": 5,
      "streakDays": 5,
      "isStreakIncreased": true
    },
    "levelUp": {
      "didLevelUp": true,
      "oldLevel": 3,
      "newLevel": 4,
      "unlockedItems": ["badge_level_4"]
    },
    "character": {
      "level": 4,
      "currentXp": 40,
      "nextLevelXp": 800,
      "totalXp": 690,
      "gold": 245,
      "streakDays": 5,
      "attributes": {
        "STRENGTH": 45,
        "INTELLECT": 85,
        "DISCIPLINE": 30,
        "CREATIVITY": 20,
        "VITALITY": 50
      }
    }
  }
  ```

---

### 4.4. Shop & Inventory

#### `GET /api/shop/items`
Lists available items in the shop.
- **Success Response (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": "itm_cyberpunk_theme",
        "name": "Neon Cyberpunk Theme",
        "description": "High-contrast glowing neon aesthetic for the dashboard",
        "category": "THEME",
        "cost": 150,
        "imageUrl": "/assets/items/theme_cyber.png",
        "isPurchased": false
      }
    ]
  }
  ```

#### `POST /api/shop/purchase`
Buy an item using accumulated Gold.
- **Request Body:**
  ```json
  {
    "itemId": "itm_cyberpunk_theme"
  }
  ```
- **Server Execution Flow:**
  1. Authenticates session.
  2. Verifies item exists and loads authoritative database cost.
  3. Verifies user has not already purchased item (if unique).
  4. Verifies `user.gold >= item.cost`.
  5. Deducts Gold and adds item to Inventory atomically.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "purchasedItem": {
      "id": "itm_cyberpunk_theme",
      "name": "Neon Cyberpunk Theme",
      "category": "THEME"
    },
    "remainingGold": 95,
    "inventoryId": "inv_98765"
  }
  ```

#### `GET /api/inventory`
Lists all items owned by the authenticated user.
- **Success Response (`200 OK`):**
  ```json
  {
    "inventory": [
      {
        "id": "inv_98765",
        "itemId": "itm_cyberpunk_theme",
        "acquiredAt": "2026-09-12T10:20:00.000Z",
        "item": {
          "id": "itm_cyberpunk_theme",
          "name": "Neon Cyberpunk Theme",
          "category": "THEME",
          "imageUrl": "/assets/items/theme_cyber.png"
        }
      }
    ]
  }
  ```

---

### 4.5. Observability & Health

#### `GET /api/health`
Public health status for deployment verification.
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-12T10:00:00.000Z",
    "database": "connected",
    "uptimeSeconds": 1420
  }
  ```
