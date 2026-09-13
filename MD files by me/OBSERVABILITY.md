# Observability

## Development

Check:
- browser console
- backend logs
- database logs
- failed API requests
- unhandled promise rejections

## Production

Log structured events:
- auth failures
- task completion failures
- purchase failures
- DB errors
- unexpected 500s

Do not log:
- passwords
- session secrets
- full auth tokens

## Useful correlation fields

```text
requestId
userId (non-sensitive identifier)
route
eventType
durationMs
status
```

## Client error boundary

Use a top-level error boundary so one unexpected React render error does not present a blank screen.

Provide a recovery action.

## Health endpoint

Expose a minimal:
`GET /api/health`

It must report service availability without exposing secrets.
