# User Flows & State Transitions — Life RPG

## 1. Overview of Core Experience

A successful user journey in Life RPG moves effortlessly from discovery to daily habit reinforcement. This document maps every user interaction, state transition, and backend synchronization point.

---

## 2. Flow 1: Public Discovery & Character Forge (Onboarding)

```text
Visitor arrives at https://liferpg.app/
  │
  ├─ 1. Engages with Public Landing Page (SEO optimized, zero auth needed)
  │    • Reads value proposition and 4-step game loop.
  │    • Interacts with the sandboxed Hero Quest Simulator (clicks "Complete", sees dopamine loop).
  │    • Reviews the 5 Disciplines (Intellect, Strength, Wisdom, Charisma, Vitality) and FAQ.
  │
  ├─ 2. Clicks Primary CTA: [Begin Your Adventure — Free]
  │    • Routes to /register
  │
  ├─ 3. Fills Registration Form
  │    • Enters Display Name, Email, and Password.
  │    • Selects Starter Archetype Focus (e.g., "Code Scribe / Intellect Focus").
  │    • Client performs inline validation.
  │    • Submits: POST /api/auth/register
  │
  ├─ 4. Backend Provisioning
  │    • Creates User record + Character record (Level 1, 0 XP, 50 starter Gold, Streak 0).
  │    • Initializes 5 baseline Attributes at Level 1.
  │    • Sets secure HTTP-only session cookie.
  │    • Returns: { user, character }
  │
  └─ 5. Entry into Command Citadel (/app/dashboard)
       • Guided onboarding tooltip points to the Quest Board.
       • First default quest ready: "Forge your first real-world quest."
```

---

## 3. Flow 2: The Daily Quest Loop (Create, Execute, Slay)

```text
Adventurer is on Command Citadel Dashboard (/app/dashboard)
  │
  ├─ 1. Initiates Quest Creation
  │    • Presses [ + New Quest ] button or hits keyboard shortcut 'N'.
  │    • Quest Composer modal/drawer slides open with trapped focus.
  │
  ├─ 2. Enters Quest Details
  │    • Title: "Study React Hooks & Custom Reducers" (Autofocused)
  │    • Discipline: Selects [ 🧠 Intellect ] from dropdown
  │    • Difficulty: Clicks segmented pill [ Medium (+65 XP, +18 Gold) ]
  │    • Due Date: Today (Defaults to active day)
  │    • Clicks [ Embark / Save Quest ] (or presses Cmd+Enter / Ctrl+Enter)
  │
  ├─ 3. Backend Task Creation
  │    • Submits: POST /api/tasks { title, description, categoryKey, difficulty, dueDate }
  │    • Backend validates ownership, stores task in PostgreSQL.
  │    • Responds with created task object.
  │    • Composer closes, focus restores, new QuestCard mounts in "Today's Quests".
  │
  ├─ 4. Real-World Work Done & Quest Completion
  │    • User finishes studying in the real world.
  │    • Returns to app and clicks or presses Space/Enter on the QuestCard checkbox.
  │
  ├─ 5. Optimistic UI & Celebratory Sequence (Simultaneous)
  │    • Checkbox immediately checks; card title receives strikethrough.
  │    • Floating reward badge (+65 XP, +18 Gold) emerges and drifts up.
  │    • Checkbox disabled to prevent double-click abuse.
  │
  ├─ 6. Authoritative Server Transaction
  │    • Dispatches: POST /api/tasks/:id/complete
  │    • Server executes atomic database transaction:
  │      - Verifies ownership and uncompleted status.
  │      - Marks task completed with ISO timestamp.
  │      - Calculates non-linear XP reward, Gold addition, Intellect attribute increase.
  │      - Updates consecutive-day streak.
  │      - Logs CompletionEvent.
  │    • Responds with: { task, rewards, progression, streak }
  │
  └─ 7. Final Reconciled State
       • Header HUD updates authoritative XP bar to progression.progressPercent.
       • Header Gold counter counts up to new total (+18 Gold chime).
       • Streak Flame pulses with ember animation.
       • Intellect Attribute card increments (+8).
       • Check if level-up occurred -> Proceeds to Flow 3 if levelAfter > levelBefore.
```

---

## 4. Flow 3: The Non-Linear Level Ascension Event

```text
Triggered when POST /api/tasks/:id/complete returns levelAfter > levelBefore
  │
  ├─ 1. Instant Celebration Trigger
  │    • Sound effect fires (if audio enabled in preferences).
  │    • Screen dims with dark translucent overlay; particle burst radiates outward.
  │    • LevelUpCelebrationModal springs into view.
  │
  ├─ 2. Celebratory Presentation
  │    • Central Crest displays ascension: "LEVEL UP! LEVEL 12 → LEVEL 13".
  │    • Fanfare copy: "Your dedication has elevated your rank in the Citadel!"
  │    • Unlocks Showcase: Highlights newly unlocked store items in the Armory.
  │
  ├─ 3. Player Dismissal
  │    • Player presses [ Continue Questing ] or hits Escape key.
  │    • Modal smoothly fades out; focus returns to the completed quest card.
  │    • Header HUD level badge reflects Level 13 permanently.
```

---

## 5. Flow 4: The Armory Economy (Acquisition & Equipping)

```text
Adventurer navigates to The Armory (/app/armory)
  │
  ├─ 1. Browsing Catalog
  │    • GET /api/shop retrieves available items (Themes, Frames, Badges).
  │    • User browses catalog cards showing price, rarity, and preview.
  │    • User has 380 Gold; inspects "Neon Outpost Theme" priced at 250 Gold.
  │
  ├─ 2. Initiating Purchase
  │    • User clicks [ Acquire for 250 Gold ].
  │    • PurchaseConfirmModal opens:
  │      "Acquire Neon Outpost Theme for 250 Gold? Your new balance will be 130 Gold."
  │    • User clicks [ Confirm Acquisition ].
  │
  ├─ 3. Authoritative Backend Transaction
  │    • Dispatches: POST /api/shop/:itemId/purchase
  │    • Server checks wallet balance >= price in DB.
  │    • Atomically deducts 250 Gold and inserts record into InventoryItem.
  │    • Returns: { purchase, wallet: { gold: 130 }, inventoryItem }
  │
  ├─ 4. Immediate Inventory & Theme Update
  │    • Header HUD Gold updates from 380 to 130.
  │    • Shop card transforms from [ Acquire ] to [ Owned - Equip ].
  │    • User clicks [ Equip ].
  │    • Dispatches: POST /api/inventory/:itemId/equip
  │    • Server verifies ownership and marks theme equipped.
  │    • Frontend ThemeManager sets `data-theme="neon_outpost"` on root DOM.
  │    • Entire app seamlessly switches to Neon Outpost CSS color tokens!
```

---

## 6. Flow 5: The Critical Proof of Persistence (Hackathon Video Demo)

The official problem statement mandates a 90–180 second walkthrough video demonstrating **authentic database persistence**. This exact sequence must be followed without deviation:

```text
Step 1: Fresh Registration
  • Sign up as a new user (e.g., "DemoAdventurer").
  • Show initial state: Level 1, 0 XP, 0 Streak, 50 Gold.

Step 2: Create & Complete Quest
  • Create a quest: "Complete Coding Assignment" (Intellect, Medium).
  • Click complete checkbox.
  • Show immediate XP fly-up, Gold increase (+18), Intellect stat increase (+8), Streak = 1.

Step 3: The Hard Refresh Proof
  • Trigger a full browser page refresh (Ctrl+R / Cmd+R).
  • Watch the application re-fetch GET /api/auth/me, GET /api/character, GET /api/tasks.
  • PROVE: All XP, Gold, Streak, and completed task status remain 100% intact!

Step 4: Armory Acquisition & Refresh Proof
  • Visit Armory.
  • Purchase a starter theme or relic.
  • Equip the theme (observe dynamic UI color change).
  • Refresh the browser a second time.
  • PROVE: The theme remains equipped and in inventory!

Step 5: Log Out & Log In Proof
  • Sign out to demonstrate session invalidation.
  • Log back in with the same credentials.
  • PROVE: Full character profile, level, streak, and history load seamlessly from PostgreSQL!
```

---

## 7. Flow 6: Network Resilience & Rollback

```text
User attempts action during network interruption
  │
  ├─ Scenario A: Task Completion while Offline
  │    • User checks quest box.
  │    • Checkbox turns into pending spinner; strikethrough applies optimistically.
  │    • POST /api/tasks/:id/complete fails (Network Timeout / 500).
  │    • Frontend catches error:
  │      - Reverts checkbox to unchecked state.
  │      - Removes strikethrough.
  │      - Displays sticky amber banner:
  │        "Unable to sync with the Citadel. Please check your connection."
  │      - Offers [ Retry Sync ] button.
  │      - Preserves unsaved data in memory.
  │
  └─ Scenario B: Expired Session (401)
       • User triggers action after session timeout.
       • Backend returns 401 UNAUTHENTICATED.
       • Frontend preserves intended route in memory.
       • Displays toast: "Session expired. Redirecting to login..."
       • Redirects to /login?redirect=/app/dashboard.
```

---

## 8. Flow 7: Complete Keyboard-Only User Journey

1. **Focus Landing CTA**: User presses `Tab` from browser address bar -> lands on `[Begin Adventure]` -> presses `Enter`.
2. **Form Navigation**: Uses `Tab` / `Shift+Tab` to move across fields in `/login` or `/register` -> presses `Enter` to submit.
3. **Open Quest Composer**: On `/app/dashboard`, presses `N` -> QuestComposer modal opens with focus on Title field.
4. **Fill & Save**: Types title, presses `Tab` to select Discipline (`ArrowDown` to Intellect), presses `Tab` to Difficulty (`ArrowRight` to Medium), presses `Cmd+Enter` to submit.
5. **Complete Quest**: Uses `Tab` to focus on the newly created quest checkbox -> presses `Space` -> quest completes, celebratory live-region toast announces reward to screen reader.
6. **Dismiss Level-Up**: If level up modal triggers, presses `Escape` or `Enter` on `[Continue Questing]`.
7. **Navigate to Armory**: Uses `Tab` to focus Sidebar `[Armory]` link -> presses `Enter` -> browses items with arrow keys and purchases with `Enter`.
