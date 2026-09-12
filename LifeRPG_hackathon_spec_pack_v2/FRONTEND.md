# Frontend Specification — Life RPG

## 1. Scope & Primary Responsibility

The Frontend application owns presentation, interactive gamification feedback, client-side navigation, accessibility, responsive ergonomics, and visual polish. 

### Core Tenet: Presentation is Interactive; Backend is Authoritative
The frontend translates real-world activity into a compelling, tactile adventure HUD. However, the frontend **never** acts as the authority for progression math.
- **Client asks, server computes, client visualizes.**
- Progression metrics (Total XP, Level, Gold, Streak, Attribute values, Inventory ownership) are authoritative **only** when confirmed by the backend API.

---

## 2. Technology Stack & Tooling

As defined in `TECH_STACK.md` and `ARCHITECTURE.md`:

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | **React 18+ (TypeScript)** | Industry standard, strong type-safety, component modularity. |
| **Build Tool** | **Vite** | Sub-second HMR, optimized production rollup bundles, instant cold start. |
| **Routing** | **React Router v6** | Declarative client-side routing, nested layouts, protected route guards. |
| **Styling** | **CSS Variables + Tailwind CSS** | Design-token-driven system allowing dynamic runtime theme switching via CSS custom properties. |
| **Icons** | **Lucide React** | Lightweight, accessible SVG icon library with consistent 24px grid alignment. |
| **Micro-Interactions** | **Targeted CSS Keyframes / Framer Motion** | High-performance hardware-accelerated animations reserved for celebratory milestones; zero bloated libraries. |
| **API Client** | **Typed Fetch Client** | Modular, centralized service layer with typed request/response contracts and uniform error handling. |
| **Testing** | **Vitest + React Testing Library** | Fast unit and component integration testing with accessibility queries. |

---

## 3. Frontend Component Registry (The 28 Owned Areas)

Every owned area maps to a distinct architectural module:

```text
src/
├── app/
│   ├── routes.tsx               # App routing table & layout boundaries
│   ├── App.tsx                  # Root wrapper (Providers, ThemeProvider, ErrorBoundary)
│   └── index.css                # Global CSS tokens, reset, typography
├── components/
│   ├── common/                  # Reusable low-level UI primitives
│   │   ├── Button/              # Tactile button with sound/haptic hook & loading spinner
│   │   ├── Input/               # Accessible labeled input with inline validation
│   │   ├── Select/              # Custom accessible dropdown
│   │   ├── Modal/               # Trapped focus modal dialog with Escape dismissal
│   │   ├── Toast/               # ARIA live-region reward & status notifications
│   │   ├── Badge/               # Rarity/category pill tags
│   │   ├── ProgressBar/         # Smooth XP and attribute progression meters
│   │   └── Skeleton/            # Loading shimmer skeletons matching card geometry
│   ├── layout/                  # Shell structure
│   │   ├── AppShell/            # Responsive container (Sidebar + HUD + Main Area + BottomNav)
│   │   ├── HeaderHUD/           # Top HUD bar (Player level, XP meter, Gold counter, Streak flame)
│   │   ├── SidebarNav/          # Persistent desktop navigation
│   │   └── MobileBottomNav/     # Bottom touch-accessible tab bar
│   ├── feedback/                # Celebratory & status feedback
│   │   ├── LevelUpCelebration/  # Full celebratory modal with animated unlocks & particle burst
│   │   ├── RewardFlyup/         # Floating XP (+70 XP) and Gold (+18 Gold) text animations
│   │   ├── StreakFlameWidget/   # Animated streak counter with momentum indicators
│   │   └── ErrorBanner/         # Friendly recoverable error message with retry action
│   └── seo/
│       └── MetaTags/            # Head manager for Open Graph, Twitter, Canonical, Schema.org
├── features/
│   ├── landing/                 # Public crawlable marketing landing page
│   │   ├── HeroSection/         # Hook, interactive demo simulation, primary CTA
│   │   ├── GameLoopSection/     # 4-step loop visualizer (Quest -> Work -> Complete -> Progress)
│   │   ├── DisciplinesSection/  # Attribute breakdown (Intellect, Strength, Wisdom, etc.)
│   │   ├── FAQSection/          # Indexable accessible accordion FAQ
│   │   └── LandingFooter/       # Links, copyright, social metadata
│   ├── auth/                    # Authentication UI
│   │   ├── LoginForm/           # Email/password form with client-side validation
│   │   ├── RegisterForm/        # Registration form with password requirements
│   │   └── OnboardingModal/     # Starter character avatar & display name selection
│   ├── quests/                  # Quest / Task CRUD
│   │   ├── QuestList/           # Filterable quest grid/list (Today / Active / Completed)
│   │   ├── QuestCard/           # Tactile card with category badge, difficulty, checkbox action
│   │   ├── QuestComposer/       # Modal/drawer for creating and editing quests
│   │   └── QuestFilter/         # Filter by discipline (category) and completion status
│   ├── character/               # Character profile & progression
│   │   ├── CharacterCard/       # Avatar, equipped frame, title, level milestone
│   │   ├── AttributeRadar/      # Radial or bar chart of character disciplines
│   │   └── RelicShowcase/       # Showcase grid of unlocked badges
│   ├── armory/                  # Virtual economy & shop
│   │   ├── ShopCatalog/         # Grid of purchasable themes, badges, avatar frames
│   │   ├── ShopItemCard/        # Price tag, rarity border, purchase state handler
│   │   └── PurchaseConfirm/     # Confirmation modal showing cost and remaining gold
│   ├── inventory/               # User-owned inventory
│   │   ├── InventoryGrid/       # Owned items categorized by type
│   │   └── EquipToggle/         # Instant equip/unequip controller with active state
│   ├── history/                 # Chronological activity log
│   │   └── ActivityTimeline/    # Infinite scroll/paginated timeline of completed quests & unlocks
│   └── settings/                # Preferences & user controls
│       └── SettingsPanel/       # Theme switcher, timezone, motion toggle, sign out
├── services/
│   ├── api/                     # Centralized typed HTTP services
│   │   ├── client.ts            # Base fetch wrapper with auth header & error decoding
│   │   ├── auth.ts              # /api/auth endpoints
│   │   ├── tasks.ts             # /api/tasks endpoints (CRUD + Complete)
│   │   ├── character.ts         # /api/character endpoints (Summary + History)
│   │   ├── shop.ts              # /api/shop & purchase endpoints
│   │   └── inventory.ts         # /api/inventory & equip endpoints
│   └── theme/
│       └── themeManager.ts      # Applies CSS variables based on equipped theme
├── types/                       # Client & shared contract TypeScript definitions
│   └── contract.ts              # Exact mirror of CONTRACT_FRONTEND_BACKEND.md shapes
└── utils/                       # Pure utility helpers
    ├── formatters.ts            # Date, currency, XP string formatters
    ├── math.ts                  # Client progress bar percentage calculation helper
    └── sound.ts                 # Optional lightweight Web Audio API sound triggers
```

---

## 4. Application Routing Architecture

```text
/                              → Public Landing Page (SEO optimized, indexable)
├── /login                     → Login Screen (Redirects to /app if session active)
├── /register                  → Register Screen (Directs to onboarding on success)
└── /app                       → Authenticated App Shell (Guarded by session check)
    ├── /app/dashboard         → Today's Quests + Quick HUD + Quick Stats (Default route)
    ├── /app/quests            → Full Quest Management (Filter, search, archive)
    ├── /app/character         → Character Sheet (Attributes, level milestones, titles)
    ├── /app/armory            → Virtual Shop (Themes, badges, avatar cosmetics)
    ├── /app/inventory         → Owned Equipment & Theme Selector
    ├── /app/history           → Activity Log & Progression Timeline
    └── /app/settings          → Theme, Preferences, Session Management
```

---

## 5. State Architecture: Server State vs. UI State

To prevent state desynchronization, the frontend strictly separates **Server State** from **UI State**:

### A. Server State (Data synchronized with PostgreSQL via API)
- **User Profile**: `id`, `email`, `displayName`
- **Character**: `level`, `totalXp`, `gold`, `streakCurrent`, `streakBest`, `attributes`
- **Quests**: Array of user tasks with `id`, `title`, `description`, `categoryKey`, `difficulty`, `completed`, `dueDate`
- **Shop Catalog**: Available purchasable items
- **Inventory**: Owned items and currently equipped theme/badge
- **Activity Log**: Chronological events

*Implementation Rule*: Server state is loaded via service hooks (`useQuests()`, `useCharacter()`, `useShop()`), cached in memory, and re-fetched or reconciled upon mutations.

### B. Local UI State (Ephemeral, client-only)
- Modals / Drawers open state (`isComposerOpen`, `isLevelUpOpen`, `selectedItemId`)
- Active tab / category filter (`all`, `today`, `intellect`, `strength`)
- Temporary toast notifications (queued with timeout)
- Optimistic button completion states (pending animation lock)
- Form inputs before submission

---

## 6. Optimistic UI & Server Reconciliation Cycle

The official problem statement specifically rewards an **alive, tactile experience** while forbidding client-side authority over game rules. The frontend implements the following **Optimistic Interaction Cycle**:

```text
User Clicks "Complete" Button on QuestCard
  │
  ├─ 1. OPTIMISTIC TRIGGER (Immediate <16ms)
  │    • QuestCard visual state flips to "completed" (strikethrough + dimmed background).
  │    • Complete button disabled to prevent duplicate network calls.
  │    • Subtle checkmark transformation & local particle burst fires.
  │    • Temporary floating "+XP" placeholder appears.
  │
  ├─ 2. AUTHORITATIVE NETWORK CALL
  │    • Dispatches: POST /api/tasks/:id/complete
  │
  ├─ 3. BACKEND RESOLUTION
  │    ├── SUCCESS (HTTP 200)
  │    │   • Receive authoritative payload:
  │    │     { task, rewards: { xp, gold, attribute }, progression, streak }
  │    │   • Reconcile character store with progression.totalXp and gold.
  │    │   • Smoothly animate Header HUD:
  │    │     - XP bar fills to progression.progressPercent
  │    │     - Gold counter increments with chime animation (+rewards.gold)
  │    │     - Streak flame pulses (+1 if today's first quest)
  │    │     - Attribute card pulses (+rewards.attribute.amount)
  │    │   • Check if progression.levelAfter > progression.levelBefore:
  │    │     - If TRUE: Trigger LevelUpCelebrationModal with celebratory fanfare!
  │    │   • Log activity entry.
  │    │
  │    └── FAILURE / CONFLICT (HTTP 400 / 401 / 409 / 500)
  │        • Roll back QuestCard visual state to "uncompleted".
  │        • Re-enable complete button.
  │        • Clear temporary floating XP.
  │        • Display ErrorBanner or Toast:
  │          - If 409 (TASK_ALREADY_COMPLETED): "Quest was already marked complete."
  │          - If Network error: "Failed to sync quest. Please check your connection."
```

---

## 7. Error Handling & Resilience Matrix

Every mutation and view handles all possible HTTP error responses consistently:

| HTTP Status | Error Code | UI Treatment |
|---|---|---|
| **400 Bad Request** | `INVALID_INPUT` | Inline field error messages under corresponding form inputs. Form data is preserved. |
| **401 Unauthorized** | `UNAUTHENTICATED` | Clear session state, preserve attempted route, redirect to `/login?redirect=...`. |
| **403 Forbidden** | `UNAUTHORIZED_ACCESS` | Display non-destructive warning banner: "You do not have permission to view or modify this resource." |
| **404 Not Found** | `TASK_NOT_FOUND` | Remove stale item from local cache, show toast: "Quest could not be found." |
| **409 Conflict** | `TASK_ALREADY_COMPLETED` | Immediately reconcile task as completed, prevent duplicate reward animation, inform user via toast. |
| **409 Conflict** | `INSUFFICIENT_GOLD` | Shake gold counter on Shop card with tooltip: "Need X more Gold to acquire this item." |
| **422 Unprocessable** | `VALIDATION_ERROR` | Detailed validation summary banner with links to invalid inputs. |
| **429 Rate Limit** | `RATE_LIMITED` | Disable action button with countdown timer toast: "Too many requests. Please wait a moment." |
| **500 Server Error** | `INTERNAL_ERROR` | Show user-friendly toast: "The Citadel servers encountered an issue. Your progress is safe; please retry." |
| **Network Loss** | `FETCH_FAILED` | Offline indicator badge in Header HUD. Cache unsaved form drafts to `sessionStorage`. |

---

## 8. Anti-Cheat & Verification Guardrails

1. **Zero Client Progression Math**: No client file contains code of the form `user.xp += 50` or `character.gold += 10`.
2. **Deterministic Inputs**: The client sends only intent (`POST /api/tasks/:id/complete` or `POST /api/shop/:id/purchase`).
3. **Payload Inspection**: All responses from the backend are validated against TypeScript types defined in `types/contract.ts`.
4. **No Storage Bypass**: Never read game state from `localStorage` as primary truth. On initial app mount, call `GET /api/auth/me` and `GET /api/character` to populate authentic state.

---

## 9. Performance & Bundle Budgets

- **Initial Bundle Target**: < 150 KB (gzipped) for critical path (`/` and `/login`).
- **Code-Splitting**: Feature routes (`/app/character`, `/app/armory`, `/app/history`, `/app/settings`) are dynamically imported via `React.lazy()`.
- **Render Optimization**: Heavy widgets (AttributeRadar, ActivityTimeline) are memoized to avoid redundant renders during high-frequency micro-interactions.
- **Images & Media**: SVGs for icons; WebP/AVIF for badges and avatars with explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS = 0).

---

## 10. Verification Checklist Before Code Implementation

- [x] Every API interaction matches `CONTRACT_FRONTEND_BACKEND.md`.
- [x] UI design tokens match `DESIGN_SYSTEM.md`.
- [x] Flow diagrams match `USER_FLOWS.md`.
- [x] Accessibility criteria match `ACCESSIBILITY.md`.
- [x] SEO strategy matches `SEO.md`.
- [x] Performance targets match `PERFORMANCE.md`.
- [x] No client-side authority over XP, Gold, Level, Streak, or Attributes exists.
- [x] Loading skeletons, empty states, and error recovery banners are defined for every screen.
