# Team Plan

## Member 1 — Team Lead + Frontend Product

Own:
- architecture
- shared contracts
- React app shell
- dashboard
- task UI
- API integration
- final integration
- demo

## Member 2 — Backend/Auth/Database

Own:
- Express
- authentication
- sessions
- Prisma
- PostgreSQL
- user-scoped authorization
- task APIs

## Member 3 — RPG Domain/Economy

Own:
- XP formula
- level engine
- streaks
- attributes
- rewards
- shop
- inventory
- badges
- backend tests

## Member 4 — UI/UX/SEO/QA

Own:
- visual system
- animations
- responsive design
- accessibility
- SEO
- Lighthouse
- E2E/QA
- video preparation

## Parallel model

```text
                         TEAM LEAD
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
   BACKEND                 RPG                  FRONTEND
   Member 2              Member 3              Member 1
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
                         Member 4
                      UX / SEO / QA
                             │
                             ▼
                       INTEGRATION
                             │
                             ▼
                         RELEASE
```

Nobody waits for the entire backend or frontend to finish.

Use mock API contracts where appropriate.
