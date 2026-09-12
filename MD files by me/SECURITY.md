# Security

The problem explicitly requires secure user-scoped data and backend protection against cheating. fileciteturn2file0L10-L12

## Authentication

- hash passwords with Argon2 or bcrypt
- never store plaintext passwords
- use secure session handling
- rate-limit login/register
- invalidate sessions on logout

## Authorization

Every user-owned operation must derive user identity from the authenticated session.

Never trust:
- userId from the request body
- characterId supplied by client
- arbitrary task owner ID

## Anti-cheat

Never accept client-supplied:
- XP reward
- Gold reward
- level
- attribute totals
- streak number
- inventory ownership

The server calculates all authoritative progression changes.

## Task completion

Server checks:
1. authenticated user
2. task exists
3. task belongs to user
4. task is not already complete
5. reward is computed server-side
6. transaction succeeds

## Economy

Server checks price from DB.

Never accept:
```json
{"price": 1}
```
from the client.

## Input validation

Validate:
- email
- password
- display name
- task title/description
- category
- difficulty
- dates
- purchase IDs

## XSS

Escape/sanitize any user-provided content before rendering as HTML.

Do not use `dangerouslySetInnerHTML` unless absolutely necessary.

## CSRF

If using cookie authentication, implement appropriate CSRF protection depending on architecture/deployment.

## Cookies

Use:
- HttpOnly
- Secure in production
- SameSite appropriate to deployment

## CORS

Allow only intended frontend origin(s).

## Secrets

Never commit:
- DB password
- auth secret
- API keys
- production credentials

Provide `.env.example`.

## Abuse controls

Consider:
- rate limiting
- request body size limits
- completion idempotency
- purchase transaction locking

## Database

Use least-privilege database credentials.

## Logging

Never log:
- passwords
- auth secrets
- full tokens

Log useful operational information without sensitive payloads.
