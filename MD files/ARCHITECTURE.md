# SYSTEM ARCHITECTURE

**System:** Life RPG Web Application  
**Topology:** Decoupled Client-Server Full-Stack Architecture  
**Shared Contract:** [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md)

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------+
|                             CLIENT TIER                               |
|   React / Next.js / Vite SPA (Mobile & Desktop Responsive)            |
|   - Tactile Micro-Interactions (Framer Motion / CSS)                  |
|   - Optimistic UI Updates & Loading Skeletons                         |
|   - Screen Reader Accessibility & Keyboard Navigation (Tab, Enter)     |
+-----------------------------------+-----------------------------------+
                                    |
                            HTTP / REST (JSON)
                      Authorization: Bearer <JWT>
                                    |
+-----------------------------------v-----------------------------------+
|                             SERVER TIER                               |
|   Node.js + Express / TypeScript API Server                           |
|   - Authentication Middleware (JWT Validation & Context Injection)    |
|   - Zod Input Sanitization & Request Validation                       |
|   - Anti-Cheat & Deterministic RPG Engine                             |
|   - Streak & Attribute Progression Calculator                         |
|   - Multi-Tenant Row-Level Security Scoping                           |
+-----------------------------------+-----------------------------------+
                                    |
                              Prisma ORM
                         (Atomic Transactions)
                                    |
+-----------------------------------v-----------------------------------+
|                            DATABASE TIER                              |
|   PostgreSQL 15+ Relational Database                                  |
|   - Users & Passwords (bcrypt / argon2id)                             |
|   - Character Profiles, Levels, XP, Gold, Attributes                  |
|   - Tasks / Quests (CRUD & Completion State)                          |
|   - Inventory & Shop Catalogue                                        |
|   - Activity Logs (Audit Trail)                                       |
+-----------------------------------------------------------------------+
```

---

## 2. Component Boundaries & Responsibilities

| Component | Responsibility | Boundary Rule |
|---|---|---|
| **Frontend Tier** | Presentation, animations, sound effects, accessibility, responsive UI | Does NOT compute XP, Gold, Level, or Streak. Renders data from backend. |
| **API Gateway / Server Tier** | Authentication, authorization, input validation, game logic, anti-cheat | The sole authority for game math, economy, and state transitions. |
| **Database Tier** | Persistent, relational storage of all user state and activity | Sole persistence layer. LocalStorage is never used as primary store. |

---

## 3. Data Flow: Quest Completion

```
User Clicks "Complete Quest"
            |
            v
Frontend triggers optimistic sound/visual feedback
            |
            v
HTTP POST /api/tasks/:id/complete (No stats in body)
            |
            v
Backend verifies JWT and attaches req.user.id
            |
            v
Prisma $transaction initiates:
  1. Fetch Task (where: { id, userId, status: 'PENDING' })
  2. Compute XP, Gold, Attribute increment
  3. Evaluate non-linear level curve
  4. Evaluate daily streak
  5. Update Character & Task records
  6. Insert ActivityLog record
            |
            v
Commit transaction
            |
            v
Return composite JSON payload to frontend
            |
            v
Frontend reconciles state, displays celebratory level-up banner if didLevelUp === true
```
