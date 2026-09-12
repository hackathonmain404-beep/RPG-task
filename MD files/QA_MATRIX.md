# QA Matrix

## Mandatory smoke test

```text
Register
→ login
→ create quest
→ complete quest
→ XP changes
→ Gold changes
→ attribute changes
→ streak changes
→ level check
→ refresh
→ data persists
→ shop
→ purchase
→ inventory
→ refresh
→ item persists
```

## User isolation

Create User A and User B.

Verify:
- A cannot read B tasks
- A cannot modify B tasks
- A cannot delete B tasks
- A cannot purchase using B's Gold
- A cannot equip B inventory
- A cannot modify B character

## Anti-double-completion

Double click complete.

Expected:
- one completion
- one reward
- one progression event
- second attempt returns `409 TASK_ALREADY_COMPLETED`

## Failure matrix

| Failure | Expected |
|---|---|
| network failure | recoverable UI |
| API 500 | error + retry |
| expired session | re-authentication |
| invalid task | inline validation |
| insufficient Gold | clear error (`409 INSUFFICIENT_GOLD`) |
| duplicate completion | 409 conflict |
| DB unavailable | controlled error, no blank screen |

## Release blockers

Any of:
- blank screen
- auth broken
- persistence broken
- XP exploit
- another user can access data
- production DB disconnected
- keyboard navigation broken in core flow
- required video invalid
- broken live URL
