# Frontend Specification

## Responsibility

The Frontend owns presentation, interaction, local UI state, navigation and user experience.

It does NOT own authoritative progression calculations.

## Stack

- React
- TypeScript
- Vite
- React Router
- CSS or Tailwind
- Framer Motion only where useful
- Lucide React or an equivalent icon system

## Frontend owns

- public landing page
- authentication screens
- dashboard
- quest/task UI
- character UI
- XP visualization
- streak visualization
- attribute visualization
- shop UI
- inventory UI
- badges/themes UI
- activity/history UI
- settings UI
- loading states
- empty states
- error states
- accessibility
- responsive behavior
- API client

## Frontend must NOT calculate authoritative

- total XP
- reward Gold
- level
- streak
- attribute totals
- inventory ownership
- purchase price

Frontend only renders values returned by the backend.

## API layer

All HTTP calls must go through a small API client/service layer.

Do not scatter `fetch()` calls through presentation components.

Example:

```text
src/services/api/
  auth.ts
  tasks.ts
  character.ts
  shop.ts
  inventory.ts
```

## State

Keep server state separate from purely visual state.

Examples:

Server state:
- tasks
- character
- inventory
- shop

UI state:
- modal open
- selected filter
- toast visibility
- animation state

## Optimistic updates

Use optimistic UI only when rollback is safe.

For authoritative reward changes, show an immediate interaction state but reconcile the final values with the backend response.

## Accessibility

All actions must be keyboard usable.

Do not use clickable `div` elements when a button/link is appropriate.

Respect `prefers-reduced-motion`.

## Error behavior

Every mutation needs:
- pending state
- success state
- failure state
- retry/recovery where applicable

## UI ownership

Frontend developers may freely improve:
- layout
- animation
- typography
- visual hierarchy

But must not silently alter backend contracts.

## Integration

All API payloads and responses must match `CONTRACT_FRONTEND_BACKEND.md`.

Do not depend on undocumented backend fields.
