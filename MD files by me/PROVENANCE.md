# Data Provenance and Auditability

Every meaningful progression mutation must have a traceable origin.

## Completion event

Record:
- userId
- taskId
- completedAt
- XP awarded
- Gold awarded
- attribute change
- streak after
- level before/after

## Purchase event

Record:
- userId
- itemId
- server-resolved price
- purchase time

## Why

This supports:
- debugging
- anti-cheat analysis
- activity history
- transparent progression
- reliable demos

## Client claims are never provenance

A client request saying:

```json
{"xp": 10000}
```

must not become a trusted history record.
