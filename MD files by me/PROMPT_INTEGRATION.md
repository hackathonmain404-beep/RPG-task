# Integration Agent Prompt

Act as the senior integration engineer.

Read all specification files.

Inspect all four workstreams.

Integrate without broad rewrites.

Verify:

```text
Auth
 ↓
Dashboard
 ↓
Create Quest
 ↓
Complete Quest
 ↓
Server reward transaction
 ↓
XP + Gold + Attribute
 ↓
Streak
 ↓
Level calculation
 ↓
Persistence
 ↓
Refresh
 ↓
Shop
 ↓
Purchase
 ↓
Inventory
```

Check that frontend does not calculate authoritative rewards.

Check:
- API response contracts
- session handling
- DB ownership
- transaction boundaries
- duplicate completion
- duplicate purchase
- error responses
- mobile state
- no console crashes

Run full build/tests.

Classify:
P0 = release blocker
P1 = major defect
P2 = polish

Fix P0 first.

Do not add major new features.
