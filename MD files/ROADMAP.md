# IMPLEMENTATION ROADMAP & MILESTONES

**Project:** Life RPG Web Application  
**Execution Mode:** Parallel Branch Development (`Backend` & `Frontend`)

---

## Phase 1: Specification Pack & Contracts (Completed)
- [x] Analyze `TZPSv2.pdf` hackathon requirements.
- [x] Lock canonical `CONTRACT_FRONTEND_BACKEND.md`.
- [x] Define PostgreSQL relational schema and Prisma models (`DATABASE_SCHEMA.md`).
- [x] Define non-linear RPG progression math and algorithms (`RPG_ENGINE.md`).
- [x] Formulate security and server-authoritative anti-cheat policies (`SECURITY.md`).
- [x] Commit specification pack to `Backend` branch and push to origin.

---

## Phase 2: Backend Core Engine & Database (Next)
- [ ] Initialize Node.js + TypeScript project structure in `backend/`.
- [ ] Configure Prisma with PostgreSQL database connection.
- [ ] Implement JWT authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- [ ] Implement Task CRUD routes (`GET`, `POST`, `PATCH`, `DELETE` `/api/tasks`).
- [ ] Implement database seed script for starter shop items and titles.

---

## Phase 3: RPG Engine, Streaks & Shop Transactions
- [ ] Implement atomic quest completion service with non-linear XP curve.
- [ ] Implement daily streak calculation and attribute increments.
- [ ] Implement atomic shop purchasing with balance checks and uniqueness guards.
- [ ] Implement `/api/health` connectivity probe.
- [ ] Write Vitest unit and integration test suites.

---

## Phase 4: Frontend UI & Contract Integration
- [ ] Build themeable UI (Cyberpunk, Retro Pixel, Cozy Lo-Fi).
- [ ] Integrate React frontend with backend API endpoints per `CONTRACT_FRONTEND_BACKEND.md`.
- [ ] Implement tactile micro-interactions (level-up celebrations, XP bar animations).
- [ ] Verify keyboard navigation and responsive layouts.

---

## Phase 5: Deployment, Verification & Video
- [ ] Deploy PostgreSQL database to Supabase / Neon.
- [ ] Deploy backend to Render / Railway with production environment variables.
- [ ] Verify live database persistence across hard page refreshes.
- [ ] Record 90–180 second demonstration video ($< 100$ MB).
- [ ] Finalize submission deliverables.
