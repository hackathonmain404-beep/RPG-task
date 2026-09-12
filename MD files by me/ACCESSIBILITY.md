# Accessibility

## Required

The problem statement requires full responsiveness and keyboard navigation with Tab, Enter and Space, plus structurally sound screen-reader support. fileciteturn2file0L63-L64

## Rules

Use semantic buttons instead of clickable divs.

All interactive controls must have:
- accessible name
- visible focus
- logical tab order

Forms:
- explicit labels
- inline error associations
- required-state communication

Dialogs:
- focus moves into dialog
- Escape closes where appropriate
- focus returns to trigger

Toasts:
- use appropriate live-region behavior
- do not spam screen readers

Animations:
- respect `prefers-reduced-motion`
- never hide critical state in animation only

Color:
- do not communicate status by color alone.

Keyboard:
- Tab moves predictably.
- Enter/Space activates appropriate controls.
- Arrow keys may be used for specialized widgets only where documented.

Test with:
- keyboard only
- browser accessibility tree
- Lighthouse
- one screen reader if available
