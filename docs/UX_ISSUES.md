# ArtiSight — Prioritized UX & Usability Issue Backlog

This backlog records all defects, heuristic violations, accessibility traps, and usability frictions identified during the comprehensive audit of ArtiSight. Each issue includes reproduction steps, severity ranking, affected standards, remediation details, and acceptance criteria.

---

## Severity Definitions

- **P0 — Blocker:** Prevents primary user journey execution; complete system failure or data loss risk.
- **P1 — Critical:** Major usability obstacle, WCAG Level A violation, layout collapse on supported devices, or dead-end route.
- **P2 — Major:** Significant friction, WCAG Level AA violation, confusing information architecture, or visual clutter.
- **P3 — Minor:** Aesthetic inconsistency, minor contrast defect, polish item, or enhancement recommendation.

---

## Issue Summary

| Issue ID | Severity | Category / Rule | Affected Screen | Summary | Resolution Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **ISS-01** | **P0** | Heuristic 9 / System Status | `/upload` (Netlify Live) | Production build calls `localhost:5000` rather than deployed backend | **Mitigated in Client / Open in Ops** |
| **ISS-02** | **P1** | Heuristic 8 / Responsive | `/` (Landing Hero) | 3-column metric grid severely squished on 320px–375px mobile screens | **RESOLVED** |
| **ISS-03** | **P1** | Heuristic 3 / User Control | `/*` (All Routes) | Undefined URLs rendered empty blank page (`<div id="root"></div>`) | **RESOLVED** |
| **ISS-04** | **P1** | WCAG 2.5.3 (Label in Name) | `/feedback`, Navbar | Visible button text mismatched programmatic `aria-label`s | **RESOLVED** |
| **ISS-05** | **P1** | WCAG 2.1.1 (Keyboard) | `/upload` | File dropzone div had no `tabIndex`, keydown handler, or button role | **RESOLVED** |
| **ISS-06** | **P2** | WCAG 1.4.3 (Contrast) | Global UI | Gray, amber, and emerald text below 4.5:1 minimum contrast | **RESOLVED** |
| **ISS-07** | **P2** | Heuristic 4 / Consistency | `/feedback` | Duplicate headers and competing action bars cluttered critique view | **RESOLVED** |
| **ISS-08** | **P2** | Heuristic 6 / Recognition | `/feedback` | Recommendations lacked clear beginner priority rankings (#1, #2) | **RESOLVED** |
| **ISS-09** | **P2** | WCAG 4.1.2 (Name/Role/Value)| `/feedback` | Composition overlay toggles lacked `aria-pressed` state attributes | **RESOLVED** |
| **ISS-10** | **P3** | WCAG 3.2.5 (Change on Req) | `/`, `/feedback` | Outbound links opened in new tabs without screen-reader notices | **RESOLVED** |

---

## Detailed Issue Specifications

### ISS-01: Production Build Points to `localhost:5000` (Netlify API Disconnect)
* **Severity:** P0 (Blocker for public live demo)
* **Standard:** Nielsen Heuristic 9 (Help users recognize, diagnose, and recover from errors)
* **Affected Screen:** `/upload` (Production bundle on `artisight.netlify.app`)
* **Reproduction Steps:**
  1. Navigate to `https://artisight.netlify.app/upload` without running a local Flask server on your machine.
  2. Select an image and click "Analyze Photograph".
  3. Inspect Browser DevTools Network tab.
* **Actual Behavior:** Browser attempts to `POST http://localhost:5000/api/analyze`, triggering `ERR_CONNECTION_REFUSED`.
* **Expected Behavior:** In production, requests should route to a live cloud-hosted backend (e.g. `https://api.artisight.com/api/analyze`) or gracefully explain that the demonstration requires local server execution.
* **Client-Side Remediation Implemented:**
  - Enhanced error interceptor in `artisight/src/components/Uploading.jsx`.
  - When connection is refused to `localhost:5000`, the UI renders a clear, non-cryptic diagnostic:  
    *"Cannot connect to the ArtiSight analysis backend. Please verify your network connection or ensure the local backend server is running on port 5000 (`python run.py`)."*
  - Renders an inline **"Retry Analysis"** button that re-triggers the call without losing the uploaded file.
* **Operational Action Required:** Deploy `backend/` to a managed cloud container (Render, Cloud Run, or Railway) and set `VITE_API_BASE_URL` in Netlify build environment variables.
* **Status:** Mitigated with robust in-app diagnostics; permanently solved once cloud container is provisioned.

---

### ISS-02: Mobile Viewport Hero Metrics Squished on 320px–375px Screens
* **Severity:** P1 (Critical Responsive Defect)
* **Standard:** Nielsen Heuristic 8 (Aesthetic & Minimalist Design), W3C Mobile Usability
* **Affected Screen:** `/` (Hero section)
* **Reproduction Steps:**
  1. Open Chrome DevTools in device emulation mode at `320 x 568` (iPhone SE).
  2. Navigate to `http://localhost:5173/`.
  3. Inspect the three metric highlights below the hero CTA.
* **Actual Behavior:** Cards were constrained by `grid-cols-3` inside a 238px width container. Each column received ~63px width, causing text strings ("Sub-second Analysis", "Actionable Growth") to overflow by 19px horizontally and wrap into illegible fragments.
* **Expected Behavior:** On small screens (<= 640px), cards should stack vertically in a clean single column.
* **Remediation Implemented:**
  - Updated `artisight/src/components/Hero.jsx`:  
    Replaced `grid-cols-3 gap-6` with `grid-cols-1 sm:grid-cols-3 gap-6`.
* **Verification:** Verified in Playwright test `tests/e2e/responsive.spec.ts` (`RESP-20`). 0px horizontal overflow at 320px width.
* **Status:** **RESOLVED**

---

### ISS-03: Missing 404 Catch-All Route Causing Blank Screen
* **Severity:** P1 (Critical Route Handling)
* **Standard:** Nielsen Heuristic 3 (User Control and Freedom), Heuristic 9
* **Affected Screen:** Any unmapped route (e.g., `/photos`, `/explore`, `/404`)
* **Reproduction Steps:**
  1. Navigate directly to `http://localhost:5173/random-page-name`.
* **Actual Behavior:** React Router encountered unmatched route; rendered empty `<div id="root"></div>` with no navigation, header, or error messaging.
* **Expected Behavior:** Application should render a helpful, branded 404 page with navigation shortcuts back to safety.
* **Remediation Implemented:**
  - Created `artisight/src/pages/NotFound.jsx` with camera viewfinder motif, friendly headline ("Frame Out of View"), and dual CTAs: "Go Back" and "Return Home".
  - Registered `<Route path="*" element={<NotFound />} />` in `artisight/src/App.jsx`.
* **Verification:** Verified in Playwright test `tests/e2e/error-recovery.spec.ts` (`ERR-01`).
* **Status:** **RESOLVED**

---

### ISS-04: WCAG 2.5.3 "Label in Name" Mismatch across Action Buttons
* **Severity:** P1 (Accessibility Violation — WCAG 2.5.3 Level A)
* **Standard:** WCAG 2.5.3 (Label in Name)
* **Affected Screen:** `/feedback`, `/` (Navbar logo)
* **Reproduction Steps:**
  1. Run axe-core accessibility audit against the critique dashboard.
  2. Inspect `<button>` elements for "Copy Report", "Print / PDF", and "New Photo".
* **Actual Behavior:** Visible button text read "Copy Report", but had `aria-label="Copy critique report to clipboard"`. Speech recognition software (e.g. Dragon NaturallySpeaking, Voice Control) failed when users commanded "Click Copy Report".
* **Expected Behavior:** Accessible name must contain the visible label text verbatim.
* **Remediation Implemented:**
  - Removed overriding `aria-label` attributes in `Navbar.jsx` and `Feedback.jsx` where visible text already provides a clear, concise accessible name.
* **Verification:** Verified in Playwright test `tests/e2e/accessibility.spec.ts` (`A11Y-03`). Axe scan returns 0 violations.
* **Status:** **RESOLVED**

---

### ISS-05: Dropzone Keyboard Inaccessibility
* **Severity:** P1 (Accessibility Violation — WCAG 2.1.1 Level A)
* **Standard:** WCAG 2.1.1 (Keyboard), 2.4.7 (Focus Visible)
* **Affected Screen:** `/upload` (Photo Upload Dropzone)
* **Reproduction Steps:**
  1. Navigate to `/upload` using only the keyboard (`Tab` key).
  2. Attempt to select a file without touching the mouse or trackpad.
* **Actual Behavior:** Dropzone container was an un-focusable `<div>` without `tabIndex` or keyboard listeners. Tab key skipped the entire upload zone.
* **Expected Behavior:** Dropzone should receive keyboard focus ring and open the operating system file chooser on `Enter` or `Space`.
* **Remediation Implemented:**
  - Updated `artisight/src/components/Uploading.jsx`:
    - Added `role="button"`
    - Added `tabIndex={0}`
    - Added `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}`
    - Added visible focus ring: `focus:outline-none focus:ring-2 focus:ring-amber-500`.
* **Verification:** Verified in Playwright test `tests/e2e/upload.spec.ts` (`UPLOAD-07`).
* **Status:** **RESOLVED**

---

### ISS-06: Low-Contrast Text Elements Failing WCAG 1.4.3
* **Severity:** P2 (Accessibility Violation — WCAG 1.4.3 Level AA)
* **Standard:** WCAG 1.4.3 (Contrast Minimum)
* **Affected Screen:** Global (`Uploading.jsx`, `Feedback.jsx`, `TechnicalAnalysisPanel.jsx`, `Footer.jsx`)
* **Findings:**
  - Dropzone footnote text: `text-gray-400` (#9ca3af) on white = 2.53:1 (Threshold: 4.5:1)
  - Active composition button: `text-amber-500` (#f59e0b) on white = 2.14:1 (Threshold: 4.5:1)
  - Clipping indicators: `text-emerald-600` (#059669) on `#f8fafc` = 3.61:1 (Threshold: 4.5:1)
  - Footer copyright: `text-slate-500` (#64748b) on `#0f172a` = 3.75:1 (Threshold: 4.5:1)
* **Remediation Implemented:**
  - Upgraded dropzone text to `text-gray-600` (4.72:1).
  - Redesigned active composition button to `bg-slate-900 text-amber-300 border-amber-500` (11.5:1).
  - Upgraded clipping indicators to `text-emerald-700` (5.14:1).
  - Upgraded footer text to `text-slate-400` (5.82:1).
* **Verification:** Verified via axe-core automated tests in `tests/e2e/accessibility.spec.ts`.
* **Status:** **RESOLVED**

---

### ISS-07: Duplicate Headers & Competing Action Bars on Critique Dashboard
* **Severity:** P2 (Information Architecture & Consistency)
* **Standard:** Nielsen Heuristic 4 (Consistency and Standards)
* **Affected Screen:** `/feedback`
* **Reproduction Steps:**
  1. Complete an analysis and observe the top of `/feedback`.
* **Actual Behavior:** Two stacked headers appeared simultaneously: an overarching title block and an inline action bar with repeating "Critique Results" titles and scattered action buttons.
* **Expected Behavior:** Single, cohesive header bar with aligned utility actions.
* **Remediation Implemented:**
  - Consolidated into a unified subheader in `artisight/src/components/Feedback.jsx` featuring clean typography, report date, and three action pills: `Copy Report`, `Print / PDF`, and `New Photo`.
* **Verification:** Verified visually and through Playwright assertions in `tests/e2e/critique.spec.ts`.
* **Status:** **RESOLVED**

---

### ISS-08: Recommendations Lacked Immediate 30-Second Beginner Hierarchy
* **Severity:** P2 (AI Explainability & Usability)
* **Standard:** Nielsen Heuristic 6 (Recognition rather than Recall)
* **Affected Screen:** `/feedback` (Actionable Recommendations)
* **Reproduction Steps:**
  1. Review the "Priority Improvements" card as a beginner photographer.
* **Actual Behavior:** 3 to 4 dense bullet points were displayed with equal visual weight, forcing the user to read all items before deciding where to begin.
* **Expected Behavior:** High-priority items should be ranked sequentially so beginners know their single most impactful next step.
* **Remediation Implemented:**
  - Added high-contrast `#1` and `#2` priority badges (`bg-amber-900 text-white` > 8.7:1 contrast) to the top recommendations in `artisight/src/components/Feedback.jsx`.
* **Verification:** Verified in Playwright test `tests/e2e/critique.spec.ts` (`CRIT-05`).
* **Status:** **RESOLVED**

---

### ISS-09: Missing Screen-Reader State Cues on Overlays and Accordions
* **Severity:** P2 (Accessibility Violation — WCAG 4.1.2 Level A)
* **Standard:** WCAG 4.1.2 (Name, Role, Value)
* **Affected Screen:** `/feedback`
* **Reproduction Steps:**
  1. Inspect composition overlay toggle buttons using screen reader or DOM inspector.
* **Actual Behavior:** Buttons toggled visually, but screen readers announced only "Rule of Thirds, button" without indicating whether the overlay was currently active or inactive.
* **Expected Behavior:** Toggles must announce state using `aria-pressed="true|false"`.
* **Remediation Implemented:**
  - Added `aria-pressed={overlayMode === guide.id}` to all overlay buttons in `artisight/src/components/CompositionOverlay.jsx`.
  - Added `aria-expanded={expandedScore === cat}` to dimension breakdown accordion headers in `artisight/src/components/Feedback.jsx`.
* **Verification:** Verified in Playwright tests `tests/e2e/critique.spec.ts` and `accessibility.spec.ts`.
* **Status:** **RESOLVED**

---

### ISS-10: Outbound Links Lacked New-Window Notices
* **Severity:** P3 (Accessibility Polish)
* **Standard:** WCAG 3.2.5 (Change on Request)
* **Affected Screen:** `/`, `/feedback` (Footer & Recommended Resources)
* **Reproduction Steps:**
  1. Inspect outbound external links to GitHub, Netlify case study, and recommended photography books.
* **Actual Behavior:** Links had `target="_blank"`, but no visual or screen-reader indication warned users they were leaving the page.
* **Expected Behavior:** Links opening new windows should notify users to prevent disorientation.
* **Remediation Implemented:**
  - Appended visually hidden `<span className="sr-only">(opens in new tab)</span>` and external link icons across all target `_blank` anchors in `Footer.jsx` and `Feedback.jsx`.
* **Verification:** Verified in DOM inspection and Playwright `REC-03`.
* **Status:** **RESOLVED**
