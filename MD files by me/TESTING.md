# Testing Strategy

## Required tests

### Auth
- register
- duplicate email
- login success/failure
- logout
- protected endpoint
- session persistence

### Task CRUD
- create
- read own tasks
- cannot read another user's task
- update own task
- cannot update another user's task
- delete own task
- cannot delete another user's task

### Completion
- complete task
- duplicate completion blocked
- rewards persisted
- completion history created

### RPG
- thresholds increase
- exact threshold behavior
- level-up
- multi-level jump
- XP progress calculation

### Streak
- first activity
- same-day repeat
- consecutive day
- missed day
- best streak

### Attributes
- category mapping
- attribute reward
- invalid category rejection

### Economy
- sufficient Gold purchase
- insufficient Gold
- duplicate ownership rules
- balance transaction
- inventory persistence

### Frontend
- task creation
- completion feedback
- error states
- loading states
- responsive layout

### Accessibility
- keyboard navigation
- focus order
- labels
- dialog semantics
- reduced motion

### SEO
- metadata
- canonical
- robots
- sitemap
- structured data
- noindex private pages

## Critical E2E flow

```text
register
→ create task
→ complete task
→ see XP
→ refresh
→ still see updated character
→ open history
→ open shop
→ purchase item
→ refresh
→ item remains owned
```

This flow directly supports the required walkthrough-video proof of persistence. fileciteturn2file0L44-L46

## Chaos/edge cases

Test:
- slow API
- API 500
- expired session
- double click complete
- network disconnect after click
- empty task
- very long title
- malicious text
- insufficient currency
- invalid purchase ID
- repeated purchase request

## Release gate

No release when:
- console has uncaught errors
- production API is disconnected
- data disappears on refresh
- critical keyboard path is broken
- any user can mutate another user's data
- required feature is incomplete
