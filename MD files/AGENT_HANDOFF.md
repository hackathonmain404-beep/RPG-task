# Backend ➔ Frontend Agent Handoff Report

**Commit Hash:** `d81dd9b7b9d3a624399725a080ffdf6704446210`  
**Branch:** `Backend`  
**Status:** Frozen & Verified (143/143 tests passing, 0 TypeScript errors)

---

## 1. API Endpoints & HTTP Methods

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | No | Server uptime and database connectivity health check |
| `POST` | `/api/auth/register` | No | Register new user + character (Rate-limited, strict schema) |
| `POST` | `/api/auth/login` | No | Login and obtain JWT token + cookie (Rate-limited, strict schema) |
| `POST` | `/api/auth/logout` | No (Recommended with token) | Invalidate token in server blocklist and clear cookie |
| `GET` | `/api/auth/me` | **Yes** | Current authenticated user profile and character summary |
| `GET` | `/api/tasks` | **Yes** | List user's tasks (optional filter: `?completed=true\|false`) |
| `POST` | `/api/tasks` | **Yes** | Create a new task (Strict schema: rejects `xp`, `gold`, etc.) |
| `PATCH` | `/api/tasks/:id` | **Yes** | Update a pending task owned by the user (Strict schema) |
| `DELETE` | `/api/tasks/:id` | **Yes** | Delete a task owned by the user |
| `POST` | `/api/tasks/:id/complete` | **Yes** | Server-authoritative task completion and reward calculation |
| `GET` | `/api/shop` | **Yes** | Catalog of active shop items (themes, badges, cosmetics) |
| `POST` | `/api/shop/:itemId/purchase` | **Yes** | Purchase item using server-authoritative gold balance |
| `GET` | `/api/inventory` | **Yes** | List user's purchased inventory items |
| `POST` | `/api/inventory/:itemId/equip`| **Yes** | Equip an owned item (e.g. visual theme) |
| `GET` | `/api/themes` | **Yes** | Available themes and user ownership/equipped state |
| `GET` | `/api/badges` | **Yes** | Badge catalog and user unlock states |

---

## 2. Request & Response Shapes

### 2.1. Authentication

#### Register (`POST /api/auth/register`)
- **Request:**
  ```json
  {
    "email": "player@example.com",
    "password": "password123",
    "displayName": "HeroPlayer"
  }
  ```
  *(Note: Strictly rejects extra fields with `400 VALIDATION_ERROR`)*
- **Response (`201 Created`):**
  ```json
  {
    "user": {
      "id": "cuid...",
      "email": "player@example.com",
      "displayName": "HeroPlayer"
    },
    "character": {
      "level": 1,
      "totalXp": 0,
      "gold": 50,
      "streakCurrent": 0,
      "streakBest": 0
    },
    "token": "eyJhbGciOi..."
  }
  ```
  *Cookie set:* `token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=7d`

#### Login (`POST /api/auth/login`)
- **Request:**
  ```json
  {
    "email": "player@example.com",
    "password": "password123"
  }
  ```
- **Response (`200 OK`):**
  *(Identical shape to register)*

#### Logout (`POST /api/auth/logout`)
- **Headers:** `Authorization: Bearer <token>` (or cookie)
- **Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```
  *(Active token is added to the server revocation blocklist and cookies are cleared)*

#### Me (`GET /api/auth/me`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  {
    "user": {
      "id": "cuid...",
      "email": "player@example.com",
      "displayName": "HeroPlayer"
    },
    "character": {
      "level": 1,
      "totalXp": 0,
      "gold": 50,
      "streakCurrent": 0,
      "streakBest": 0
    }
  }
  ```

---

### 2.2. Tasks

#### List Tasks (`GET /api/tasks?completed=false`)
- **Response (`200 OK`):**
  ```json
  {
    "tasks": [
      {
        "id": "cuid...",
        "userId": "cuid...",
        "title": "Solve 3 LeetCode Problems",
        "description": "Dynamic programming practice",
        "categoryKey": "intellect",
        "difficulty": "medium",
        "xpReward": null,
        "goldReward": null,
        "completed": false,
        "completedAt": null,
        "dueDate": "2026-09-15",
        "createdAt": "2026-09-12T10:00:00.000Z",
        "updatedAt": "2026-09-12T10:00:00.000Z"
      }
    ]
  }
  ```

#### Create Task (`POST /api/tasks`)
- **Request:**
  ```json
  {
    "title": "Go for a 5km Run",
    "description": "Morning cardio session",
    "categoryKey": "strength",
    "difficulty": "medium",
    "dueDate": "2026-09-13"
  }
  ```
  *Allowed `categoryKey`:* `"intellect" | "strength" | "wisdom" | "charisma" | "vitality"`  
  *Allowed `difficulty`:* `"easy" | "medium" | "hard"`  
  *(Note: Do NOT send `xp`, `gold`, `level`, or `attribute`. Extra keys will cause `400 VALIDATION_ERROR`)*
- **Response (`201 Created`):**
  ```json
  {
    "task": {
      "id": "cuid...",
      "title": "Go for a 5km Run",
      "completed": false,
      ...
    }
  }
  ```

#### Complete Task (`POST /api/tasks/:id/complete`)
- **Request:** No body required (any body content is safely ignored).
- **Response (`200 OK`):**
  ```json
  {
    "task": {
      "id": "cuid...",
      "completed": true,
      "completedAt": "2026-09-12T12:00:00.000Z"
    },
    "rewards": {
      "xp": 70,
      "gold": 18,
      "attribute": {
        "key": "strength",
        "amount": 8
      }
    },
    "progression": {
      "levelBefore": 1,
      "levelAfter": 2,
      "totalXp": 140,
      "currentLevelXp": 100,
      "nextLevelXp": 310,
      "progressPercent": 19.05
    },
    "streak": {
      "current": 1,
      "best": 1
    }
  }
  ```

---

### 2.3. Shop, Inventory & Themes

#### Catalog (`GET /api/shop`)
- **Response (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": "cuid...",
        "sku": "theme_neon",
        "name": "Neon Cyberpunk Theme",
        "description": "Glowing cyan and magenta dark theme.",
        "itemType": "THEME",
        "price": 250,
        "rarity": "rare",
        "active": true
      }
    ]
  }
  ```

#### Purchase (`POST /api/shop/:itemId/purchase`)
- **Request:** Empty body. Price is authoritative from database.
- **Response (`200 OK`):**
  ```json
  {
    "purchase": {
      "itemId": "cuid...",
      "sku": "theme_neon",
      "name": "Neon Cyberpunk Theme",
      "price": 250
    },
    "wallet": {
      "gold": 50
    },
    "inventoryItem": {
      "id": "cuid...",
      "itemId": "cuid..."
    }
  }
  ```

#### Inventory (`GET /api/inventory`)
- **Response (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": "cuid...",
        "userId": "cuid...",
        "shopItemId": "cuid...",
        "purchasedAt": "2026-09-12T12:30:00.000Z",
        "shopItem": {
          "id": "cuid...",
          "sku": "theme_neon",
          "name": "Neon Cyberpunk Theme",
          "description": "...",
          "itemType": "THEME",
          "rarity": "rare"
        }
      }
    ],
    "inventory": [ ... ]
  }
  ```

#### Equip (`POST /api/inventory/:itemId/equip`)
- **Response (`200 OK`):**
  ```json
  {
    "equipped": {
      "id": "cuid...",
      "itemId": "cuid...",
      "name": "Neon Cyberpunk Theme",
      "type": "THEME"
    }
  }
  ```

#### Themes (`GET /api/themes`)
- **Response (`200 OK`):**
  ```json
  {
    "themes": [
      {
        "id": "cuid...",
        "key": "neon",
        "name": "Neon Cyberpunk",
        "description": "...",
        "price": 250,
        "owned": true,
        "equipped": true,
        "purchasedAt": "2026-09-12T12:30:00.000Z"
      }
    ]
  }
  ```

---

## 3. Authentication Requirements

- All endpoints under `/api/tasks`, `/api/shop`, `/api/inventory`, `/api/themes`, `/api/badges`, and `/api/auth/me` require authentication.
- Provide token in either:
  1. `Authorization: Bearer <token>` header (preferred for SPA/mobile client).
  2. `token` or `session` cookie (handled automatically if `credentials: 'include'` is set on `fetch` / Axios).

---

## 4. Error Contract & HTTP Status Codes

All errors follow the canonical format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "details": null
  }
}
```

| HTTP Status | Code | Meaning | Frontend Handling Recommendation |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | Schema rejection (missing fields, unexpected fields, invalid enum) | Show inline form error with field details |
| `400` | `INSUFFICIENT_GOLD` | Character lacks enough gold to complete purchase | Show "Not enough Gold" modal or prompt quest completion |
| `400` | `BAD_REQUEST` | Cannot update an already completed task | Disable edit action on completed tasks in UI |
| `401` | `UNAUTHORIZED` | Missing, expired, tampered, or revoked session token | Redirect user to Login page; clear local state |
| `401` | `INVALID_CREDENTIALS` | Incorrect email or password during login | Display "Invalid email or password" on login form |
| `404` | `NOT_FOUND` | Item/Task does not exist or belongs to another user | Display 404 or "Item not found"; refresh view |
| `409` | `CONFLICT` | Email already registered | Display "Email already exists" on register form |
| `409` | `TASK_ALREADY_COMPLETED` | Quest already finished (or duplicate click) | Gray out complete button; show "Already completed" |
| `409` | `ALREADY_OWNED` | Unique theme/cosmetic already in inventory | Display "Already owned"; switch button to "Equip" |
| `429` | `TOO_MANY_REQUESTS` | Rate limit triggered (20 login/register tries / 15 min) | Display "Too many attempts, please wait 15 minutes" |
| `500` | `INTERNAL_SERVER_ERROR`| Unhandled server error | Display general error message; prompt retry |

---

## 5. Frontend-Visible Behavior from Security Changes

1. **Strict Zod Schemas on Auth**:
   Frontend must send **only** `{ email, password, displayName }` to `/register` and `{ email, password }` to `/login`. Sending extraneous state fields will cause immediate `400 VALIDATION_ERROR`.
2. **Immediate Token Revocation on Logout**:
   Calling `POST /api/auth/logout` revokes the token server-side. The frontend must purge the token from memory/storage and navigate to the login view immediately.
3. **Helmet Headers**:
   Responses include `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`. Cross-origin embedding is prevented.
4. **CORS Configuration**:
   Backend accepts requests from `FRONTEND_URL` (default: `http://localhost:5173`). Include `credentials: 'include'` if relying on cookies.

---

## 6. Required Environment Variables

Configure in `backend/.env`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/liferpg?schema=public"
SESSION_SECRET="your_high_entropy_secret_min_32_characters_here"
JWT_SECRET="your_high_entropy_secret_min_32_characters_here"
FRONTEND_URL="http://localhost:5173"
FRONTEND_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

---

## 7. Commands to Start & Test Backend

```bash
# In directory: RPG-task/backend

# 1. Install dependencies
npm install

# 2. Run Prisma migrations (if db needs initialization)
npm run prisma:deploy

# 3. Seed initial shop catalog, themes, and badges
npm run seed

# 4. Start local development server (with tsx watch on port 3000)
npm run dev

# 5. Type-check backend codebase
npm run typecheck

# 6. Execute full backend automated test suite (143 tests)
npm test
```

---

## 8. Database Migration & Seed Requirements

- **Prisma Schema:** Models for `User`, `Character`, `Attribute`, `Task`, `CompletionEvent`, `AttributeEvent`, `ShopItem`, `InventoryItem`, `Badge`, `UserBadge`, `Theme`, `UserTheme`, and `ActivityLog` are in `prisma/schema.prisma`.
- **Seed Data:** `backend/prisma/seed.ts` populates:
  - 6 initial shop items (`ShopItem`)
  - 7 initial achievement badges (`Badge`)
  - 5 initial color themes (`Theme`)
  Run `npm run seed` before testing frontend catalog integration.

---

## 9. Pre-Integration Verification Checklist for Frontend Agent

- [ ] Ensure frontend sends `Authorization: Bearer <token>` header on all requests after login.
- [ ] Confirm frontend does not transmit `xp`, `gold`, `price`, or `level` in any request body.
- [ ] Verify frontend reads character stats from `GET /api/auth/me` or auth responses.
- [ ] Verify `POST /api/tasks/:id/complete` handler uses the response's `progression` and `rewards` blocks to display level-up animations and streak counts.
- [ ] Ensure `POST /api/shop/:itemId/purchase` does not pass price in the body.
- [ ] Handle `409 TASK_ALREADY_COMPLETED` and `409 ALREADY_OWNED` cleanly in UI.
- [ ] On `401 UNAUTHORIZED`, automatically redirect user to the login route.
