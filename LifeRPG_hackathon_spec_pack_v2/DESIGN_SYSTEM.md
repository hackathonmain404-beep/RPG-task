# Design System — Life RPG

## 1. System Philosophy: Tactile Cyber-Fantasy Tokens

The design system is structured around semantic CSS custom properties (variables) rather than hardcoded utility values. This enables:
1. **Dynamic Theme Switching**: Equipped theme cosmetics from the inventory swap the CSS token dictionary at the `:root` level without re-rendering component DOM or altering game state.
2. **Unified Color Contrast**: Strict adherence to WCAG 2.1 AA contrast thresholds (≥ 4.5:1 for body copy; ≥ 3.0:1 for large headings and interactive UI badges).
3. **Hardware-Accelerated Motion**: Transitions utilize `transform` and `opacity` exclusively to ensure consistent 60+ FPS on mobile and low-power devices.

---

## 2. Core Token Architecture

### A. Surface & Canvas Tokens

```css
:root {
  /* Canvas Backgrounds */
  --bg-canvas: #090c10;             /* Base deepest background */
  --bg-surface: #0f141c;            /* Standard card & container background */
  --bg-surface-elevated: #161d28;   /* Hovered card, modal, or dropdown surface */
  --bg-surface-sunken: #06080b;     /* Input fields and sunken wells */

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08); /* Card borders and subtle separators */
  --border-strong: rgba(255, 255, 255, 0.18); /* Active element boundaries */
  --border-focus: #38bdf8;                     /* Accessible keyboard focus ring */

  /* Typography Colors */
  --text-primary: #f8fafc;          /* High-contrast titles and body text */
  --text-secondary: #94a3b8;        /* Subtitles, labels, timestamps */
  --text-tertiary: #64748b;         /* Placeholder text, disabled labels */
  --text-inverted: #020617;         /* Text on bright badges or primary buttons */
}
```

---

### B. Gamification & RPG Domain Tokens

```css
:root {
  /* Progression Colors */
  --color-xp: #a855f7;              /* XP progress bar and floating fly-up text */
  --color-xp-bg: rgba(168, 85, 247, 0.15); /* XP bar unfilled track */
  --color-gold: #f59e0b;            /* Gold currency, coin icons, shop prices */
  --color-gold-bg: rgba(245, 158, 11, 0.15);
  --color-streak: #ef4444;          /* Flame streak, momentum counter */
  --color-streak-glow: rgba(239, 68, 68, 0.35);

  /* Disciplines / Attribute Colors */
  --attr-intellect: #3b82f6;        /* Coding, Logic, Technical Tasks */
  --attr-intellect-bg: rgba(59, 130, 246, 0.15);

  --attr-strength: #ef4444;         /* Gym, Calisthenics, Fitness */
  --attr-strength-bg: rgba(239, 68, 68, 0.15);

  --attr-wisdom: #14b8a6;           /* Reading, Study, Strategy */
  --attr-wisdom-bg: rgba(20, 184, 166, 0.15);

  --attr-charisma: #8b5cf6;         /* Social, Teamwork, Public Speaking */
  --attr-charisma-bg: rgba(139, 92, 246, 0.15);

  --attr-vitality: #10b981;         /* Sleep, Health, Mindfulness */
  --attr-vitality-bg: rgba(16, 185, 129, 0.15);

  /* Status Colors */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-danger: #ef4444;
  --status-info: #0284c7;
}
```

---

### C. Rarity Tier Tokens (Armory & Relics)

```css
:root {
  --rarity-common: #94a3b8;         /* Standard starter items */
  --rarity-rare: #3b82f6;           /* Blue glowing tier */
  --rarity-epic: #a855f7;           /* Purple glowing tier */
  --rarity-legendary: #f59e0b;      /* Golden animated shimmer tier */
}
```

---

## 3. Theme Presets (Persistent Inventory Cosmetics)

When a player equips a purchased theme from their inventory, the frontend applies the corresponding `data-theme` attribute to `<html>` or `<body>`. This dynamically remaps the tokens:

### Theme 1: Default Citadel (The Midnight Bastion)
- Target: `[data-theme="default"]`
- Base: Obsidian `#090C10`, Surface `#0F141C`, Accent `#38BDF8` (Sky Blue).
- Vibe: Modern tactile command terminal.

### Theme 2: Neon Outpost (Cyberpunk Grid)
- Target: `[data-theme="neon_outpost"]`
- Base: Deep Void `#07070F`, Surface `#120F24`, Accent `#06B6D4` (Electric Cyan).
- XP Glow: `#D946EF` (Fuchsia), Gold: `#FBBF24`.
- Borders: `1px solid rgba(6, 182, 212, 0.3)`.

### Theme 3: Mystic Forest (Ancient Runes)
- Target: `[data-theme="mystic_forest"]`
- Base: Dark Moss `#07100B`, Surface `#0E1D15`, Accent `#10B981` (Emerald).
- XP Glow: `#34D399` (Mint), Gold: `#EAB308`.
- Borders: `1px solid rgba(16, 185, 129, 0.25)`.

### Theme 4: Solaris Gold (Celestial Radiance)
- Target: `[data-theme="solaris_gold"]`
- Base: Warm Charcoal `#100D0A`, Surface `#1B1611`, Accent `#F59E0B` (Warm Gold).
- XP Glow: `#FB923C` (Solar Orange), Gold: `#FDE047`.
- Borders: `1px solid rgba(245, 158, 11, 0.3)`.

---

## 4. Typography Scale

Fonts are loaded from Google Fonts with `font-display: swap` for instant rendering without layout shift:
- **Display Headings**: `Cinzel`, `Outfit`, or `Space Grotesk` (Cinematic, authoritative, heroic).
- **Body & UI Text**: `Inter` or `Plus Jakarta Sans` (Crisp readability at small sizes).
- **Numerals & Metrics**: `JetBrains Mono` or tabular numerals (`font-variant-numeric: tabular-nums`) to prevent jittering when counters tick upward.

```css
:root {
  --font-display: 'Space Grotesk', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Typography Scale */
  --text-xs: 0.75rem;    /* 12px - Badges, timestamps */
  --text-sm: 0.875rem;   /* 14px - Card meta, labels, secondary copy */
  --text-base: 1rem;     /* 16px - Standard body, quest titles */
  --text-lg: 1.125rem;   /* 18px - Section subheadings */
  --text-xl: 1.25rem;    /* 20px - Card headers, modal titles */
  --text-2xl: 1.5rem;    /* 24px - Section headers */
  --text-3xl: 1.875rem;  /* 30px - Screen headers */
  --text-4xl: 2.25rem;   /* 36px - Hero banners, Level-up fanfare */
}
```

---

## 5. Motion, Easing & Elevation Scale

### Elevation & Glows
```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  
  /* Restrained Glows */
  --glow-xp: 0 0 12px rgba(168, 85, 247, 0.3);
  --glow-gold: 0 0 12px rgba(245, 158, 11, 0.3);
  --glow-streak: 0 0 14px rgba(239, 68, 68, 0.35);
  --glow-focus: 0 0 0 2px #090c10, 0 0 0 4px #38bdf8;
}
```

### Motion Durations & Springs
```css
:root {
  --duration-instant: 75ms;   /* Checkbox toggle, button press down */
  --duration-fast: 150ms;      /* Dropdown open, hover states */
  --duration-base: 250ms;      /* Card expansion, tab transitions */
  --duration-slow: 450ms;      /* Progress bar fill, toast slide-in */
  --duration-celebrate: 750ms; /* Level up crest bounce, reward fly-up */

  /* Easing curves */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1); /* Snappy tactile feel */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 6. Accessibility & Reduced Motion Guardrail

All animations strictly observe user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Replace particle bursts and floating text with immediate text reveals */
  .reward-flyup {
    transform: none !important;
    opacity: 1 !important;
  }
}
```
