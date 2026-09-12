# Accessibility Specification (WCAG 2.1 AA) — Life RPG

## 1. Compliance Standard & Philosophy

The hackathon problem statement explicitly mandates full responsiveness, semantic HTML, and complete keyboard navigation with `Tab`, `Enter`, and `Space`, coupled with screen-reader support. 

### Core Tenet
Gamification and visual celebration must **never** exclude keyboard-only or assistive-technology users. Every interactive capability available via a mouse click must have a 100% equivalent keyboard and screen-reader interaction.

---

## 2. Keyboard Navigation Matrix

| Action / Component | Keys Supported | Expected Behavior |
|---|---|---|
| **Sequential Navigation** | `Tab` / `Shift+Tab` | Traverses interactive elements in logical visual reading order. Focus ring is always visible. |
| **Buttons & Custom Checkbox** | `Enter` or `Space` | Activates action immediately. Checkbox toggles completion state; button triggers submission or action. |
| **Modals & Drawers** | `Escape` | Closes the open modal or drawer and restores focus to the triggering element. |
| **Modal Focus Trap** | `Tab` / `Shift+Tab` | When a modal is active (e.g., QuestComposer or LevelUpModal), focus cycles strictly within the modal; background is inert. |
| **Category & Armory Tabs** | `ArrowLeft` / `ArrowRight` | Navigates between tab items (`role="tablist"`). `Enter` or `Space` selects active tab. |
| **Difficulty Segmented Control** | `ArrowLeft` / `ArrowRight` | Adjusts selected difficulty tier (Easy, Medium, Hard, Epic). |
| **Quick Actions (Shortcuts)** | `N` (Dashboard only) | Opens Quest Composer modal directly when not focused inside a text input. |

---

## 3. Visible Focus Indicators

Default browser outlines (`outline: none`) are strictly forbidden unless replaced by our dedicated high-contrast focus ring:

```css
/* Accessible High-Contrast Focus Ring */
:focus-visible {
  outline: 2px solid var(--border-focus, #38bdf8);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.25);
}
```

*Rule*: All interactive controls (buttons, links, inputs, checkboxes, tabs) display this focus ring upon keyboard focus.

---

## 4. Semantic HTML & ARIA Implementation

### A. Quest Checkbox
```html
<button
  type="button"
  role="checkbox"
  aria-checked="false"
  aria-label="Mark Study React Hooks quest complete"
  id="quest-check-1"
  class="quest-checkbox-btn"
>
  <svg aria-hidden="true" class="check-icon">...</svg>
</button>
```

### B. XP & Attribute Progress Bars
```html
<div
  role="progressbar"
  aria-valuenow="1840"
  aria-valuemin="0"
  aria-valuemax="2400"
  aria-label="Player Level 12 XP Progress: 76%"
  class="xp-progress-bar-track"
>
  <div class="xp-progress-bar-fill" style="width: 76.6%;"></div>
</div>
```

### C. Live Region for Reward Toasts
```html
<!-- Persistent Live Region container in App Shell -->
<div aria-live="polite" aria-atomic="true" class="toast-live-region">
  <!-- Dynamic reward toast mounted upon task completion -->
  <div class="toast-message" role="status">
    Quest Completed: Study React Hooks. Awarded 70 XP and 18 Gold.
  </div>
</div>
```

### D. Level-Up Celebration Dialog
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="levelup-title"
  aria-describedby="levelup-desc"
  class="modal-backdrop"
>
  <div class="modal-dialog">
    <h2 id="levelup-title">LEVEL UP! Reached Level 13</h2>
    <p id="levelup-desc">Your character has unlocked new Armory items and increased attribute limits.</p>
    <button type="button" class="btn-primary" autofocus>Continue Questing</button>
  </div>
</div>
```

### E. Icon-Only Action Buttons
All icon buttons must have an explicit `aria-label`:
```html
<button type="button" aria-label="Edit Quest: Study React Hooks" class="icon-btn">
  <svg aria-hidden="true">...</svg>
</button>
<button type="button" aria-label="Delete Quest: Study React Hooks" class="icon-btn">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## 5. Color Contrast & Visual Accessibility

1. **Text Contrast**:
   - Primary text (`#F8FAFC`) on dark canvas (`#090C10`): Contrast ratio **18.4:1** (Exceeds AAA).
   - Secondary text (`#94A3B8`) on dark surface (`#0F141C`): Contrast ratio **6.8:1** (Exceeds AA).
2. **Never Color Alone**: Status is never communicated by color alone:
   - Quests indicate completion with a visible checkmark icon AND strikethrough text AND status badge.
   - Discipline categories display an icon (e.g. 🧠 for Intellect, ⚔️ for Strength) alongside the color pill.
   - Difficulty tiers display clear text labels ("Easy", "Medium", "Hard", "Epic").

---

## 6. Motion & Vestibular Safety (`prefers-reduced-motion`)

Players with vestibular disorders or motion sensitivities must have a calm, accessible experience:
- When `prefers-reduced-motion: reduce` is detected:
  - Particle bursts (confetti, sparks, embers) are disabled.
  - Floating reward text (`+70 XP`) does not translate vertically; it appears in-place and fades gently.
  - Progress bar animations fill instantly without spring oscillation.
  - Modals fade in with simple opacity transitions without zoom/scaling effects.

---

## 7. Form Accessibility Checklist

- [x] Every form field has an explicit `<label htmlFor="...">` tag.
- [x] Required inputs contain `aria-required="true"`.
- [x] Inline errors are programmatically associated with inputs via `aria-describedby="input-error-id"`.
- [x] Inputs do not rely on placeholder text as the only label.
- [x] Forms support `Enter` to submit and `Escape` to cancel.
