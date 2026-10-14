# ArtiSight 2.0 — Comprehensive Audit Report

## 1. Executive Summary

This audit evaluates the codebase, architecture, live deployment, and public claims for **ArtiSight — AI Photo Critique Assistant** across its primary repository (`ArtiSight`), deployed web application (`https://artisight.netlify.app/`), and personal portfolio case study (`3D-Portfolio` / `https://vdevisricharan.netlify.app/project/artisight`).

The objective is to establish ground truth regarding what is genuinely implemented, what is partially implemented or broken, what was promised but never built, and what actions are required to transform ArtiSight into a production-grade, technically honest Applied AI application.

---

## 2. Source Code Audit

### 2.1 Frontend Architecture (`artisight/`)
- **Framework & Tooling**: React 18 with Vite 6, Tailwind CSS 3, Redux Toolkit 2, React Router 6.
- **Upload Workflow (`Uploading.jsx`)**:
  - Employs a synthetic progress timer (`simulateFileUpload` increments progress with `Math.random() * 15` via `setInterval`) rather than reporting genuine network transfer or backend processing phases.
  - File validation checks MIME type (`image/png`, `image/jpeg`, `image/webp`) and enforces a 10MB limit in the frontend, whereas the backend configuration allows 16MB and additional formats (`gif`, `bmp`).
  - No client-side image compression was implemented despite portfolio claims of "Client-side image preview & compression in React".
  - Submits to `POST /upload` with multipart `file`.
- **Critique & Results Visualization (`Feedback.jsx`, `Resources.jsx`)**:
  - The UI expects a single unstructured markdown string from `/upload` and renders it via `ReactMarkdown`.
  - Suggestions require a secondary user action ("Get AI Suggestions"), sending a second LLM request to `POST /suggest`.
  - Resource fetching triggers a third LLM request (`build_search_queries`) inside `POST /resources` followed by Google Custom Search JSON API calls.
  - No numerical scores, category radar/bar charts, EXIF metadata panels, or visual composition overlays exist in the frontend.
  - When the user refreshes `/feedback`, transient Redux state is wiped, showing a fallback screen and forcing the user to re-upload.
- **Landing Page (`Home.jsx`, `JoinCommunitySection.jsx`)**:
  - Contains misleading claims: "26+ photographers" illustrated with photos of prominent Indian cinematographers (P.C. Sreeram, K.K. Senthil Kumar, Ravi Varman, etc.) and copy asserting "Join thousands of shutterbugs".
  - Empty or unlinked social footer items.
  - "Bob is Working His Magic ✨" placeholder text during resource loading.

### 2.2 Backend Architecture (`backend/`)
- **Framework & Structure**: Single monolithic `app.py` (715 lines) containing Flask routes, Gemini API calls, Custom Search API calls, and commented-out scratch scripts.
- **Gemini Model Configuration**:
  - Specified `GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"`, which is an older preview model identifier. The current production model is `gemini-2.5-flash`.
  - The API key in `backend/.env` returned HTTP 403 (`CONSUMER_SUSPENDED`). A valid working key was found in the developer's project environment.
- **Google Custom Search**:
  - Strictly required on startup in `required_env_vars`. Missing keys cause `RuntimeError`, crashing the server and preventing `/health` from functioning.
  - Live query tests against Google Custom Search returned HTTP 403 ("This project does not have the access to Custom Search JSON API."). Without a fallback, `/resources` completely fails.
- **Computer Vision & Metadata**:
  - `cv2` (OpenCV) was not installed or listed in `requirements.txt`. Zero OpenCV analysis functions exist.
  - EXIF metadata was never extracted or processed.
  - BLIP-2 has 0 lines of implementation in the codebase.
- **Production Server & Containerization**:
  - `backend/Dockerfile` runs `CMD ["python", "app.py"]` (Flask built-in development server) instead of `gunicorn`.
  - `docker-compose.yml` maps port `80:80` for the frontend while README states `5173`. No environment variables or `.env` files are passed to containers.

---

## 3. Live Application Audit

- **Frontend URL**: `https://artisight.netlify.app/`
  - Loads index bundle (`index-CCmZRvfm.js`).
  - Analysis of bundle reveals hardcoded API target: `https://artisight.onrender.com`.
- **Backend URL**: `https://artisight.onrender.com`
  - HTTP requests to `https://artisight.onrender.com/health` consistently time out (>60s). The service on Render free tier is inactive, suspended, or failing to start.
  - The live Netlify application is therefore incapable of completing image critiques for public visitors.
- **Portfolio Case Study URL**: `https://vdevisricharan.netlify.app/project/artisight`
  - Describes a structured evaluation rubric (composition, lighting, depth of field, color harmony), sub-4s turnaround, client-side compression, and OpenCV/BLIP-2/EXIF pipelines that did not match the running code.

---

## 4. Claims-versus-Implementation Matrix

| Claim | Source | Implementation Evidence | Live Test | Status | Required Action |
|---|---|---|---|---|---|
| Multimodal AI critique | Portfolio / README / Paper | `backend/app.py:184` (`upload_file`) | Fail (Backend down) / Local: Partial | Implemented but unstructured | Refactor to `gemini-2.5-flash` with structured Pydantic schema contract. |
| Structured rubric scores (0–10) | Portfolio case study | None (Raw Markdown text only) | Fail (No scores exist) | Missing but explicitly promised | Implement 6-dimension rubric (Composition, Lighting, Focus, Color, Storytelling, Overall) in backend & frontend. |
| Client-side image compression | Portfolio case study | None in `Uploading.jsx` (Raw file sent) | Fail | Missing but explicitly promised | Implement canvas-based image resizing and compression preserving analysis fidelity. |
| Real upload progress | UI claim | `simulateFileUpload` with `Math.random()` | Fail (Artificial simulation) | Implemented but fake | Replace fake timer with real axios `onUploadProgress` and stage indicators. |
| OpenCV image analysis | Portfolio README / Architecture | Not in `requirements.txt` or code | Fail (0 lines) | Missing but explicitly promised | Implement deterministic OpenCV module (histograms, brightness, contrast, clipping, sharpness). |
| EXIF metadata extraction | Portfolio README / Architecture | None in code | Fail (0 lines) | Missing but explicitly promised | Implement Pillow/EXIF extraction (camera, lens, ISO, aperture, shutter speed) with GPS sanitization. |
| Composition visual overlays | Portfolio UI / Features | None in `Feedback.jsx` | Fail (0 lines) | Missing but explicitly promised | Implement interactive Rule of Thirds, Center, and Diagonal grid overlays on preview. |
| BLIP-2 secondary model | Portfolio README / Architecture | None in code | Fail (0 lines) | Unsupported claim | Evaluate trade-offs: drop BLIP-2 due to latency/memory cost, document rationale honestly, remove claim. |
| Personalized learning recommendations | Website / Paper | `app.py:500` (`get_resources`) | Fail (Google CSE 403) | Implemented but broken | Provide verified photography learning database fallback when Google CSE is 403 or unavailable. |
| Sub-4s end-to-end turnaround | Portfolio case study | No benchmark artifact | Unmeasured | Unsupported claim | Benchmark actual pipeline; report honest p50/p95 latency and cold-start expectations. |
| "26+ photographers" / Community | Landing page | Hardcoded Indian DP portraits | Misleading | Unsupported or misleading claim | Remove fake community numbers and celebrity photos; replace with clean product showcase. |
| Clean modular architecture | README | Monolithic 715-line `app.py` | Working locally | Partially implemented | Modularize into `backend/app/services`, `schemas`, `api`. |
| Production Docker setup | `docker-compose.yml` | Port mismatch (80 vs 5173), no gunicorn | Fail | Implemented but broken | Update `docker-compose.yml`, Dockerfiles with gunicorn and proper ports. |

---

## 5. Classification of Findings

1. **Implemented and Verified**:
   - React + Vite + Tailwind frontend base build passes (`npm run build`).
   - Gemini 2.5 Flash multimodal vision inference is verified working locally with active credentials.
2. **Implemented but Broken**:
   - Live backend (`https://artisight.onrender.com`) is unreachable / timed out.
   - Google Custom Search API integration fails with 403 due to missing API enablement / quotas.
   - Backend environment variable verification crashes process if search keys are absent.
3. **Partially Implemented**:
   - Single-endpoint text critique exists, but lacks structured output, schema validation, scores, and error recovery.
   - Upload UI exists, but progress bar is driven by random timer instead of genuine network/processing stages.
4. **Missing but Explicitly Promised**:
   - Structured numerical category scoring (Composition, Lighting, Focus, Color, Storytelling, Overall).
   - OpenCV technical image metrics (sharpness, exposure histogram, clipping).
   - EXIF camera/lens metadata extraction.
   - Interactive composition overlays (Rule of Thirds, Center, Diagonals).
   - Client-side image pre-processing / compression before upload.
5. **Unsupported or Misleading Claims**:
   - BLIP-2 model integration (non-existent).
   - Sub-4s latency benchmark (unmeasured).
   - Cinematographer community portraits / "thousands of shutterbugs".
