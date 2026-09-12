# User Flows

## Public flow

```text
Landing
 ↓
Learn the idea
 ↓
See game-like demo
 ↓
Sign Up
 ↓
Character creation/onboarding
 ↓
Dashboard
```

## Authenticated first-use flow

```text
Sign Up/Login
 ↓
Choose display name
 ↓
Choose starter theme/cosmetic
 ↓
Dashboard
 ↓
Create Quest
```

## Core completion flow

```text
Dashboard
 ↓
Create Quest
 ↓
Choose category
 ↓
Choose difficulty
 ↓
Save
 ↓
Complete Quest
 ↓
Server transaction
 ↓
XP + Gold + Attribute update
 ↓
Streak update
 ↓
Level check
 ↓
Celebration
 ↓
Activity log
```

## Shop flow

```text
Shop
 ↓
View item
 ↓
See price
 ↓
Purchase
 ↓
Server validates balance
 ↓
Gold deducted
 ↓
Inventory updated
 ↓
Equip
```

## Persistence proof

The demo must include:

```text
complete task
 ↓
show XP
 ↓
refresh browser
 ↓
data remains
```

This is explicitly required in the walkthrough video.

## Error flows

### Empty task
Show inline validation.

### Already completed task
Prevent second reward.

### Insufficient Gold
Explain remaining amount.

### Network failure
Preserve unsaved client form state where practical and offer retry.

### Session expiry
Redirect to login with a useful message.

### Backend failure
Show non-destructive error UI.

## Keyboard flow

A keyboard-only user must be able to:
- navigate
- open/create task
- submit forms
- complete task
- open shop
- purchase/equip item
- close dialogs
