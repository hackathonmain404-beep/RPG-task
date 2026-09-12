# Agent Handoff

## Handoff template

```text
TASK
...

FILES CHANGED
...

API CHANGES
...

DB CHANGES
...

TESTS RUN
...

KNOWN RISKS
...

NEXT DEPENDENCY
...
```

## Rules

No agent may silently change:
- API contract
- shared TypeScript contract
- DB schema
- reward formula
- category mapping
- authentication architecture

without updating the relevant spec and notifying the team lead.

## Parallel ownership

Member 1: Web/product integration  
Member 2: Backend/auth/database  
Member 3: RPG/economy/domain logic  
Member 4: UI/UX/SEO/accessibility/QA  

Avoid simultaneous edits to the same foundational files.
