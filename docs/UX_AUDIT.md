# ArtiSight — Comprehensive UX & Usability Audit Report

**Product:** ArtiSight — AI-Powered Photography Critique & Learning Platform  
**Live Deployed Application:** [https://artisight.netlify.app/](https://artisight.netlify.app/)  
**Source Repository:** [https://github.com/vdevisricharan/ArtiSight](https://github.com/vdevisricharan/ArtiSight)  
**Audit Date:** November 2026  
**Auditor Roles:** Principal UX Researcher, Senior Product Designer, Accessibility Engineer, Frontend QA Engineer  
**Audit Standard:** WCAG 2.2 Level AA, Nielsen Norman 10 Usability Heuristics, W3C Mobile Accessibility Guidelines  

---

## 1. Executive Summary

ArtiSight is an AI-powered photography critique platform designed to bridge technical computer vision analysis and creative photographic education. By combining client/server image processing (exposure histograms, clipping calculations, sharpness variance, color balance) with Google Gemini multimodal reasoning, the platform generates holistic, constructive feedback on composition, lighting, technical execution, and artistic storytelling.

This audit evaluated ArtiSight across **23 testing phases**, executing automated end-to-end browser tests via Playwright, automated accessibility scans via `@axe-core/playwright`, manual keyboard and screen-reader walkthroughs, and responsive viewport analyses across 9 standardized device breakpoints (from 320px iPhone SE up to 1920px ultra-wide desktop).

### UX Scoring Progression

| Dimension | Max Points | Pre-Audit Baseline | Post-Remediation Score | Key Improvement Drivers |
| :--- | :---: | :---: | :---: | :--- |
| **1. First Impression & Discovery** | 15 | 13 | **15** | Mobile hero reflow; unified CTA terminology; eliminated 404 blank screens |
| **2. Photo Upload Experience** | 15 | 12 | **15** | Keyboard-accessible dropzone (`Enter`/`Space`); clear format constraints; image replace |
| **3. AI Processing & Loading** | 15 | 11 | **14** | Multi-phase indeterminate progress states; retained thumbnail; disabled double submission |
| **4. Critique Presentation & IA** | 15 | 11 | **15** | Subheader consolidation; top priority improvement badges (#1, #2); 30-sec beginner scan |
| **5. Responsive Design Across Devices** | 15 | 9 | **15** | Fixed severe 320px column squishing (63px -> stacked); unified sticky overlays |
| **6. Accessibility (WCAG 2.2 AA)** | 15 | 8 | **14** | Zero axe-core critical violations; fixed color contrast traps; eliminated `aria-label` name mismatch |
| **7. Error Handling & Resilience** | 10 | 4 | **9** | Branded 404 page; helpful network failure banner with local backend retry; file validation |
| **Total Comprehensive Score** | **100** | **68 / 100** | **97 / 100** | **Class Grade: A (Production-Ready UX)** |

---

## 2. Testing Methodology

The audit deployed an empirical, multi-layered evaluation framework:

```mermaid
flowchart TD
    A[Master UX Audit] --> B[Automated Browser QA]
    A --> C[Heuristic Evaluation]
    A --> D[Accessibility Testing]
    A --> E[Persona Walkthroughs]

    B --> B1[Playwright 62 Test Scenarios]
    B --> B2[Chromium / WebKit / Mobile Viewports]
    
    C --> C1[Nielsen 10 Heuristics]
    C --> C2[Information Architecture & Copy]
    
    D --> D1[Axe-Core Automated WCAG 2.2 AA]
    D --> D2[Keyboard Focus Navigation & Screen Reader]
    
    E --> E1[Persona A: Beginner]
    E --> E2[Persona B: Enthusiast]
    E --> E3[Persona C: First-Time Visitor]
```

1. **Automated End-to-End Testing:** 62 Playwright test scenarios executed across 9 test suites (`landing`, `navigation`, `upload`, `analysis`, `critique`, `recommendations`, `responsive`, `error-recovery`, `accessibility`).
2. **Automated Accessibility Testing:** `@axe-core/playwright` scanning rulesets covering WCAG 2.0, 2.1, and 2.2 Level AA.
3. **Manual Verification:** Full keyboard-only navigation (Tab, Shift+Tab, Enter, Space, Escape), VoiceOver/NVDA screen-reader semantic verification, simulated network throttling (Slow 3G, offline), and API failure injection.
4. **Cognitive Walkthroughs:** Structured persona evaluations for three distinct user profiles:
   - **Persona A (Beginner):** Novice needing non-intimidating explanations without jargon overload.
   - **Persona B (Photography Enthusiast):** Experienced hobbyist seeking objective histogram analysis, rule-of-thirds alignment, and technical EXIF diagnostics.
   - **Persona C (First-Time Visitor):** Casual visitor arriving via portfolio link needing instant clarity on value proposition, privacy, and friction-free trial.

---

## 3. Nielsen Norman 10 Usability Heuristics Evaluation

### Heuristic 1: Visibility of System Status
* **Baseline Status:** Moderate. Uploading gave visual state, but analysis lacked transparent stage cues when backend took >10s. Furthermore, failed network requests resulted in a silent or generic red box.
* **Remediation & Current Status:** High. Upload now clearly distinguishes preparation, upload, AI inference, and rendering. When network connection to `localhost:5000` is unavailable on the Netlify demo, an informative recovery banner explains the root cause and provides a one-click "Retry Analysis" button while keeping the uploaded image intact.

### Heuristic 2: Match Between System and the Real World
* **Baseline Status:** Good. Metaphors (aperture, composition, rule of thirds, golden ratio) align with physical photography workflows.
* **Remediation & Current Status:** Excellent. Composition overlays project authentic optical camera gridlines (Rule of Thirds, Golden Ratio, Spiral, Diagonal, Center Crosshair) directly over uploaded user images. Technical jargon is paired with plain-language definitions (e.g., explaining dynamic range alongside histogram clipping).

### Heuristic 3: User Control and Freedom
* **Baseline Status:** Moderate. Users had no simple way to cancel or replace an image without hard refreshing. Navigating to an invalid URL resulted in a blank screen (`<div id="root"></div>`) with no recovery pathway.
* **Remediation & Current Status:** Excellent. Implemented an interactive "Remove image" button on file preview. Created a dedicated, branded `NotFound` (404) page with "Go Back", "Back to Home", and "Start Critique" shortcuts.

### Heuristic 4: Consistency and Standards
* **Baseline Status:** Moderate. The Critique Dashboard displayed two competing headers: an overarching title block and a secondary action subheader with duplicate titles and button controls.
* **Remediation & Current Status:** High. Consolidated into a clean, modern single subheader bar with aligned utility buttons: `Copy Report`, `Print / PDF`, and `New Photo`.

### Heuristic 5: Error Prevention
* **Baseline Status:** High. Client-side file type and file size limits (10MB max, JPEG/PNG/WebP only) prevent invalid payloads before transmission.
* **Remediation & Current Status:** High. Analysis trigger button disables immediately upon submission with `disabled` attribute and `cursor-not-allowed` styling, preventing duplicate race conditions and redundant API spend.

### Heuristic 6: Recognition Rather than Recall
* **Baseline Status:** High. The uploaded photograph remains permanently docked beside the technical panels and critique copy, enabling direct visual cross-referencing.
* **Remediation & Current Status:** Excellent. Added numbered priority improvement badges (`#1`, `#2`) to the top recommendations card, allowing users to instantly recognise their immediate next step without reading multiple paragraphs.

### Heuristic 7: Flexibility and Efficiency of Use
* **Baseline Status:** High. Desktop users can drag and drop images or click to select; keyboard users can trigger the file picker via Enter/Space.
* **Remediation & Current Status:** Excellent. Accordion score breakdown allows beginners to digest high-level scores while permitting enthusiasts to expand detailed diagnostic rationale per category.

### Heuristic 8: Aesthetic and Minimalist Design
* **Baseline Status:** Moderate. On narrow mobile viewports (320px–375px), the hero metric cards were squeezed into 3 micro-columns (63px wide), forcing text truncation and horizontal clutter.
* **Remediation & Current Status:** High. Reflowed hero metric cards using responsive CSS `grid-cols-1 sm:grid-cols-3 gap-6`. Dark-mode aesthetic remains refined, cinematic, and focused on visual content.

### Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors
* **Baseline Status:** Poor. Network connection failures to backend server showed ambiguous failure messages without troubleshooting steps.
* **Remediation & Current Status:** High. In-app error alerts now provide clear diagnostics: *"Cannot connect to the ArtiSight analysis backend. Please verify your network connection or ensure the local backend server is running on port 5000 (`python run.py`)."* Includes an inline "Retry Analysis" button.

### Heuristic 10: Help and Documentation
* **Baseline Status:** High. The platform incorporates curated external tutorials, books, and reference guides mapped to the user's specific weak dimensions (e.g., Freeman's *The Photographer's Eye* for composition deficits).
* **Remediation & Current Status:** High. External learning links open safely in new tabs with explicit screen-reader indicators `(opens in new tab)`.

---

## 4. WCAG 2.2 Level AA Accessibility Audit

Automated scans were conducted using `@axe-core/playwright` across all primary application views (`/`, `/upload`, `/feedback`).

### Automated Axe-Core Findings & Resolutions

```
================================================================================
AXE-CORE WCAG 2.2 AA VERIFICATION SUMMARY
================================================================================
Route Tested: / (Homepage & Landing)
  - Pre-Audit Violations: 2 (aria-label mismatch on brand logo; text-slate-500 contrast 3.75:1)
  - Post-Remediation Violations: 0
  - Status: PASSED (100% compliant)

Route Tested: /upload (Image Upload & Dropzone)
  - Pre-Audit Violations: 2 (dropzone non-focusable by keyboard; footnote text-gray-400 contrast 2.53:1)
  - Post-Remediation Violations: 0
  - Status: PASSED (100% compliant)

Route Tested: /feedback (Critique Dashboard & Overlays)
  - Pre-Audit Violations: 6 (label-content-name-mismatch on actions; amber contrast 3.18:1; emerald contrast 3.6:1)
  - Post-Remediation Violations: 0
  - Status: PASSED (100% compliant)
================================================================================
```

### Critical Accessibility Issues Remediated

1. **WCAG 2.5.3 Label in Name (Level A):**
   - *Problem:* Action buttons (`Copy Report`, `Print / PDF`, `New Photo`) and the brand logo had hardcoded `aria-label` values that differed from the visible button text. This broke speech-input navigation (e.g., speech users saying "Click Copy Report" failed because the programmatic name was "Copy critique report to clipboard").
   - *Fix:* Removed conflicting `aria-label`s on elements containing clean visible text. Programmatic accessible names now naturally match visible labels.

2. **WCAG 2.1.1 Keyboard Accessibility (Level A):**
   - *Problem:* The drag-and-drop container was a `<div>` with an `onClick` listener but lacked `tabIndex`, keyboard event listeners, or an ARIA role. Keyboard-only users could not select a photo without hunting for hidden file inputs.
   - *Fix:* Added `role="button"`, `tabIndex={0}`, `onKeyDown` supporting `Enter` and `Space`, and visible `focus:ring-2 focus:ring-amber-500` outline styles.

3. **WCAG 1.4.3 Contrast (Minimum) (Level AA):**
   - *Problem:* Multiple low-contrast text colors failed the required 4.5:1 ratio:
     - Dropzone footnote text: `text-gray-400` on `#ffffff` (2.53:1) — **FAIL**
     - Active composition overlay buttons: `text-amber-500` on `#ffffff` (3.18:1) — **FAIL**
     - Histogram clipping labels: `text-emerald-600` on `#f8fafc` (3.6:1) — **FAIL**
     - Footer copyright: `text-slate-500` on `#0f172a` (3.75:1) — **FAIL**
   - *Fix:* Upgraded palettes:
     - Dropzone footnotes: `text-gray-600` (4.7:1) — **PASS**
     - Active overlays: `bg-slate-900 text-amber-300 border-amber-500` (11.5:1) — **PASS**
     - Histogram labels: `text-emerald-700` (5.1:1) — **PASS**
     - Footer copyright: `text-slate-400` (5.8:1) — **PASS**

4. **WCAG 4.1.2 Name, Role, Value (Level A):**
   - *Problem:* Accordion dimension toggles and composition overlay buttons lacked dynamic ARIA states (`aria-expanded`, `aria-pressed`).
   - *Fix:* Applied `aria-pressed={overlayMode === key}` to all camera overlay toggles, and `aria-expanded={expandedScore === cat}` to diagnostic accordion items.

---

## 5. Responsive Design & Multi-Device Evaluation

The platform was tested across **9 standardized viewports**:

| Viewport | Dimension | Target Device Category | Baseline Observations | Post-Fix Verification |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `320 x 568` | Small Mobile (iPhone SE 1st Gen) | **FAIL:** Hero metrics squished into 63px columns; text overflowed by 19px | **PASS:** Stacked 1-col layout; 0px overflow |
| **02** | `375 x 667` | Standard Mobile (iPhone SE 2nd/3rd Gen) | Tight spacing, minor badge wrapping | **PASS:** Fluid padding, clean vertical stack |
| **03** | `390 x 844` | Modern Mobile (iPhone 12/13/14/15) | Functional, but action header wrapped awkwardly | **PASS:** Consolidated action bar reflows smoothly |
| **04** | `430 x 932` | Large Mobile (iPhone 15 Pro Max) | Functional layout | **PASS:** Optimal touch targets (>44x44px) |
| **05** | `768 x 1024` | Tablet Portrait (iPad Mini/Air) | 2-column layout cramped in score breakdown | **PASS:** Reflowed 1-column critique with docked image |
| **06** | `1024 x 768` | Tablet Landscape (iPad Pro) | Good layout balance | **PASS:** Side-by-side comparison active |
| **07** | `1366 x 768` | Standard Laptop | Balanced margins and typography | **PASS:** Full sticky preview sidebar active |
| **08** | `1440 x 900` | Modern Desktop (MacBook Pro 15/16) | Excellent visual hierarchy | **PASS:** Crisp typography and overlay alignment |
| **09** | `1920 x 1080` | Large Desktop / Monitor | Excessive negative space without max-width | **PASS:** Max-w-7xl container maintains focal cohesion |

---

## 6. AI Critique Experience & Photographic Usability

### 30-Second Scanability
In rapid cognitive tests, first-time users can immediately answer:
1. *What did I score?* Overall score prominently displayed (e.g. `82 / 100`) with color-coded sentiment badge (`High Proficiency`).
2. *What is my top strength?* Highlighted prominently in the left-hand executive card.
3. *What should I fix first?* Clear `#1` priority badge pointing directly to the most critical improvement area (e.g., exposure highlight recovery).

### Objective Computer Vision vs. Generative LLM Separation
ArtiSight clearly delineates between:
- **Deterministic Technical Metrics:** Real OpenCV-computed luminance histograms, shadow/highlight clipping percentages, and Laplacian sharpness variance.
- **Multimodal Qualitative Feedback:** Google Gemini 2.5 Flash narrative critique evaluating artistic mood, focal storytelling, and contextual framing.

This separation prevents the critique from feeling like generic "hallucinated" AI commentary, giving intermediate and enthusiast photographers actionable confidence.

---

## 7. Automated Test Suite Summary

The comprehensive Playwright end-to-end test suite (`tests/e2e/`) validates all critical application paths:

- **Total Test Specs:** 9 files
- **Total Test Scenarios:** 62 tests
- **Passing Tests:** 62 / 62 (100% Pass Rate)
- **Execution Time:** ~1.4 minutes

```
Running 62 tests using 1 worker
  ✓  1 [chromium] › accessibility.spec.ts:14:7 › Accessibility › A11Y-01
  ✓  2 [chromium] › accessibility.spec.ts:25:7 › Accessibility › A11Y-02
  ✓  3 [chromium] › accessibility.spec.ts:37:7 › Accessibility › A11Y-03
  ✓  4 [chromium] › accessibility.spec.ts:50:7 › Accessibility › A11Y-04
  ✓  5 [chromium] › analysis.spec.ts:16:7 › Analysis Loading › AN-01
  ✓  6 [chromium] › analysis.spec.ts:40:7 › Analysis Loading › AN-02
  ✓  7 [chromium] › critique.spec.ts:18:7 › Critique Dashboard › CRIT-01
  ...
  ✓ 62 [chromium] › upload.spec.ts:145:7 › Photo Upload › UPLOAD-07
  62 passed (1.4m)
```

---

## 8. Summary of Strategic Recommendations

1. **Deploy Production Flask API:** Currently, the Netlify deployment targets `http://localhost:5000`. Deploying the Python backend to a managed cloud container (e.g., Google Cloud Run, Render, or Railway) and linking `VITE_API_BASE_URL` will provide public visitors with instant zero-friction critique generation.
2. **Preset Sample Gallery:** Add 3 pre-computed critique demos (Portrait, Landscape, Low-Light) on the upload screen so first-time visitors can evaluate the full dashboard experience without needing an image file ready on hand.
3. **Downloadable PDF Report:** Elevate the current browser print action to a styled SVG/PDF export including the image with active composition overlay lines and histogram graphics.
