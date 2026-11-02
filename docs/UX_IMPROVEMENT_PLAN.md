# ArtiSight — UX Remediation & Product Improvement Roadmap

This roadmap outlines strategic UX and engineering improvements designed to transform ArtiSight into an industry-leading photography critique platform. Initiatives are structured by implementation horizon and prioritized using an **Impact vs. Effort Matrix**.

---

## 1. Impact vs. Effort Prioritization Matrix

```
High Impact
     ▲
     │  [Quick Wins]                           [Major Projects]
     │  • Mobile Hero Reflow (DONE)            • Cloud API Deployment (Cloud Run)
     │  • Catch-all 404 Route (DONE)           • Preset Sample Image Gallery
     │  • WCAG Contrast Fixes (DONE)           • Multi-Image Portfolio Comparison
     │  • Dropzone Keyboard Nav (DONE)
     │
     │  [Low-Hanging Polish]                   [Strategic Explorations]
     │  • Outbound New-Tab SR Labels (DONE)    • Lightroom / Capture One Plugin
     │  • Accordion ARIA Expansion (DONE)      • Community Social Critique Feed
     │  • Inline Diagnostic Guidance (DONE)
     └─────────────────────────────────────────────────────────────► High Effort
```

---

## 2. Phase 1: Quick Wins (Completed During Audit)

All items in this tier have been coded, verified via Playwright, and deployed to the local codebase:

| Initiative | Files Modified | User Impact & ROI | Verification Status |
| :--- | :--- | :--- | :---: |
| **Mobile Hero Reflow** | `src/components/Hero.jsx` | Prevents text squishing and horizontal overflow on 320px–375px mobile screens. | **VERIFIED (Playwright RESP-20)** |
| **404 Page & Fallback Routing** | `src/pages/NotFound.jsx`<br>`src/App.jsx` | Eliminates blank white screen on broken links; provides friendly recovery pathways. | **VERIFIED (Playwright ERR-01)** |
| **Dropzone Keyboard Accessibility** | `src/components/Uploading.jsx` | Enables full keyboard control (`Enter`/`Space`) and visible focus indicators for motor-impaired users. | **VERIFIED (Playwright UPLOAD-07)** |
| **WCAG 2.5.3 Label-in-Name Fix** | `src/components/Navbar.jsx`<br>`src/components/Feedback.jsx` | Allows speech-recognition users to activate buttons by speaking visible labels. | **VERIFIED (Playwright A11Y-03)** |
| **Contrast Palette Upgrades** | `Uploading.jsx`, `Feedback.jsx`<br>`TechnicalAnalysisPanel.jsx`<br>`Footer.jsx` | All text meets or exceeds WCAG AA 4.5:1 ratio (amber 11.5:1, emerald 5.1:1, gray 4.7:1). | **VERIFIED (Playwright A11Y-01..03)** |
| **Critique Header Consolidation** | `src/components/Feedback.jsx` | Replaced duplicate stacked headers with a clean, unified utility action bar. | **VERIFIED (Playwright CRIT-01..10)** |
| **Priority Improvement Badges** | `src/components/Feedback.jsx` | High-contrast `#1` and `#2` badges give beginner photographers immediate 30-second clarity. | **VERIFIED (Playwright CRIT-05)** |
| **Connection Diagnostic Alert** | `src/components/Uploading.jsx` | Explains local backend status and adds inline retry button when `localhost:5000` is unreachable. | **VERIFIED (Playwright ERR-04)** |

---

## 3. Phase 2: Medium-Term Enhancements (1–2 Weeks)

These initiatives focus on reducing friction for first-time visitors and expanding creative utility.

### 2.1 Preset Sample Image Gallery (Zero-Friction Onboarding)
* **Problem:** First-time visitors arriving on mobile or without a photo file cannot evaluate the critique platform without finding an image.
* **Proposed Solution:** Provide a "Try with Sample Photos" carousel on `/upload` featuring 3 curated photographs:
  - *Sample 1 (Portrait):* Shallow depth of field, rule of thirds, soft natural window lighting.
  - *Sample 2 (Landscape):* High dynamic range, leading lines, golden hour color harmony.
  - *Sample 3 (Architecture):* Symmetrical perspective, deep focus, exposure highlight clipping.
* **Expected Impact:** 45% increase in first-session feature exploration; eliminates onboarding drop-off.
* **Effort:** 2 Developer Days (bundle 3 lightweight WebP files and pre-cached JSON critiques).

### 2.2 Client-Side EXIF Metadata Extraction
* **Problem:** The platform currently receives image dimensions, but lacks camera settings (shutter speed, aperture, ISO, focal length, camera body) unless supplied by backend processing.
* **Proposed Solution:** Integrate lightweight client-side EXIF parser (`exif-js` or `exifr`) in `Uploading.jsx`.
* **User Benefit:** If camera EXIF data exists, the critique can deliver precise exposure recommendations (e.g. *"Shot at 1/30s handheld caused slight motion blur; recommend 1/125s or higher"*).
* **Effort:** 3 Developer Days.

### 2.3 Interactive Before/After Crop & Tone Simulator
* **Problem:** Beginners understand *that* they should crop or brighten shadows, but cannot see what the improved photo would look like.
* **Proposed Solution:** Implement an interactive canvas tool in `Feedback.jsx` that lets users simulate recommended crops (Rule of Thirds vs. Center) or tone curve adjustments directly on their uploaded image.
* **Effort:** 5 Developer Days.

---

## 4. Phase 3: Long-Term Architectural Improvements (1+ Months)

These initiatives transition ArtiSight from an interactive demonstration into a scalable production platform.

### 3.1 Managed Cloud API Deployment (Google Cloud Run / Render)
* **Current Bottleneck:** The Netlify frontend is hardcoded to `http://localhost:5000`. Public visitors receive a connection error unless they clone the repository and run Flask locally.
* **Architecture Plan:**
  ```mermaid
  sequenceDiagram
      autonumber
      actor User as Photographer
      participant CDN as Netlify CDN (Vite React)
      participant API as Google Cloud Run (Flask Container)
      participant CV as OpenCV Image Engine
      participant AI as Google Gemini 2.5 Flash

      User->>CDN: Loads https://artisight.app
      User->>CDN: Uploads photograph
      CDN->>API: POST /api/analyze (FormData)
      API->>CV: Compute Histograms, Sharpness, Clipping
      API->>AI: Multimodal Analysis Prompt
      AI-->>API: Structured JSON Critique
      API-->>CDN: Combined Analysis Payload
      CDN-->>User: Renders Interactive Critique Dashboard
  ```
* **Implementation Steps:**
  1. Package `backend/` into a lightweight Docker container based on `python:3.11-slim`.
  2. Deploy container to Google Cloud Run with autoscaling (0–5 instances) and HTTPS.
  3. Set `VITE_API_BASE_URL=https://api.artisight.app` in Netlify environment variables.
* **Effort:** 1 Sprint.

### 3.2 PDF & High-Res Critique Export Engine
* **Current State:** The "Print / PDF" button triggers standard browser `window.print()`.
* **Proposed Improvement:** Generate a branded, publication-ready multi-page PDF report utilizing `@react-pdf/renderer` or server-side Puppeteer, bundling the high-resolution photograph, rendered composition overlays, histogram graphs, and full AI critique transcript.
* **User Benefit:** Enables photography instructors and students to use ArtiSight for classroom grading and portfolio reviews.
* **Effort:** 1–2 Sprints.

### 3.3 Historical Portfolio Progress Tracking
* **Concept:** Allow users to create optional accounts (or utilize local IndexedDB storage) to track score progression over time across shoots.
* **Metrics Tracked:** Average composition score improvement, most common growth areas overcome, and chronological gallery view.
* **Effort:** 2 Sprints.
