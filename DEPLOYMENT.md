# 🚀 FitMentor AI — Production Deployment Guide

FitMentor AI is built with a **production-ready full-stack architecture** (React 18 + Vite frontend, Node.js + Express TypeScript backend, PostgreSQL 16 database).

The app supports two flexible deployment architectures:
1. **Unified Full-Stack Deployment (Recommended)**: Express runs API routes (`/api/*`, `/health`) and serves the compiled React SPA from a single port/service.
2. **Split Cloud Deployment**: React frontend hosted on Vercel/Netlify, while Express API is hosted on Render/Railway connected to a managed PostgreSQL database (Neon/Supabase/AWS RDS).

---

## 📋 Pre-Flight Checklist

Before deploying, verify your local build and test suites pass:

```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Build both backend and frontend bundles
npm run build

# 3. Run all test suites (progression + adaptive training engine)
npm test
```

All 30 automated tests must pass.

---

## 🌟 Option 1: 1-Click Render Deployment (Recommended)

Render can deploy the complete stack using the included `render.yaml` Blueprint.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your `FitMentorAI` repository.
5. Render detects `render.yaml` and provisions:
   - **PostgreSQL Database** (`fitmentor-db`)
   - **Web Service** (`fitmentor-ai`) running Node.js
   - Environment variables (`DATABASE_URL`, auto-generated `JWT_SECRET`, `NODE_ENV=production`)
6. Click **Apply**.
7. Once build completes, open your live Render URL (e.g. `https://fitmentor-ai.onrender.com`).

> **Note on Migrations**: On container start, `backend/src/config/migrate.ts` automatically applies all SQL migrations (`001` through `005`) and seed data (`001` through `003`).

---

## 🐳 Option 2: Docker & Docker Compose (VPS / DigitalOcean / AWS EC2)

FitMentor includes a multi-stage production `Dockerfile` and `docker-compose.yml`.

### Quick Start with Docker Compose:

1. Clone repository to your server:
   ```bash
   git clone <your-repo-url>
   cd FitMentorAI
   ```

2. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to set your desired `JWT_SECRET` and passwords.

3. Launch services:
   ```bash
   docker compose up -d --build
   ```

4. Verify services:
   ```bash
   # Check container status
   docker compose ps

   # Check application logs
   docker compose logs -f app

   # Verify health check
   curl http://localhost:5000/health
   ```

5. Access FitMentor at `http://<your-server-ip>:5000`.

---

## 🚂 Option 3: Railway Deployment

1. Go to [Railway.app](https://railway.app/) and create a **New Project**.
2. Click **Deploy from GitHub repo** and select `FitMentorAI`.
3. Add a **PostgreSQL** database service in Railway.
4. In your FitMentor service settings:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/health`
5. In **Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `DB_SSL`: `true`
   - `JWT_SECRET`: `<generate-a-random-string>`
   - `CORS_ORIGIN`: `*`
6. Click **Deploy**. Railway will build the app and assign a public domain.

---

## ⚡ Option 4: Split Cloud Deployment (Vercel + Render / Neon)

For teams wanting edge CDN hosting for the frontend with an isolated backend API.

### Step 1: Deploy Backend & Database (e.g. Render, Railway, or Fly.io)
- **Root Directory**: `backend` (or use repo root with `npm run build:backend` / `npm run start:backend`)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/fitmentor_db?sslmode=require`
  - `DB_SSL`: `true`
  - `JWT_SECRET`: `<your-secure-jwt-secret>`
  - `CORS_ORIGIN`: `https://your-app.vercel.app`

### Step 2: Deploy Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**.
6. SPA routing is automatically handled by `frontend/vercel.json`.

---

## 🔐 Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Yes | `development` | Set to `production` in live environments |
| `PORT` | No | `5000` | Port for the Express server to listen on |
| `DATABASE_URL` | Recommended | — | Full PostgreSQL connection URI |
| `DB_SSL` | No | auto-detected | Set to `true` for cloud DBs (Supabase, Neon, Render) |
| `DB_HOST` | Fallback | `localhost` | Database host (used if `DATABASE_URL` unset) |
| `DB_PORT` | Fallback | `5432` | Database port |
| `DB_NAME` | Fallback | `fitmentor_db` | Database name |
| `DB_USER` | Fallback | `fitmentor_admin` | Database username |
| `DB_PASSWORD` | Fallback | — | Database password |
| `JWT_SECRET` | Yes | — | Secret key for signing authentication tokens |
| `JWT_EXPIRES_IN`| No | `7d` | Token expiry duration |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated or `*`) |
| `VITE_API_BASE_URL` | Frontend | `/api` | Base API URL for frontend HTTP requests |
| `GEMINI_API_KEY` | Optional | — | Google Gemini API key for AI Coach features |

---

## 🔍 Health Check & Troubleshooting

- **Server Health**:
  ```bash
  curl https://<your-domain>/health
  # Response: {"status":"ok","service":"FitMentor AI API","uptime":...,"timestamp":"..."}
  ```
- **API Health**:
  ```bash
  curl https://<your-domain>/api/health
  # Response: {"status":"healthy",...}
  ```
- **Database Connection**: Check container logs for `✅ PostgreSQL database connection established successfully.` If database is temporarily down or not yet configured, the server gracefully runs with in-memory fallback models without crashing.

