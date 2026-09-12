# SPECIFICATION PROVENANCE & AUDIT TRAIL

**Project:** Life RPG Web Application  
**Current Branch:** `Backend`  
**Base Source:** `TZPSv2.pdf` (Life RPG Official Hackathon Problem Statement)

---

## 1. Traceability Matrix

| Hackathon Requirement (`TZPSv2.pdf`) | Backend Specification File | Architectural Enforcement |
|---|---|---|
| User Authentication & Security | `SECURITY.md`, `CONTRACT_FRONTEND_BACKEND.md` | JWT auth, bcrypt hashing, row-level `userId` scoping |
| Database Schema & CRUD | `DATABASE_SCHEMA.md`, `BACKEND.md` | PostgreSQL schema, full Task CRUD endpoints |
| RPG Progression Engine (Non-linear XP) | `RPG_ENGINE.md` | Formula $\lfloor 100 \times L^{1.5} \rfloor$, iterative level-up loop |
| Streaks System | `GAMIFICATION.md` | UTC calendar day evaluation, consecutive increment logic |
| Character Attributes | `GAMIFICATION.md`, `DATABASE_SCHEMA.md` | 5 RPG attributes mapped to task categories |
| Rewards / Virtual Economy | `GAMIFICATION.md`, `BACKEND.md` | Authoritative gold calculation, atomic shop transactions |
| Disqualification Rule: Fake Data Persistence | `DATABASE_SCHEMA.md`, `DEPLOYMENT.md` | Strict PostgreSQL storage; zero localStorage reliance |
| Disqualification Rule: Build/Deploy Crashes | `OBSERVABILITY.md`, `DEPLOYMENT.md` | Pre-flight database connectivity probe via `/api/health` |

---

## 2. Branch Ownership Matrix

- **Backend Branch Owns:**
  - `BACKEND.md`
  - `DATABASE_SCHEMA.md`
  - `API_CONTRACT.md`
  - `RPG_ENGINE.md`
  - `GAMIFICATION.md`
  - `SECURITY.md`
  - `OBSERVABILITY.md`
  - `PROVENANCE.md`
  - `TESTING.md`
  - `ENVIRONMENT.md`
  - `DEPLOYMENT.md`
  - `DECISIONS.md`
- **Frontend Branch Owns (Untouched by Backend):**
  - `FRONTEND.md`
  - `UI_SPEC.md`
  - `DESIGN_SYSTEM.md`
  - `SEO.md`
  - `ACCESSIBILITY.md`
  - `CONTENT_SPEC.md`
- **Shared Contracts (Requires Consensus):**
  - `CONTRACT_FRONTEND_BACKEND.md`
  - `ARCHITECTURE.md`
  - `HACKATHON_REQUIREMENTS.md`
  - `PRODUCT_SPEC.md`
  - `SCORING_MATRIX.md`
  - `ROADMAP.md`
  - `README.md`
