# Deployment

## Required deliverables

- public GitHub repository
- publicly accessible live URL
- accessible walkthrough video
- detailed README
- `.env.example`

These are explicit deliverables in the problem statement. fileciteturn2file0L38-L46

## Recommended deployment

Frontend:
Vercel or Netlify.

Backend:
Render/Railway/Fly.io.

Database:
Managed PostgreSQL.

## Production environment variables

Example frontend:
```text
VITE_API_URL=
VITE_PUBLIC_APP_URL=
```

Backend:
```text
PORT=
DATABASE_URL=
SESSION_SECRET=
FRONTEND_ORIGIN=
NODE_ENV=production
```

Never commit actual values.

## Production checklist

- database migrated
- backend connected to production DB
- frontend points to production API
- CORS correct
- cookies work
- HTTPS enabled
- public URL works from fresh browser
- refresh on client routes works
- 404 behavior is acceptable
- no development secrets
- no debug endpoints

## Final smoke test

From a clean browser:
- register
- create task
- complete task
- refresh
- log out
- log in
- inspect history
- shop
- purchase
- refresh

## Rollback

Keep the previous production build available until final submission.
