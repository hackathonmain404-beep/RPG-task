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

## Documentation order

Start with:
1. HACKATHON_REQUIREMENTS.md
2. PRODUCT_SPEC.md
3. TECH_STACK.md
4. ARCHITECTURE.md
5. BACKEND.md
6. FRONTEND.md
7. CONTRACT_FRONTEND_BACKEND.md
8. DATABASE_SCHEMA.md
9. RPG_ENGINE.md
10. GAMIFICATION.md
11. USER_FLOWS.md
12. UI_SPEC.md
13. DESIGN_SYSTEM.md
14. SEO.md
15. ACCESSIBILITY.md
16. SECURITY.md
17. TESTING.md
18. QA_MATRIX.md
19. PERFORMANCE.md
20. DEPLOYMENT.md
21. SUBMISSION.md
22. HACKATHON_MODE.md
23. AI_RULES.md
24. GIT_WORKFLOW.md

## Golden rule

Backend is authoritative.
Frontend is presentational/interactive.
The contract is the bridge.
Main must remain mergeable.
