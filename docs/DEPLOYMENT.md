# ArtiSight 2.0 — Production Deployment Guide

## 1. Overview

ArtiSight 2.0 consists of:
1. **Frontend**: Static Single Page Application built with React 18, Vite 6, and Tailwind CSS. Hosted on Netlify.
2. **Backend**: Containerized Python 3.11 Flask API running with Gunicorn WSGI. Deployable to Google Cloud Run, Render, Railway, or AWS ECS.

---

## 2. Frontend Deployment (Netlify)

### 2.1 Netlify Build Settings
- **Repository**: `https://github.com/vdevisricharan/ArtiSight`
- **Base directory**: `artisight`
- **Build command**: `npm run build`
- **Publish directory**: `artisight/dist`
- **Node version**: `>= 18.0.0`

### 2.2 Environment Variables (Netlify Dashboard)
| Key | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend-api.com` | Public HTTPS endpoint of the running Flask microservice |

### 2.3 Single-Page Application (SPA) Routing
To prevent HTTP 404 errors when visitors reload `/upload` or `/feedback`, the repository provides both `artisight/public/_redirects` and `artisight/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 3. Backend Deployment (Docker / Cloud Run / Render)

### 3.1 Docker Container Build
The backend includes a production-grade multi-stage `backend/Dockerfile` using Gunicorn:

```bash
cd backend
docker build -t artisight-backend:2.0 .
docker run -p 5000:5000 --env-file .env artisight-backend:2.0
```

### 3.2 Required Environment Variables
| Key | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key (from Google AI Studio) |
| `FLASK_ENV` | No | `production` (default) or `development` |
| `PORT` | No | Server port (default: `5000`) |
| `GOOGLE_API_KEY` | No | Google Custom Search API key (optional; fallback to curated database if omitted) |
| `GOOGLE_CSE_ID` | No | Google Custom Search Engine ID (optional) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `http://localhost:5173,https://artisight.netlify.app`) |

### 3.3 Deploying to Google Cloud Run (Recommended for Low Cost & High Concurrency)
Cloud Run provides automatic HTTPS, zero idle cost (scales to 0 instances), and generous free tier quotas:

```bash
# 1. Build and push container to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/artisight-backend ./backend

# 2. Deploy to Cloud Run with 1GB RAM and 1 vCPU
gcloud run deploy artisight-backend \
  --image gcr.io/YOUR_PROJECT_ID/artisight-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 120s \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,FLASK_ENV=production
```

---

## 4. Local Containerized Orchestration (Docker Compose)

Run the full stack locally with a single command:

```bash
docker-compose up --build
```

- **Frontend**: Accessible at `http://localhost:5173`
- **Backend API**: Accessible at `http://localhost:5000`
- **Swagger Documentation**: Accessible at `http://localhost:5000/apidocs`

---

## 5. Post-Deployment Verification (Smoke Test)

Run the following smoke tests against your deployed backend:

### 1. Health & Readiness Verification
```bash
curl -X GET https://YOUR_BACKEND_URL/health
```
**Expected Response (HTTP 200):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "model": "gemini-2.5-flash",
  "searchProvider": "Curated Photography Knowledge Base",
  "uptimeSeconds": 42.1
}
```

### 2. End-to-End Analysis Verification
```bash
curl -X POST https://YOUR_BACKEND_URL/api/v2/analyze \
  -F "file=@test_photo.jpg"
```
**Expected Response (HTTP 200):**
Valid JSON payload containing `schemaVersion: "2.0"`, `scores`, `cvMetrics`, `exifData`, and `recommendations`.
