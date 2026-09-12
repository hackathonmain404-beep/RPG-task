# BACKEND DEPLOYMENT SPECIFICATION

**Canonical Authority:** Backend Branch  
**Target Environments:** Render, Railway, Neon/Supabase PostgreSQL

---

## 1. Zero-Tolerance Deployment Rules (From Hackathon Criteria)

Submissions will receive an immediate score of zero if:
1. The live app crashes on load.
2. The backend API fails to connect to the database in production.
3. The deployment link is inaccessible or broken.

To eliminate these risks, deployment builds must execute automated pre-flight database connection tests.

---

## 2. Recommended Production Stack

- **Application Hosting:** Render Web Service or Railway App.
- **Database:** Supabase PostgreSQL or Neon Serverless PostgreSQL.
- **Node Runtime:** Node.js 20 LTS.

---

## 3. Deployment Build & Start Pipeline

### Build Command
```bash
npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Database Seeding (Post-Deploy / Release Phase)
```bash
npx ts-node prisma/seed.ts
```

### Start Command
```bash
npm run start
```
*(Executes `node dist/src/server.js`)*

---

## 4. Production Checklist

- [ ] `DATABASE_URL` configured in hosting provider dashboard.
- [ ] `JWT_SECRET` generated (random 64-character hex).
- [ ] `NODE_ENV=production`.
- [ ] `FRONTEND_URL` set to the live deployed frontend domain.
- [ ] `GET /api/health` returns `200 OK` with `"database": { "status": "connected" }`.
- [ ] CORS permits credentials/headers from `FRONTEND_URL`.
