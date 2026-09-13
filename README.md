<div align="center">

# ⚔️ ACHIEVER — LIFE RPG
### *Gamified Real-Life Productivity Platform & Character Progression Engine*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-267%20Passed-FCC624?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Transform everyday habits, coding sessions, workouts, and learning into an immersive Role-Playing Game.</strong><br>
  Backed by server-authoritative progression mathematics, anti-cheat security, PostgreSQL persistence, and tactile glassmorphic aesthetics.
</p>

[Live Demo](#-live-demo--deployment) • [Key Features](#-key-features) • [Installation & Setup](#-quick-start--local-installation) • [Architecture](#-architecture--the-golden-contract) • [Testing & Security](#-testing--security-audit)

---

</div>

## 📌 Executive Summary & Problem Framing

Traditional productivity systems and to-do list applications fail due to **delayed gratification** and **chore fatigue**. Users abandon conventional tools because completing a task yields nothing more than a checked box.

**Achiever** solves this fundamental psychological roadblock by mapping real-world productivity directly to **tangible RPG character progression**:
1. **Instant Dopamine Feedback Loops**: Completing a daily task grants verified XP, treasury Gold, and discipline mastery points.
2. **5 Canonical Disciplines**: Real-life activities translate to **Intellect** (Coding/Study), **Strength** (Fitness/Lifting), **Wisdom** (Reading/Mindfulness), **Charisma** (Networking/Speaking), and **Vitality** (Sleep/Nutrition).
3. **Server-Authoritative Anti-Cheat**: Zero client-side progression exploits. Every reward, streak calculation, and level-up is cryptographically verified and executed atomically on the server.
4. **Economy & Customization**: Gold earned from honest discipline can be spent in the Citadel Armory on collectible themes, prestige titles, and custom character avatars.

---

## 🌟 Key Features

### 🛡️ 1. Server-Authoritative Character Engine
- **Non-Linear Leveling Curve**: Powered by the logarithmic progression equation:
  $$\text{Required XP} = \lfloor 100 \times \text{Level}^{1.65} \rfloor$$
- **Momentum Streaks**: Daily completions build consecutive streak counters with auto-recovery thresholds and milestone bonus yields.
- **Mastery Ranks**: Novice → Apprentice → Adept → Master → Grandmaster tier progression for all 5 core disciplines.

### 📜 2. Dynamic Quest Board & Task Engine
- **Full CRUD Support**: Create, schedule, edit, prioritize, and conquer tasks across varying difficulty tiers (`Easy`, `Medium`, `Hard`, `Epic`).
- **Real-Time Filtering**: Filter instantaneously by completion state (`All`, `Active`, `Completed`) and discipline type.
- **Authoritative Completion Modal & Overlay**: Cinematic level-up celebrations and reward toasts upon victory.

### 🏪 3. Citadel Armory & Theme Marketplace
- **Prestige Marketplace**: Acquire titles, theme artifacts, and badges with in-game gold earned strictly through productivity.
- **Dynamic Theming Engine**: Switch between collectible HUD themes (*Cyberpunk 2077*, *Crimson Void*, *Emerald Forest*, *Lofi Haven*, *Neon Synthwave*) with dynamic CSS variable re-binding.
- **User-Isolated Storage**: Theme ownership and inventory records are strictly isolated by `userId` to eliminate cross-account leakage.

### 🔐 4. Flexible & Secure Authentication
- **Magic Link Authentication**: Frictionless passwordless login via email with automated fallback verification.
- **OAuth Providers**: Instant sign-in via Google and GitHub.
- **Guest Traveler Mode**: Immediate zero-login onboarding with local sandbox storage and easy progression migration.
- **Adventurer Identity**: Custom 128×128 canvas center-crop avatar upload engine with lossless WebP compression.

### ⚡ 5. Desktop Ergonomics & Keyboard Shortcuts
- **Single-Key Navigation**: Instant hotkeys (`1` Dashboard, `2` Quests, `3` Character, `4` Shop, `5` Themes, `6` Settings).
- **Quick Action Triggers**: `N` to compose a new quest, `F` to open the feedback desk, `B` to toggle sidebar, and `?` for full shortcut guide.
- **Accessible Esc Dismissals**: Universal `Escape` handling across all modals and dialogs.

### 👑 6. Hidden Master Admin Control Panel
- **Telemetry & Economy Controls**: Real-time user audits, gold supply monitoring, and inventory inspection.
- **Emergency Platform Surges**: Broadcast global server notifications and activate XP multiplier surges.
- **Feedback Desk**: Real-time triage, inspection, and resolution of user feedback reports.

---

## 🏗️ Architecture & The Golden Contract

Achiever is built as a cohesive TypeScript monorepo enforcing a strict **Server-Authoritative Contract**:

```text
                                  ┌────────────────────────┐
                                  │   Browser / Client     │
                                  │  React 19 + Vite SPA   │
                                  └───────────┬────────────┘
                                              │
                                              │ HTTP / JSON / Cookies
                                              ▼
                                  ┌────────────────────────┐
                                  │   Express API Server   │
                                  │  Serverless / Node.js  │
                                  └───────────┬────────────┘
                                              │
                                              │ Prisma ORM
                                              ▼
                                  ┌────────────────────────┐
                                  │ PostgreSQL Database    │
                                  │ Supabase / Neon Cloud  │
                                  └────────────────────────┘
```

### The Golden Contract Rules:
- **Zero Client Authority**: The frontend NEVER computes `user.xp += 50` or `character.gold += 10`. All stat arithmetic is calculated within atomic database transactions on the server.
- **Optimistic Reconciliation**: The UI provides immediate tactile feedback, but rolls back or locks state if the server rejects a payload.
- **Single Source of Truth**: On navigation, window focus (`visibilitychange`), or item equip, the client synchronizes directly with the PostgreSQL database.

---

## 📁 Repository Structure

```text
├── backend/                  # Express REST API Server
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL relational schema (User, Character, Task, ShopItem, Inventory, etc.)
│   │   └── seed.ts           # Authoritative database seeder (Shop items, badges, themes)
│   ├── src/
│   │   ├── controllers/      # Request handlers (auth, character, tasks, shop, admin, feedback)
│   │   ├── middleware/       # Auth verification, rate limiting, error boundaries, security headers
│   │   ├── routes/           # REST route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Core RPG math engine, task progression, economy, auth services
│   │   └── utils/            # Prisma client, JWT helpers, error classes
│   └── tests/                # Vitest backend integration, security, and economy test suites
│
├── frontend/                 # React 19 Client SPA
│   ├── public/               # Static assets, SVG item icons, favicon, manifest
│   ├── src/
│   │   ├── components/       # Layout (AppShell, HeaderHUD), common modals, skeletons, UI components
│   │   ├── context/          # State providers (AuthContext, QuestsContext, ShopContext, ThemeProvider)
│   │   ├── features/         # Feature modules (dashboard, quests, character, shop, themes, admin, settings)
│   │   ├── hooks/            # Keyboard shortcuts, SSE subscriptions, metadata hooks
│   │   ├── services/api/     # Typed API clients for backend communication
│   │   └── test/             # Vitest frontend component & integration test suites
│
├── api/                      # Vercel Serverless Function entrypoint (index.ts)
├── vercel.json               # Vercel full-stack deployment configuration & SPA rewrites
└── package.json              # Monorepo scripts and root dependencies
```

---

## 🚀 Quick Start & Local Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**: Local PostgreSQL instance OR free cloud database ([Neon.tech](https://neon.tech/) / [Supabase](https://supabase.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/hackathonmain404-beep/RPG-task.git
cd RPG-task
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` in the project root (or use the pre-configured cloud instance):
```env
PORT=3000
NODE_ENV=development

# Database Connection (Supabase / Neon Cloud PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Authentication Secrets (minimum 32 characters)
JWT_SECRET="your-jwt-token-secret-key-minimum-32-characters"
SESSION_SECRET="your-session-secret-key-minimum-32-characters"

# Client URLs
FRONTEND_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"

# Supabase Auth Integration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Frontend Vite Variables
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_API_URL="/api"
```

### 4. Setup Database Schema & Seed Catalog
```bash
# Push schema migrations to PostgreSQL
npm run db:push

# Seed default shop catalog, titles, and themes
npm run seed
```

### 5. Launch the Development Environment
Run both backend and frontend concurrently:
```bash
# Terminal 1: Launch Express API (Port 3000)
npm run dev:backend

# Terminal 2: Launch Vite React Client (Port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

Achiever was engineered with a **test-driven quality standard**. All test suites execute against strict real-world scenarios:

### Test Suites Summary
| Test Scope | Runner | Tests | Status |
| :--- | :--- | :--- | :--- |
| **Backend Integration & Security** | Vitest (Node) | **164 Passed** | ✅ Zero Failures |
| **Frontend Components & Flows** | Vitest (JSDOM) | **103 Passed** | ✅ Zero Failures |
| **Total Automated Tests** | — | **267 Passed** | 💯 100% Pass Rate |

### Running the Test Suites
```bash
# Run all backend tests (Auth, Tasks, Economy, Streaks, Anti-Cheat Security)
npm run test:backend

# Run all frontend tests (Dashboard, Quests, Character, Shop, Accessibility)
npm run test:frontend

# Run full project typecheck
npm run typecheck
```

---

## 🛡️ Security & Anti-Cheat Audit

Achiever incorporates enterprise-grade protection against common web application vulnerabilities and gamification exploit vectors:

1. **Anti-Cheat & Server Authority**:
   - Client requests cannot dictate reward values. Request bodies specifying XP or Gold are rejected or stripped.
   - Idempotent task completion: Concurrent task completion requests (10 simultaneous requests) award XP and Gold **exactly once**.
2. **Double-Spend & Economy Protection**:
   - Shop purchases use database-level balance constraints. Negative balance exploits are mathematically impossible.
   - Duplicate unique item purchases are prevented at the database schema level (`userId_itemId` compound keys).
3. **Tenant Isolation & IDOR Defense**:
   - Strict `userId` ownership verification on every Task, Inventory, and Character mutation. User B cannot read, update, complete, or delete User A's data.
4. **HTTP Security Standards**:
   - `Helmet.js` security headers enabled.
   - `express-rate-limit` DDoS and brute-force mitigation on authentication and task endpoints.
   - Secure HTTP-only cookies and JWT signature verification.

---

## ☁️ Deployment Guide (Vercel)

Achiever is optimized for zero-configuration deployment on **Vercel** via serverless architecture:

1. Import the repository into your **Vercel Dashboard**.
2. Set the deployment branch to **`main`**.
3. Add the environment variables from the [Environment Configuration](#3-configure-environment-variables) section.
4. The pre-configured [`vercel.json`](file:///vercel.json) automatically routes:
   - All `/api/*` traffic to `api/index.ts` (Express serverless handler).
   - All other routes to `frontend/dist` with SPA history fallback.
5. Click **Deploy**.

---

## 🎮 Technical Stack Summary

- **Frontend**: React 19, TypeScript, Vite, React Router v6, Lucide Icons, Canvas 2D API, Web Audio API
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Zod Validation
- **Database**: PostgreSQL (hosted on Supabase / Neon)
- **Styling**: Vanilla CSS Custom Properties (Tokens), Glassmorphic HUD Design System
- **Testing**: Vitest, React Testing Library, Supertest, JSDOM
- **Hosting**: Vercel Serverless Functions + Vercel Edge CDN

---

<div align="center">
  <sub>Engineered with precision for the Hackathon by the Life RPG Team.</sub>
</div>
