# UI Specification — Life RPG (Adventure HUD)

## 1. Creative Direction: Adventure HUD / Modern Tactical RPG

The hackathon guidelines explicitly reject generic enterprise SaaS dashboards, unstyled Bootstrap/Shadcn CRUD forms, and soulless data grids. The product must feel **alive, tactile, and immersive** without sacrificing readability or speed.

### Design Metaphor: The Adventurer's Operating System
The interface is structured like an elite adventurer's HUD (Heads-Up Display):
- **Base Environment**: Deep Obsidian and Slate dark canvas with crisp borders, subtle inner glows, and tactile depth.
- **Visual Texture**: Restrained cyber-fantasy accents, illuminated status meters, and dynamic micro-particles that trigger exclusively during meaningful milestones (completing a quest, leveling up, acquiring gear).
- **Tactile Resonance**: Buttons depress with a physical click feel, progress bars fill with easing elasticity, and achievements announce themselves with punchy, satisfying celebrations.

---

## 2. Global Shell & Layout Architecture

### A. Desktop Layout (≥ 1024px)
A 3-zone layout maximizing glanceability and minimizing modal interruptions:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [⚔️ LIFE RPG]          [LVL 12 · 1,840 / 2,400 XP  ██████████░░ 76%]    [💰 1,240 GOLD]   [🔥 7 DAYS]  │
├──────────────┬──────────────────────────────────────────────────────────────┬──────────────────────────┤
│ NAVIGATION   │ MAIN CONTENT AREA (Dynamic Route View)                       │ CHARACTER QUICK PANEL    │
│              │                                                              │                          │
│ 🛡️ Dashboard │  TODAY'S QUESTS                         [+ New Quest (N)]    │  ADVENTURER: Valkyrie    │
│ 📜 Quests    │  ──────────────────────────────────────────────────────────  │  TITLE: Code Scribe      │
│ 🧙 Character │  [✓] Study React Hooks               [Intellect]  +70 XP     │  ──────────────────────  │
│ 🏪 Armory    │  [ ] Morning Gym Workout             [Strength]   +55 XP     │  🧠 Intellect   Lvl 18   │
│ 🎒 Inventory │  [ ] Read Clean Architecture Ch. 4   [Wisdom]     +40 XP     │  ⚔️ Strength    Lvl 14   │
│ 📜 History   │  [ ] 10-Min Meditation               [Vitality]   +30 XP     │  📖 Wisdom      Lvl 21   │
│ ⚙️ Settings  │                                                              │  ✨ Charisma    Lvl 10   │
│              │  MOMENTUM BONUS ACTIVE (Streak 🔥 7)                         │  ❤️ Vitality    Lvl 13   │
│ [Sign Out]   │  ──────────────────────────────────────────────────────────  │                          │
│              │  [View All 8 Active Quests →]                                │  [Full Character Sheet →]│
└──────────────┴──────────────────────────────────────────────────────────────┴──────────────────────────┘
```

### B. Mobile Layout (< 768px)
Designed for one-handed thumb ergonomics:
- **Top Bar**: Compact HUD showing Level Badge, XP Pill, Gold Pill, and Streak Flame.
- **Main View**: Scrollable quest stack with large touch targets (minimum 48x48px hit areas).
- **Floating Action Button (FAB)**: Persistent bottom-right `+` button to create a quest instantly.
- **Bottom Navigation Bar**: 5 primary icon tabs (Dashboard, Quests, Character, Armory, Settings).

```text
┌──────────────────────────────────────┐
│ [⚔️ LIFE RPG]   [Lvl 12]  [💰 1,240] │
├──────────────────────────────────────┤
│ TODAY'S QUESTS           🔥 7 DAYS   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [ ] Study React Hooks            │ │
│ │ 🧠 Intellect · Medium   [+70 XP] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ [ ] Morning Gym Workout          │ │
│ │ ⚔️ Strength · Hard      [+55 XP] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ [✓] 10-Min Meditation            │ │
│ │ ❤️ Vitality · Easy     [Claimed] │ │
│ └──────────────────────────────────┘ │
│                                      │
│                          ┌───┐       │
│                          │ + │ (FAB) │
│                          └───┘       │
├──────────────────────────────────────┤
│ [🛡️ Home] [📜 Quests] [🧙 Me] [🏪 Armory] [⚙️]│
└──────────────────────────────────────┘
```

---

## 3. Screen-by-Screen UI Specifications

### Screen 1: Public SEO Landing Page (`/`)
- **Hero Banner**:
  - Title: *"Your Life is the Game. Start Gaining XP."*
  - Subtitle: *"Transform daily tasks, habits, and study into real RPG character growth. Level up attributes, maintain streaks, earn gold, and unlock gear backed by secure database persistence."*
  - CTAs: Primary `[Begin Adventure — Free]`, Secondary `[Log In]`.
  - Live Interactive Quest Simulator: A sandboxed, zero-auth interactive quest card where visitors can click "Complete", witness the instant XP fly-up and gold chime, and experience the dopamine loop before registering.
- **How It Works (The 4-Step Loop)**:
  1. *Formulate the Quest* (Define title, discipline, and difficulty).
  2. *Execute in Reality* (Study, lift, meditate, code).
  3. *Claim Authoritative Rewards* (Earn verified XP, Gold, and attribute stats).
  4. *Ascend & Equip* (Level up, conquer streaks, purchase themes and relics in the Armory).
- **Disciplines & Attributes Breakdown**: Interactive showcase of the 5 character attributes (Intellect, Strength, Wisdom, Charisma, Vitality) with animated meters.
- **Verified Persistence Proof Section**: Visual demonstration illustrating how data is safely stored in PostgreSQL, contrasting against fake localStorage-only apps.
- **Interactive FAQ Accordion**: 6 crawled, keyboard-navigable Q&A items.

---

### Screen 2: Authentication Screens (`/login`, `/register`)
- **Visuals**: Centered atmospheric card framed by subtle rune borders and illuminated input focus rings.
- **Register Form**:
  - Fields: `Display Name`, `Email Address`, `Password` (with live strength indicator: 8+ chars, number, symbol).
  - Starter Discipline Selector: Allows the user to choose their starting archetype focus (Scholar / Warrior / Sage / Diplomat / Guardian).
  - Submit: `[Forge Character]`.
- **Login Form**:
  - Fields: `Email Address`, `Password`.
  - Submit: `[Enter Citadel]`.
- **Accessibility**: Explicit `<label>` elements, `autocomplete="email"`, inline accessible error text linked via `aria-describedby`.

---

### Screen 3: Dashboard & Quest Management (`/app/dashboard`, `/app/quests`)
- **Header HUD (Sticky)**:
  - **Level Badge**: Hexagonal glowing crest with the current level number.
  - **XP Progress Meter**: Dual-layer progress bar. Layer 1: current authoritative XP. Layer 2: glowing transient pulse on reward claim. Text overlay: `1,840 / 2,400 XP (76%)`.
  - **Gold Wallet**: Coin icon with tabular numerals for smooth count-up animation (`+18` chime).
  - **Streak Flame**: Ember animation that intensifies as the streak increases (1-3 days: spark; 4-6 days: flame; 7+ days: inferno).
- **Quest Card Specification**:
  ```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │ [ ]  Complete System Architecture Diagram              [Medium] [XP 65]│
  │      Discipline: 🧠 Intellect   ·   Due: Tomorrow   ·   [✏️ Edit] [🗑️]   │
  └────────────────────────────────────────────────────────────────────────┘
  ```
  - Checkbox: Custom accessible button. On click: triggers checkmark fill, strike-through animation on title, and calls `POST /api/tasks/:id/complete`.
  - Category Badge: Color-coded chip (Blue for Intellect, Red for Strength, etc.).
  - Reward Pill: Displays estimated reward (`+65 XP`, `+18 Gold`).
  - Action Menu: Subtle hover/focus disclosure with Edit and Delete options.

---

### Screen 4: Quest Composer (Modal & Inline Drawer)
- **Trigger**: `+ New Quest` button or keyboard shortcut `N`.
- **Fields**:
  - `Title` (Required, text input, max 100 characters, autofocus).
  - `Description` (Optional, textarea, max 500 characters).
  - `Discipline / Category` (Required dropdown: Intellect, Strength, Wisdom, Charisma, Vitality).
  - `Difficulty` (Required segmented radio pill: Easy [+35 XP], Medium [+65 XP], Hard [+100 XP], Epic [+150 XP]).
  - `Due Date` (Optional native date picker).
- **Validation**: Title cannot be empty or pure whitespace.
- **Focus Management**: Focus traps inside modal while open; pressing `Escape` cancels; pressing `Cmd+Enter` / `Ctrl+Enter` saves instantly.

---

### Screen 5: Character Sheet (`/app/character`)
- **Hero Character Card**:
  - Displays user avatar, equipped border frame, display name, player title (e.g. *"Grand Archmage of Code"*).
  - Cumulative Stats: Total Quests Completed, Longest Momentum Streak, Total Gold Earned, Date Joined.
- **Attribute Progress Bars**:
  - Each of the 5 attributes has its own Level and XP meter:
    - 🧠 **Intellect**: Coding, Technical Problem Solving, Logic.
    - ⚔️ **Strength**: Gym, Calisthenics, Physical Conditioning.
    - 📖 **Wisdom**: Reading, Writing, Deep Research, Strategy.
    - ✨ **Charisma**: Public Speaking, Teamwork, Networking, Mentorship.
    - ❤️ **Vitality**: Sleep Hygiene, Nutrition, Hydration, Mindfulness.
- **Relics Showcase**:
  - Grid of earned badges (e.g., *"First Blood"*, *"Seven-Day Inferno"*, *"Century of Quests"*). Unlocked badges glow with colored borders; locked badges render in grayscale with unlock requirements on hover.

---

### Screen 6: The Armory (Virtual Shop) (`/app/armory`)
- **Categories Tab Bar**: `All Items`, `Themes`, `Avatar Frames`, `Badges`, `Titles`.
- **Shop Item Card**:
  - Item preview artwork.
  - Title and descriptive lore snippet.
  - Rarity tag: `Common` (Gray), `Rare` (Blue), `Epic` (Purple), `Legendary` (Gold).
  - Price: `[💰 250 Gold]`.
  - Purchase Button:
    - If user has sufficient gold: Active glowing button `[Acquire]`.
    - If user has insufficient gold: Disabled button `[Need 40 more Gold]`.
    - If already owned: Displays `[Owned]`, with a direct `[Equip]` toggle.
- **Purchase Confirmation Dialog**:
  - Confirms action: *"Acquire Neon Outpost Theme for 250 Gold? Your new balance will be 180 Gold."*
  - Buttons: `[Cancel]`, `[Confirm Purchase]`.

---

### Screen 7: Inventory & Cosmetic Equipper (`/app/inventory`)
- **Equipped Status Bar**:
  - Active Theme name with preview swatch.
  - Active Avatar Frame.
  - Active Player Title.
- **Inventory Grid**:
  - Displays all items verified by `GET /api/inventory`.
  - One-click `[Equip]` button. On click: optimistic UI updates active theme variables, fires `POST /api/inventory/:id/equip`, and reconciles on success.

---

### Screen 8: Activity & History Log (`/app/history`)
- **Chronological Timeline**:
  - Grouped by day (Today, Yesterday, Previous Days).
  - Event Cards:
    - `Quest Completed`: Study React (+70 XP, +18 Gold, +8 Intellect).
    - `Level Milestone Reached`: Reached Level 12!
    - `Armory Acquisition`: Purchased Dark Citadel Theme.
    - `Streak Maintained`: Day 7 logged!
- **Data Integrity Indicator**: Badge at the top showing: *"All 142 events synchronized with PostgreSQL backend database."*

---

### Screen 9: Settings Panel (`/app/settings`)
- **Account**: Update Display Name, Email (read-only), Password change modal.
- **Preferences**:
  - Timezone selector (ensures streak calculations correspond to user's local day boundary).
  - Theme override dropdown (select from owned inventory themes).
  - Sound effects toggle (Enable/Disable audio cues).
  - Reduce Motion toggle (overrides system preference to disable particle celebrations).
- **Session**: `[Sign Out of Citadel]` button with confirmation prompt.

---

## 4. Celebrations & Micro-Interactions

### A. Quest Completion Feedback Sequence (Duration: ~600ms)
1. **0ms**: Checkbox toggles; card text receives line-through with 300ms ease.
2. **50ms**: Floating reward pill emerges above the checkbox (`+65 XP`, `+18 Gold`) and drifts upward by 24px while fading over 500ms.
3. **100ms**: Header XP progress bar pulses with a light shimmer and animates to the new fill percentage.
4. **200ms**: Header Gold counter increments numbers with a gentle roll effect.
5. **250ms**: If today's first quest, Streak Flame widget fires an ember burst and increments.

### B. Level-Up Celebration Modal (Full Event)
Triggered when backend returns `levelAfter > levelBefore`:
- **Backdrop**: Translucent dark overlay with a soft radial blur.
- **Crest Animation**: Large central crest springs in with sound effect, displaying the new level number in bold gold typography.
- **Fanfare Copy**: *"LEVEL UP! You have ascended to Level 13!"*
- **Unlocks Display**: Grid showing newly unlocked titles, store items, or milestone rewards.
- **Dismissal**: Prominent `[Continue Questing]` button or `Escape` key.

---

## 5. Component States: Loading, Empty, Error

### A. Loading States (Skeletons)
- No generic spinning wheel covering the whole page.
- Quest cards, Character panel, and Shop cards render precise **shimmer skeletons** that match the exact typography height and button geometries of loaded components to eliminate layout shift.

### B. Empty States (Motivating CTAs)
- **Zero Quests Today**: Graphic of an adventurer resting by a campfire. Headline: *"No active quests on your board."* Subhead: *"Create your first quest to begin earning XP and building your momentum."* CTA: `[+ Create a Quest]`.
- **Zero Inventory**: Graphic of an empty backpack. Headline: *"Your armory pouch is empty."* Subhead: *"Earn gold by slaying daily tasks and visit the Armory to unlock themes and relics."* CTA: `[Visit Armory]`.
- **Zero Activity History**: Headline: *"Your chronicles have just begun."* Subhead: *"Complete quests to write your story into the Citadel archives."*

### C. Error States (Actionable Banners)
- **Inline Input Errors**: Red border with icon and text directly below the field: *"Title cannot exceed 100 characters."*
- **Network Sync Failure**: Sticky amber banner at top of view: *"Citadel connection interrupted. Your actions are held safely in memory."* CTA: `[Retry Sync]`.
- **Fatal Error Boundary**: Full-page fallback: *"The magical link to the server was severed."* CTA: `[Reload Application]`.

---

## 6. Strict Negative Constraints (What to Avoid)

- **NO Generic SaaS Grids**: Do not render plain tables with alternating gray rows.
- **NO Plain Bootstrap Look**: Avoid default borders, unstyled form controls, and standard blue hyperlinks.
- **NO Excessive Neon / Glitch Art**: Accents must be restrained, readable, and functional.
- **NO Unstoppable Animations**: Every modal, toast, and celebration must be immediately dismissible by clicking outside, pressing Escape, or navigating away.
- **NO Layout Shifts (CLS)**: Skeletons and image wrappers must always specify fixed aspect ratios.
