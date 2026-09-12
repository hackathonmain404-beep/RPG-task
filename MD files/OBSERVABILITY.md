# OBSERVABILITY & HEALTH SPECIFICATION

**Canonical Authority:** Backend Branch  
**Scope:** Health Checks, Logging, Metrics, Diagnostics

---

## 1. Health Endpoints

### Primary Health Check: `GET /api/health`
Used by load balancers, deployment probes (Render, Railway, Kubernetes), and uptime monitors.

- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-12T11:00:00.000Z",
    "uptimeSeconds": 1420,
    "database": {
      "status": "connected",
      "latencyMs": 8
    },
    "version": "1.0.0"
  }
  ```
- **Database Connectivity Probe:**
  Executed via lightweight query: `SELECT 1;` through Prisma. If the database connection is lost or timed out, the endpoint returns `503 Service Unavailable` with `"database": { "status": "disconnected" }`.

---

## 2. Structured Logging

1. **Format:** JSON lines in production, pretty-printed in local development.
2. **Standard Fields:**
   - `timestamp`: ISO-8601 UTC string.
   - `level`: `info`, `warn`, `error`, `debug`.
   - `requestId`: UUID generated per incoming HTTP request.
   - `method`: HTTP method.
   - `url`: Request path.
   - `statusCode`: Response status.
   - `durationMs`: Total request latency.
3. **Data Masking:**  
   Passwords, `Authorization` headers, and sensitive tokens are strictly scrubbed before writing to logs.

---

## 3. Error Tracking Invariants
All unhandled exceptions are caught by `errorHandler.middleware.ts`, logged with full stack traces, and returned to the client as sanitized error payloads:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```
Stack traces are NEVER returned to the client in production mode.
