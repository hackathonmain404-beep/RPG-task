# ENVIRONMENT VARIABLES SPECIFICATION

**Canonical Authority:** Backend Branch  
**Companion File:** `.env.example`

---

## 1. Required Variables

| Variable | Type | Description | Default / Example |
|---|---|---|---|
| `PORT` | Number | Port on which the Express server listens | `5000` |
| `NODE_ENV` | String | Runtime environment (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | String | PostgreSQL connection string with credentials | `postgresql://postgres:password@localhost:5432/liferpg?schema=public` |
| `JWT_SECRET` | String | Secret key for signing and verifying JSON Web Tokens ($\ge 32$ chars) | `super_secret_jwt_key_at_least_32_characters_long` |
| `JWT_EXPIRES_IN` | String | Token time-to-live string | `7d` |
| `FRONTEND_URL` | String | Allowed origin for Cross-Origin Resource Sharing (CORS) | `http://localhost:3000` |

---

## 2. `.env.example` Template

```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/liferpg?schema=public"

# Authentication
JWT_SECRET="replace_with_a_secure_random_string_32_chars_minimum"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:3000"
```
