# Life RPG — Hackathon Specification Pack

This directory contains the complete engineering specification for the Life RPG web hackathon project.

---

## 🌟 Official Core Requirements

The platform implements:
- Authentication & session security
- Persistent database-backed user data (PostgreSQL + Prisma)
- Task CRUD & authoritative completion
- Non-linear RPG leveling ($\text{BASE\_XP} \times L^{1.65}$)
- Consecutive-day streaks (`streakCurrent` & `streakBest`)
- Category-based attributes (`intellect`, `strength`, `wisdom`, `charisma`, `vitality`)
- In-game economy & shop (`ShopItem`, `InventoryItem`, `Theme`, `Badge`)
- Responsive, accessible UI (mobile to desktop, keyboard navigable)
- Polished UX & tactile celebratory feedback
- SEO & performance
- Production deployment (Render / Railway / Supabase)
- Required submission deliverables (Repo, Live URL, 90–180s Video $<100$MB)

---

## 📚 Specification Documentation Index

### Shared Source of Truth
- [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md) — **Shared integration contract & API payloads**
- [HACKATHON_REQUIREMENTS.md](file:///c:/Projects/Web%20Hackathon/RPG-task/HACKATHON_REQUIREMENTS.md) — Requirements traceability matrix
- [PRODUCT_SPEC.md](file:///c:/Projects/Web%20Hackathon/RPG-task/PRODUCT_SPEC.md) — Product thesis, loops, and terminology
- [TECH_STACK.md](file:///c:/Projects/Web%20Hackathon/RPG-task/TECH_STACK.md) — Recommended stack & rationale
- [ARCHITECTURE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ARCHITECTURE.md) — System topology & boundaries
- [USER_FLOWS.md](file:///c:/Projects/Web%20Hackathon/RPG-task/USER_FLOWS.md) — Public, auth, completion, and error flows
- [DATA_SEEDING.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DATA_SEEDING.md) — Starter shop catalogue and demo rules
- [AI_RULES.md](file:///c:/Projects/Web%20Hackathon/RPG-task/AI_RULES.md) — Agent boundaries & anti-cheat invariants
- [AGENT_HANDOFF.md](file:///c:/Projects/Web%20Hackathon/RPG-task/AGENT_HANDOFF.md) — Handoff protocol & team division
- [GIT_WORKFLOW.md](file:///c:/Projects/Web%20Hackathon/RPG-task/GIT_WORKFLOW.md) — Branch rules & commit checkpoints
- [DECISIONS.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DECISIONS.md) — Architecture Decision Records (ADR-001 to ADR-008)
- [ROADMAP.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ROADMAP.md) — Development milestones
- [HACKATHON_MODE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/HACKATHON_MODE.md) — P0/P1/P2 priorities & 24h timeline
- [SCORING_MATRIX.md](file:///c:/Projects/Web%20Hackathon/RPG-task/SCORING_MATRIX.md) — Hackathon evaluation pillars
- [QA_MATRIX.md](file:///c:/Projects/Web%20Hackathon/RPG-task/QA_MATRIX.md) — Mandatory smoke tests & failure matrix
- [DEPLOYMENT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DEPLOYMENT.md) — Production deployment & smoke checklist
- [ENVIRONMENT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/ENVIRONMENT.md) — Environment variables specification
- [OBSERVABILITY.md](file:///c:/Projects/Web%20Hackathon/RPG-task/OBSERVABILITY.md) — Health checks & logging
- [PRIVACY.md](file:///c:/Projects/Web%20Hackathon/RPG-task/PRIVACY.md) — Data minimization & privacy rules
- [PROVENANCE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/PROVENANCE.md) — Audit trail & provenance
- [SUBMISSION.md](file:///c:/Projects/Web%20Hackathon/RPG-task/SUBMISSION.md) — Submission deliverables & video rules
- [RELEASE_CHECKLIST.md](file:///c:/Projects/Web%20Hackathon/RPG-task/RELEASE_CHECKLIST.md) — Pre-release readiness checklist

### Backend-Specific
- [BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/BACKEND.md) — Backend architecture & service layers
- [DATABASE_SCHEMA.md](file:///c:/Projects/Web%20Hackathon/RPG-task/DATABASE_SCHEMA.md) — PostgreSQL schema & Prisma ORM models
- [API_CONTRACT.md](file:///c:/Projects/Web%20Hackathon/RPG-task/API_CONTRACT.md) — REST endpoint specifications
- [RPG_ENGINE.md](file:///c:/Projects/Web%20Hackathon/RPG-task/RPG_ENGINE.md) — Non-linear XP leveling formulas
- [GAMIFICATION.md](file:///c:/Projects/Web%20Hackathon/RPG-task/GAMIFICATION.md) — Streaks, attributes & economy rules
- [SECURITY.md](file:///c:/Projects/Web%20Hackathon/RPG-task/SECURITY.md) — Anti-cheat invariants & auth security
- [TESTING.md](file:///c:/Projects/Web%20Hackathon/RPG-task/TESTING.md) — Unit & integration test suites

---

## 🌿 Branch Model

```text
main
├── Backend   (Server, database, progression engine, API)
└── Frontend  (UI, themes, tactile animations, client routes)
```

**Golden Rule:**
- Backend is authoritative.
- Frontend is presentational/interactive.
- [CONTRACT_FRONTEND_BACKEND.md](file:///c:/Projects/Web%20Hackathon/RPG-task/CONTRACT_FRONTEND_BACKEND.md) is the bridge.
