# Security Audit Agent Prompt

Audit Life RPG as a hostile user.

Read:
- SECURITY.md
- API_CONTRACT.md
- DATABASE_SCHEMA.md
- TESTING.md

Attempt to:
- read another user's task
- update another user's task
- delete another user's task
- forge XP
- forge Gold
- forge level
- forge streak
- forge attributes
- purchase without sufficient Gold
- purchase with a manipulated price
- repeat task completion
- repeat purchase
- access protected endpoints unauthenticated

Inspect:
- auth/session handling
- cookie flags
- CORS
- request validation
- secrets
- rate limiting
- SQL/ORM safety
- error leakage

Do not exploit beyond the local/test environment.

Return P0/P1/P2 findings and exact remediation.
