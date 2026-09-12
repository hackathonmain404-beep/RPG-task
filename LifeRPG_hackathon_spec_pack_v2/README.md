# Life RPG — Hackathon Specification Pack

This directory contains the complete engineering specification for the Life RPG web hackathon project.

## Official core requirements

The platform must implement:
- authentication/security
- persistent database-backed user data
- task CRUD
- non-linear RPG leveling
- consecutive-day streaks
- category-based attributes
- currency/economy
- purchasable virtual items/themes/profile badges
- responsive accessible UI
- polished UX
- SEO/performance
- production deployment
- required submission artifacts

See `HACKATHON_REQUIREMENTS.md`.

## Recommended implementation strategy

```text
Public SEO Landing
        ↓
Auth
        ↓
Persistent Character
        ↓
Quest CRUD
        ↓
Complete Quest
        ↓
Server RPG Engine
        ↓
XP + Gold + Attributes + Streak
        ↓
Level Up
        ↓
Shop / Inventory
        ↓
History
```

## Team model

The project uses two primary engineering branches:

```text
main
├── Backend
└── Frontend
```

However, `Backend` and `Frontend` are not separate products. They must follow `CONTRACT_FRONTEND_BACKEND.md`.

## Documentation index

### Shared Source of Truth
1. [HACKATHON_REQUIREMENTS.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/HACKATHON_REQUIREMENTS.md) — Problem framing, core requirements & disqualifiers
2. [PRODUCT_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/PRODUCT_SPEC.md) — Product vision, core loop & feature definitions
3. [TECH_STACK.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/TECH_STACK.md) — Technologies, dependencies & rationale
4. [ARCHITECTURE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ARCHITECTURE.md) — System boundaries, monorepo layout & phase strategy
5. [CONTRACT_FRONTEND_BACKEND.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/CONTRACT_FRONTEND_BACKEND.md) — Shared integration contract & payloads
6. [API_CONTRACT.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/API_CONTRACT.md) — REST endpoint specifications
7. [DATABASE_SCHEMA.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DATABASE_SCHEMA.md) — PostgreSQL / Prisma relational data model
8. [RPG_ENGINE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/RPG_ENGINE.md) — Non-linear XP math & level progression formulas
9. [GAMIFICATION.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/GAMIFICATION.md) — Streaks, attributes, shop economy & badges
10. [SECURITY.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SECURITY.md) — Authentication, anti-cheat & data isolation
11. [DECISIONS.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DECISIONS.md) — Architecture Decision Records (ADRs)
12. [ROADMAP.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ROADMAP.md) — Phase-by-phase implementation roadmap
13. [HACKATHON_MODE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/HACKATHON_MODE.md) — 24-hour sprint pacing & priorities
14. [SCORING_MATRIX.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SCORING_MATRIX.md) — Evaluation criteria & evidence mapping
15. [QA_MATRIX.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/QA_MATRIX.md) — Smoke tests & release blocker criteria
16. [DEPLOYMENT.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DEPLOYMENT.md) — Production hosting & live verification
17. [SUBMISSION.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SUBMISSION.md) — Required deliverables & video guidelines
18. [RELEASE_CHECKLIST.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/RELEASE_CHECKLIST.md) — Final pre-submission checklist
19. [AI_RULES.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/AI_RULES.md) — Guardrails for AI development agents

### Frontend-Specific Specifications
20. [FRONTEND.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/FRONTEND.md) — Architecture, routes, state separation, optimistic UI & error matrix
21. [UI_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/UI_SPEC.md) — Adventure HUD design, ASCII wireframes & view layouts
22. [DESIGN_SYSTEM.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DESIGN_SYSTEM.md) — CSS token dictionary, themes, typography & motion scale
23. [CONTENT_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/CONTENT_SPEC.md) — RPG terminology dictionary, landing copy & in-app microcopy
24. [SEO.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SEO.md) — Landing page SEO strategy, JSON-LD schemas, robots & sitemap
25. [ACCESSIBILITY.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ACCESSIBILITY.md) — WCAG 2.1 AA keyboard navigation & ARIA semantics
26. [PERFORMANCE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/PERFORMANCE.md) — Lighthouse 95+ targets, Core Web Vitals & code-splitting
27. [USER_FLOWS.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/USER_FLOWS.md) — Screen-by-screen state flows & persistence proof sequence
28. [TESTING.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/TESTING.md) — Unit, component, and MSW contract testing plan

## Golden rule

Backend is authoritative.  
Frontend is presentational and interactive.  
The contract is the bridge.  
Main must remain mergeable.
