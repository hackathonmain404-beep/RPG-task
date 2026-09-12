# Life RPG — Gamified Real-World Productivity

A full-stack, server-authoritative web application that turns daily habits, chores, and personal goals into an engaging Role-Playing Game (RPG). Built for the Web Hackathon based on official requirements in [TZPSv2.pdf](file:///c:/Projects/Web%20Hackathon/RPG-task/TZPSv2.pdf).

---

## 🌟 Key Features

- **Server-Authoritative Progression:** Anti-cheat protection where XP, Gold, attributes, and level calculations are strictly executed on the server.
- **Non-Linear Leveling Curve:** Higher levels require progressively more XP ($\lfloor 100 \times \text{Level}^{1.5} \rfloor$).
- **Multi-Attribute Growth:** Quests directly level up core character stats: `STRENGTH`, `INTELLECT`, `DISCIPLINE`, `CREATIVITY`, and `VITALITY`.
- **Daily Streak Engine:** UTC calendar-based streak tracking rewarding daily consistency.
- **In-Game Economy & Shop:** Earn Gold by conquering quests and purchase themes, titles, and prestige badges.
- **Zero LocalStorage Primary Persistence:** Fully backed by PostgreSQL with ACID transactions.

---

## 📚 Specification Pack & Documentation

| Document | Description |
|---|---|
| [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md) | **Canonical shared source of truth** for all API routes, data structures, and errors |
| [BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/BACKEND.md) | Backend architecture, folder structure, and service design |
| [DATABASE_SCHEMA.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DATABASE_SCHEMA.md) | PostgreSQL schema and Prisma ORM models |
| [RPG_ENGINE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/RPG_ENGINE.md) | Non-linear XP leveling formulas and reward matrices |
| [GAMIFICATION.md](file:///c:/Projects/Web%20Hackathon/RPG-task/GAMIFICATION.md) | Streak rules, attribute mappings, and virtual economy specifications |
| [SECURITY.md](file:///c:/Projects/Web%20Hackathon/RPG-task/SECURITY.md) | Server-side anti-cheat, JWT session security, and multi-tenant isolation |
| [API_CONTRACT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/API_CONTRACT.md) | REST API endpoint documentation |
| [ARCHITECTURE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ARCHITECTURE.md) | Full-stack system architecture and data flows |
| [DEPLOYMENT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DEPLOYMENT.md) | Production deployment instructions and zero-tolerance checklist |
| [TESTING.md](file:///c:/Projects/Web%20Hackathon/RPG-task/TESTING.md) | Unit and integration test suites |
| [ENVIRONMENT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ENVIRONMENT.md) | Environment variable reference and `.env.example` |
| [DECISIONS.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DECISIONS.md) | Architecture Decision Records (ADRs) |
| [HACKATHON_REQUIREMENTS.md](file:///c:/Projects/Web%20Hackathon/RPG-task/HACKATHON_REQUIREMENTS.md) | Requirements traceability matrix from `TZPSv2.pdf` |
| [ROADMAP.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ROADMAP.md) | Development milestones |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, TypeScript, Express, Prisma ORM
- **Database:** PostgreSQL (with ACID transactions)
- **Authentication:** JWT with bcrypt password hashing
- **Testing:** Vitest / Jest, Supertest
- **Frontend (Parallel Branch):** React / Vite, Tailwind CSS, Framer Motion

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ LTS
- PostgreSQL database instance

### 2. Environment Setup
```bash
cp .env.example .env
# Update DATABASE_URL and JWT_SECRET in .env
```

### 3. Install & Migrate Database
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Server starts on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.

---

## 🌿 Branch Workflow

- **`Backend` Branch:** Owns backend services, database migrations, API endpoints, game engine math, and tests.
- **`Frontend` Branch:** Owns UI components, animations, styles, themes, and client interactions.
- **Contract Rule:** All communication between branches is locked in `CONTRACT_FRONTEND_BACKEND.md`.
