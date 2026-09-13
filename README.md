# Life RPG — Gamified Real-Life Productivity Platform

> **Hackathon Branch:** `Frontend`  
> **Official Specification Pack:** Located in [`LifeRPG_hackathon_spec_pack_v2/`](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/README.md)

---

## 1. Executive Summary

**Life RPG** transforms everyday productivity (coding, studying, lifting, meditating) into an engaging Role-Playing Game (RPG). Instead of conventional to-do lists that suffer from delayed gratification, Life RPG provides instant dopamine, tangible visual progression, and immersive character growth — all backed by a secure PostgreSQL database and server-authoritative game math.

This branch (`Frontend`) is maintained by the **Frontend Branch AI Agent** and owns all client-side presentation, responsive UI, tactile micro-interactions, accessibility (WCAG 2.1 AA), landing page SEO, and performance budgets.

---

## 2. Team & Branch Architecture

```text
main (Production Deployable)
  ├── Backend   (Express API · PostgreSQL · Prisma · Server RPG Engine)
  └── Frontend  (React SPA · Vite · Adventure HUD · Themes · Accessibility · SEO)
```

### The Golden Contract Rule
`Backend` and `Frontend` are synchronized through [`LifeRPG_hackathon_spec_pack_v2/CONTRACT_FRONTEND_BACKEND.md`](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/CONTRACT_FRONTEND_BACKEND.md).
- **Backend is Authoritative**: XP calculations, level thresholds, Gold rewards, streak evaluation, attribute totals, and inventory ownership are determined strictly by the server.
- **Frontend is Presentational & Tactile**: The client triggers optimistic visual feedback, prevents duplicate submissions, and reconciles state upon receiving verified server responses.
- **Zero Client Authority**: Client code never calculates `user.xp += 50` or `character.gold += 10`.

---

## 3. Official Specification Index

All design decisions and engineering requirements are exhaustively documented in the repository:

### Core & Shared Specifications
- 📋 [HACKATHON_REQUIREMENTS.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/HACKATHON_REQUIREMENTS.md) — Problem framing, core systems & disqualifiers
- 📜 [PRODUCT_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/PRODUCT_SPEC.md) — Product vision, core loop & feature definitions
- 🛠️ [TECH_STACK.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/TECH_STACK.md) — Technologies, dependencies & rationale
- 🏛️ [ARCHITECTURE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ARCHITECTURE.md) — Monorepo structure, boundaries & layer diagrams
- 🤝 [CONTRACT_FRONTEND_BACKEND.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/CONTRACT_FRONTEND_BACKEND.md) — The shared API contract & request/response payloads
- 🔌 [API_CONTRACT.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/API_CONTRACT.md) — REST endpoint specifications
- 🗄️ [DATABASE_SCHEMA.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DATABASE_SCHEMA.md) — PostgreSQL / Prisma relational schema
- 🧮 [RPG_ENGINE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/RPG_ENGINE.md) — Non-linear XP curve & level math formulas
- 🔥 [GAMIFICATION.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/GAMIFICATION.md) — Streaks, attributes, armory economy & relics
- 🛡️ [SECURITY.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SECURITY.md) — Authentication, anti-cheat & data isolation
- 🧭 [ROADMAP.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ROADMAP.md) — Phase-by-phase implementation roadmap
- ⚡ [HACKATHON_MODE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/HACKATHON_MODE.md) — 24-hour sprint pacing & priorities

### Frontend-Owned Specifications
- 💻 [FRONTEND.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/FRONTEND.md) — Frontend architecture, component registry, state separation & error matrix
- 🎨 [UI_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/UI_SPEC.md) — Adventure HUD specifications, ASCII layouts for all 9 views & celebrations
- 🪄 [DESIGN_SYSTEM.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/DESIGN_SYSTEM.md) — CSS token dictionary, theme presets, typography & motion scale
- 📖 [CONTENT_SPEC.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/CONTENT_SPEC.md) — Terminology dictionary, landing page copy & in-app microcopy
- 🌐 [SEO.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/SEO.md) — Public landing page SEO, metadata, JSON-LD schemas & robots/sitemap
- ♿ [ACCESSIBILITY.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/ACCESSIBILITY.md) — WCAG 2.1 AA keyboard navigation matrix, ARIA & motion safety
- 🚀 [PERFORMANCE.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/PERFORMANCE.md) — Lighthouse 95+ scorecards, Core Web Vitals & code-splitting
- 🔄 [USER_FLOWS.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/USER_FLOWS.md) — End-to-end user state flows & video persistence proof
- 🧪 [TESTING.md](file:///d:/RPG-task/LifeRPG_hackathon_spec_pack_v2/TESTING.md) — Unit, component, and MSW contract test plan

---

## 4. Frontend Technology Stack

- **Core**: React 18+ with TypeScript
- **Bundler**: Vite
- **Router**: React Router v6
- **Styling**: CSS Custom Properties (Tokens) + Tailwind CSS
- **Iconography**: Lucide React
- **Audio / Haptics**: Native Web Audio API (tactile chimes, fully optional/mutable)
- **Testing**: Vitest + React Testing Library + MSW

---

## 5. Development Setup & Commands

*(Prepared for implementation phase)*

```bash
# Install dependencies
npm install

# Run Vite development server (HMR enabled)
npm run dev

# Run unit and component test suites
npm run test

# Type-check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Environment Configuration (`.env.example`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_PUBLIC_APP_URL=http://localhost:5173
```

---

## 6. Mandatory Walkthrough Video Verification (Proof of Persistence)

Per hackathon submission rules, the walkthrough video (90–180 seconds, <100MB) must prove **authentic database persistence**:
1. Register fresh character.
2. Complete a quest -> observe XP, Gold, Streak increment.
3. Hard refresh the browser -> confirm data remains completely intact.
4. Visit Armory -> purchase and equip a theme -> hard refresh -> verify theme persists.
5. Log out and log back in -> prove cross-session data integrity.
