# Environment

## Frontend

```text
VITE_API_URL
VITE_PUBLIC_APP_URL
```

## Backend

```text
PORT
DATABASE_URL
SESSION_SECRET
FRONTEND_ORIGIN
NODE_ENV
```

## Rules

- `.env` is never committed.
- `.env.example` is committed.
- variable names stay stable.
- development and production values are separate.

## Example

```env
VITE_API_URL=http://localhost:3000/api
VITE_PUBLIC_APP_URL=http://localhost:5173
```

Backend:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/liferpg
SESSION_SECRET=replace_me_with_a_long_random_secret
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
```
