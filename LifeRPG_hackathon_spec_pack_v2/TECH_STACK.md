# Technology Stack

## Recommended stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- CSS or Tailwind CSS
- Framer Motion only where it materially improves micro-interactions
- Lucide React for consistent icons

### Backend
- Node.js
- Express
- TypeScript

### Database
- PostgreSQL

### ORM
- Prisma

### Authentication
- secure server-backed session or JWT strategy
- password hashing with Argon2 or bcrypt
- HTTP-only secure cookies for session-based auth where practical

### Validation
- Zod for shared/request validation where useful

### Testing
- Vitest
- React Testing Library
- Supertest
- Playwright if the team can set it up quickly

### Deployment
Preferred simple path:
- Frontend: Vercel
- Backend: Render/Railway/Fly.io or equivalent
- PostgreSQL: managed Postgres from the chosen deployment provider or Supabase Postgres

The competition permits React, Node.js/Express and PostgreSQL and explicitly allows multiple backend/database choices. fileciteturn2file0L28-L37

## Why PostgreSQL

The problem asks for persistent historical task logs, inventory and character data. A relational model makes task completion events, purchases, inventory and progression history explicit and queryable.

## Why not localStorage

The problem explicitly disqualifies fake primary persistence through localStorage. Primary user data must live in the backend database. fileciteturn2file0L81-L85

localStorage may be used only for non-authoritative client preferences, such as a dismissed onboarding tooltip.

## Dependency rules

Do not add a library for a problem that can be solved in a small amount of existing code.
