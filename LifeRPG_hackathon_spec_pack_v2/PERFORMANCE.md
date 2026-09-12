# Performance Specification & Core Web Vitals — Life RPG

## 1. Performance Goals & Target Scorecard

Performance is an explicit judging pillar. The goal is to achieve sub-second perceived load times, zero interaction lag, and a 95+ score on Google Lighthouse across all audit categories.

| Audit Category | Target Score | Acceptance Criteria |
|---|---|---|
| **Lighthouse Performance** | **≥ 95** | Production build evaluated on mobile emulation. |
| **Lighthouse Accessibility** | **≥ 98** | Full keyboard and screen reader compliance. |
| **Lighthouse Best Practices** | **100** | HTTPS, modern JS/CSS, no console warnings, safe links. |
| **Lighthouse SEO** | **100** | Valid metadata, crawlable semantic DOM, sitemap, robots. |

---

## 2. Core Web Vitals Budgets (Mobile & Desktop)

| Metric | Threshold | Engineering Strategy |
|---|---|---|
| **LCP** (Largest Contentful Paint) | **< 1.8s** | Inline critical CSS tokens; lightweight hero graphics with `fetchpriority="high"`; zero blocking third-party scripts. |
| **CLS** (Cumulative Layout Shift) | **< 0.02** | All images, skeletons, and badge icons have explicit `width`, `height`, and `aspect-ratio` defined in HTML/CSS. |
| **INP** (Interaction to Next Paint) | **< 80ms** | Checkbox toggles and button presses trigger synchronous immediate DOM state updates before dispatching asynchronous network calls. |
| **FCP** (First Contentful Paint) | **< 1.0s** | Ultra-lean HTML shell; Vite minified and preloaded chunk assets. |

---

## 3. Code-Splitting & Bundle Architecture

### A. Route-Based Dynamic Imports
Non-critical authenticated routes are split using `React.lazy()` and wrapped in `<Suspense fallback={<ScreenSkeleton />}>`:

```tsx
// routes.tsx
const LandingPage = React.lazy(() => import('../features/landing/LandingPage'));
const DashboardPage = React.lazy(() => import('../features/quests/DashboardPage'));
const CharacterPage = React.lazy(() => import('../features/character/CharacterPage'));
const ArmoryPage = React.lazy(() => import('../features/armory/ArmoryPage'));
const HistoryPage = React.lazy(() => import('../features/history/HistoryPage'));
const SettingsPage = React.lazy(() => import('../features/settings/SettingsPage'));
```

### B. Bundle Weight Budgets (Gzipped)
- **Vendor Core Chunk** (`react`, `react-dom`, `react-router-dom`): `< 65 KB`
- **Initial Landing Page Entry**: `< 40 KB`
- **Authenticated Shell & HUD**: `< 45 KB`
- **Total Initial Critical Load**: **`< 150 KB`** (gzipped)

---

## 4. Asset Optimization & Image Delivery

1. **Icons**:
   - Strictly import individual named icons from `lucide-react` (e.g., `import { Check, Shield, Flame } from 'lucide-react'`).
   - Do NOT import full icon bundles.
2. **Artwork & Badges**:
   - Stored in modern `.webp` or optimized `.svg` vector format.
   - Below-the-fold assets use `loading="lazy"` and `decoding="async"`.
3. **Fonts**:
   - Self-hosted or preconnected Google Fonts with `&display=swap`.
   - Subset to Latin characters only to minimize font file weight.

---

## 5. React Rendering & Memory Optimization

- **State Locality**: Form inputs keep state local to the modal; typing in the Quest Composer does NOT trigger re-renders in the Header HUD or Quest List.
- **Memoized Selectors**: Quest filtering (Today, Discipline, Difficulty) uses `useMemo()` to prevent recalculating arrays during unrelated state updates.
- **Virtual DOM Batching**: React 18 automatic batching ensures multiple state updates inside promise callbacks render in a single paint cycle.
- **Event Listeners**: Scroll and resize listeners are throttled or debounced using `requestAnimationFrame`.

---

## 6. Zero-Bloat Dependency Rules

To prevent bundle bloat during the hackathon:
- ❌ **NO bulky utility packages**: Use native ES6+ features (`Array.prototype.filter`, `Object.fromEntries`) instead of full `lodash`.
- ❌ **NO heavy date libraries**: Use native `Intl.DateTimeFormat` or tiny date helpers instead of `moment.js` or `date-fns` full library.
- ❌ **NO massive chart libraries**: Render lightweight, accessible SVG meters for the 5 attributes instead of importing `chart.js` or `d3`.
- ❌ **NO unneeded animation libraries**: Leverage CSS keyframes and transitions for 90% of animations; use targeted Framer Motion only for complex layout animations.

---

## 7. Performance Audit Checklist

- [x] Production build generated via `npm run build` and tested with `npm run preview`.
- [x] Network tab confirms gzip / brotli compression enabled.
- [x] Zero render-blocking resources in `<head>`.
- [x] Lighthouse audit executes cleanly with no console warnings or uncaught exceptions.
- [x] Layout shifts verified at 0.00 during quest completion and modal opening.
