# Life RPG — Vercel Deployment Guide

This repository is configured to deploy directly to **Vercel** with full-stack support (React Vite Frontend + Serverless Express API).

---

## ⚡ Architecture on Vercel

* **Frontend**: React 19 + Vite app compiled to `frontend/dist` and served globally via Vercel Edge Network with client-side SPA routing (`vercel.json`).
* **Backend API**: Express + Prisma app served through Vercel Serverless Functions (`api/index.ts`). All requests to `/api/*` route directly to the backend.
* **Same-Origin Benefits**: Since frontend and API share the exact same domain, cookies and sessions work seamlessly with zero CORS configuration headaches.

---

## 🗄️ Step 1: Get a Free Cloud PostgreSQL Database

Because Vercel serverless functions are stateless, you need a hosted PostgreSQL database. Any of these take less than 1 minute to create for free:

1. **[Neon.tech](https://neon.tech/) (Recommended)**:
   - Create a free account and click **Create Project**.
   - Copy the connection string (e.g. `postgresql://alex:abc123@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`).
2. **[Supabase](https://supabase.com/)**:
   - Create a free project -> Settings -> Database -> Connection string (URI).
3. **Vercel Postgres**:
   - In your Vercel project, go to the **Storage** tab and create a **Postgres** store.

---

## 🚀 Step 2: Deploy to Vercel

1. Push your latest code to GitHub:
   ```powershell
   git push origin pre-merge
   ```
2. Open your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
3. Import your **`hackathonmain404-beep/RPG-task`** repository.
4. Set the **Branch** to `pre-merge` (or `main` if merged).
5. Leave **Root Directory** as `./` (default).
6. Under **Environment Variables**, add the following:

| Variable Name | Example Value / Description |
| :--- | :--- |
| `DATABASE_URL` | Your hosted Postgres URL from Neon/Supabase (with SSL) |
| `JWT_SECRET` | Any secure random string (minimum 32 characters) |
| `SESSION_SECRET` | Any secure random string (minimum 32 characters) |
| `NODE_ENV` | `production` |

7. Click **Deploy**!

---

## 🌱 Step 3: Initialize Database Tables & Seed Items

Once your cloud PostgreSQL is created, initialize the schema and populate the default shop items, badges, and themes:

In your local terminal:
```powershell
# Set your production database URL temporarily in your terminal or backend/.env
$env:DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Push schema to the database
npm run db:push

# Seed shop items and badges
npm run seed
```

---

## 🔄 Alternative: Frontend-Only on Vercel (with Render/Railway Backend)

If you prefer to host the Express backend on **Render**, **Railway**, or **Fly.io**:

1. Deploy the `backend/` folder to Render/Railway as a Web Service.
2. In Vercel Project Settings for the frontend:
   - Set **Root Directory** to `frontend`.
   - Add environment variable:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api`
3. The included [`frontend/vercel.json`](file:///frontend/vercel.json) handles client-side routing automatically.

---

## 🔍 Verification & Health Check

After deployment, test your live app:
* **Live Health Check**: `https://your-app.vercel.app/api/health` (should return `{ "status": "healthy", "database": "connected" }`)
* **Registration & Login**: Create a new player account and verify character creation.
* **Quest Creation & Level Up**: Add and complete a quest to verify state updates and database persistence.
