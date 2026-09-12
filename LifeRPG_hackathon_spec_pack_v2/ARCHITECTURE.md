# Architecture

## High-level architecture

```text
                 Public Web
                     │
                     ▼
          ┌────────────────────┐
          │ React + Vite SPA   │
          │ UI / Game Loop     │
          └─────────┬──────────┘
                    │ HTTPS/JSON
                    ▼
          ┌────────────────────┐
          │ Express API        │
          │ Auth / Tasks / RPG │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ RPG Domain Engine  │
          │ XP / Level / Streak│
          │ Attributes / Shop  │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ Prisma              │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ PostgreSQL         │
          └────────────────────┘
```

## Backend layers

```text
routes
  ↓
controllers
  ↓
service/domain layer
  ↓
Prisma/data layer
```

### Rule

Business rules must live in the service/domain layer, not scattered through route handlers.

## Frontend layers

```text
pages/routes
  ↓
feature components
  ↓
hooks/state
  ↓
api client
  ↓
backend
```

Keep API calls outside presentational components.

## Core domains

- Auth
- Tasks
- RPG progression
- Streaks
- Attributes
- Economy
- Inventory
- Shop
- Profile
- Activity history

## Critical security architecture

The client may request:
- complete task
- purchase item
- update task

The server decides:
- whether the operation is allowed
- how much XP/Gold is awarded
- whether a level-up occurred
- whether streak changes
- whether the purchase is affordable
- whether inventory changes

Never trust the client to send:
`xp`, `gold`, `level`, `attributeValue`, `streak`, or final reward amounts.

## Core transaction

Completing a quest should be handled atomically where possible:

```text
validate task ownership
→ validate incomplete state
→ mark complete
→ create completion log
→ calculate rewards
→ update character
→ update streak
→ create reward events
→ commit transaction
```

If any critical step fails, the transaction should not partially apply.

## Recommended folder tree

```text
/
├── docs/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── domain/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── db/
│   │   └── utils/
│   ├── prisma/
│   └── tests/
├── shared/
│   └── contracts/
├── .env.example
└── README.md
```

## Phase strategy

### Phase 0
Repo + contracts + environment.

### Phase 1
Authentication + user creation + database.

### Phase 2
Task CRUD.

### Phase 3
Complete-task transaction + XP/Gold.

### Phase 4
Non-linear level engine + attributes + streak.

### Phase 5
Inventory + shop + badges/themes.

### Phase 6
Tactile UX.

### Phase 7
SEO/performance/accessibility.

### Phase 8
Production QA + video + final audit.
