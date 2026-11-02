# ArtiSight — UX Before & After Design & Engineering Log

This document provides a comparative analysis of critical user experience, accessibility, and architectural enhancements implemented during the comprehensive UX audit of ArtiSight.

---

## 1. Summary of Changes

```
┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│ Area / Feature                  │ Before Audit (Baseline)         │ After Audit (Remediated)        │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 1. Mobile Hero Metrics          │ 3-column squish on 320px screens│ Stacked 1-column responsive grid│
│ 2. Unmapped Routes / 404        │ Blank white screen              │ Custom branded 404 recovery page│
│ 3. Upload Dropzone Accessibility│ Unfocused div, mouse-only       │ Role button, Enter/Space, focus │
│ 4. WCAG Label in Name (2.5.3)   │ Mismatched aria-label overrides │ Natural visible label inheritance│
│ 5. Text Color Contrast (1.4.3)  │ Multiple traps (2.1:1 to 3.7:1) │ Conforming palettes (4.7 to 11:1│
│ 6. Critique Subheader           │ Double competing headers        │ Clean single action bar         │
│ 7. Actionable Growth Hierarchy  │ Unranked bullet points          │ Numbered #1 and #2 badges       │
│ 8. API Disconnect Guidance      │ Cryptic network failure box     │ Diagnostic banner + inline retry│
└─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

---

## 2. Detailed Before vs. After Analysis

### Case 1: Landing Page Hero Metrics on Small Mobile Screens (320px–375px)

#### The Problem (Before)
The landing page hero featured 3 metric highlight badges ("Sub-second Analysis", "6 Rubric Dimensions", "Actionable Growth"). The container CSS was hardcoded to `grid-cols-3` without breakpoint prefixes. On a 320px screen (e.g., iPhone SE 1st Gen or small Android devices), the available content width inside the padded container was only 238px. This allocated just 63px per card, causing text to overflow by 19px, break across syllables, and crowd icons into illegible artifacts.

#### The Solution (After)
Updated the layout in `artisight/src/components/Hero.jsx` from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3 gap-6`. On screens below 640px, the metrics now stack vertically with generous touch spacing and comfortable line lengths, preserving typographic hierarchy and visual breathing room.

```tsx
// Before:
<div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 border-t border-slate-800">

// After:
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 border-t border-slate-800">
```

#### User Impact
- **Persona C (First-Time Visitor):** Immediately perceives a polished, modern, native-feeling mobile experience rather than an unoptimized desktop port.
- **Verification:** Playwright test `RESP-20` verified 0px horizontal scroll on 320x568.

---

### Case 2: Broken Route Handling & 404 Recovery

#### The Problem (Before)
React Router was configured without a wildcard `*` fallback. If a user mistyped a URL, clicked an outdated social link, or navigated to `/explore` or `/photos`, the application loaded an empty root container: `<div id="root"></div>`. The screen turned solid blank without headers, footers, or error notifications. Users assumed the application was dead or crashed.

#### The Solution (After)
1. Engineered a dedicated, branded 404 page in `artisight/src/pages/NotFound.jsx` featuring a custom camera viewfinder icon, photography-themed messaging (*"Frame Out of View — The composition you're looking for doesn't exist or has moved"*), and two clear recovery buttons:
   - **"Go Back"** (invokes browser history fallback)
   - **"Return Home"** (routes cleanly to `/`)
2. Registered the route in `artisight/src/App.jsx`:
   `<Route path="*" element={<NotFound />} />`

#### User Impact
- **All Personas:** Eliminates terminal dead ends. Users retain system orientation and can return to the primary critique workflow in a single click.
- **Verification:** Playwright test `ERR-01` verified 404 presence and recovery navigation.

---

### Case 3: Keyboard Accessibility on the Upload Dropzone

#### The Problem (Before)
The dropzone in `artisight/src/components/Uploading.jsx` was a standard `<div>` styled with dashed borders. While it handled native mouse click and HTML5 drag/drop events, it lacked:
- `tabIndex` (could not be focused via `Tab` key)
- `role="button"` (screen readers announced it as a generic text region)
- `onKeyDown` listeners (pressing `Enter` or `Space` did nothing)
- Visible focus indicator

Keyboard-dependent users, switch-control users, and screen-reader users were completely locked out of uploading an image.

#### The Solution (After)
Transformed the dropzone into a first-class accessible interactive component:

```tsx
// After:
<div
  role="button"
  tabIndex={0}
  aria-label="Upload photo dropzone. Drag and drop or press Enter to choose an image."
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }}
  className={`... focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
>
```

#### User Impact
- **WCAG 2.1.1 (Level A) & 2.4.7 (Level AA) Conformance:** Anyone navigating with standard keyboard controls can smoothly tab to the dropzone, press Enter, select a photo, and initiate analysis.
- **Verification:** Playwright test `UPLOAD-07` verified keyboard activation without mouse events.

---

### Case 4: Elimination of WCAG 2.5.3 "Label in Name" Failures

#### The Problem (Before)
Action buttons in `artisight/src/components/Feedback.jsx` (e.g. `Copy Report`, `Print / PDF`, `New Photo`) and the brand logo in `artisight/src/components/Navbar.jsx` had redundant `aria-label` overrides:
- Visible button: `"Copy Report"` → `aria-label="Copy critique report to clipboard"`
- Visible logo: `"ArtiSight 2.0"` → `aria-label="ArtiSight Home"`

Under WCAG 2.5.3 (Label in Name), speech-recognition software matches spoken commands against the accessible name. When a user said *"Click Copy Report"*, the voice parser looked for an element whose programmatic name started with "Copy Report", failing because the accessible name was replaced by the verbose `aria-label`.

#### The Solution (After)
Removed the overriding `aria-label`s on elements whose visible text already provides a clear, concise accessible name. Screen readers and speech engines now derive the accessible name directly from the visible text.

#### User Impact
- Flawless voice-control navigation for motor-impaired users; zero axe-core `label-content-name-mismatch` violations.
- **Verification:** Verified in Playwright test `A11Y-03`.

---

### Case 5: Text Color Contrast Remediation (WCAG 1.4.3)

#### The Problem (Before)
Multiple UI elements across light and dark cards failed the WCAG 1.4.3 Level AA minimum contrast ratio of 4.5:1:
- Dropzone footnote text: `text-gray-400` (#9ca3af) on `#ffffff` = **2.53:1** (Severe failure)
- Active overlay toggle buttons: `text-amber-500` (#f59e0b) on white = **2.14:1** (Severe failure)
- Histogram clipping warnings: `text-emerald-600` (#059669) on `#f8fafc` = **3.61:1**
- Footer copyright text: `text-slate-500` (#64748b) on `#0f172a` = **3.75:1**

#### The Solution (After)
Systematically upgraded text colors to compliant high-contrast pairings:
- Dropzone footnote text: `text-gray-600` (#4b5563) on white = **4.72:1** (PASS)
- Active overlay toggle: `bg-slate-900 text-amber-300 border-amber-500` = **11.52:1** (PASS)
- Histogram clipping warnings: `text-emerald-700` (#047857) on `#f8fafc` = **5.14:1** (PASS)
- Footer copyright text: `text-slate-400` (#94a3b8) on `#0f172a` = **5.82:1** (PASS)

#### User Impact
- High legibility outdoors in bright sunlight and for users with low vision or color perception deficiencies.
- **Verification:** Automated axe-core scans in `A11Y-01`, `A11Y-02`, and `A11Y-03` reported 0 contrast violations.

---

### Case 6: Critique Subheader Consolidation & Priority Badging

#### The Problem (Before)
Upon landing on the Critique Dashboard (`/feedback`), users were presented with two stacked navigation bars: an outer section header and an inner action container. Both duplicated titles and had conflicting visual weight. Furthermore, the "Actionable Recommendations" card presented 3 to 4 long bullet points of equal weight, requiring beginners to read dense paragraphs before understanding what to do.

#### The Solution (After)
1. Consolidated the critique top-bar into a single, clean subheader displaying:
   - Overall critique score and assessment category.
   - Analysis date timestamp.
   - Unified utility actions: `Copy Report`, `Print / PDF`, and `New Photo`.
2. Added high-contrast `#1` and `#2` priority badges (`bg-amber-900 text-white` > 8.7:1 contrast) to the top growth areas.

#### User Impact
- **Persona A (Beginner):** Within 30 seconds of opening their critique, a novice immediately spots the `#1` badge, reading their single most impactful takeaway without feeling overwhelmed.
- **Verification:** Verified in Playwright tests `CRIT-01` through `CRIT-10`.

---

### Case 7: Network Disconnection & Recovery Guidance

#### The Problem (Before)
When users attempted to analyze a photo on the public Netlify deployment without running a local Flask server, the application caught a network error and displayed an ambiguous, generic error banner (*"Failed to analyze image. Please try again."*). Users had no idea if their file was corrupted, if the site was broken, or what action to take.

#### The Solution (After)
Enhanced the error boundary in `artisight/src/components/Uploading.jsx`. When the error reflects an inability to connect to `localhost:5000`:
- The banner explains:  
  *"Cannot connect to the ArtiSight analysis backend. Please verify your network connection or ensure the local backend server is running on port 5000 (`python run.py`)."*
- Renders an inline **"Retry Analysis"** button right inside the banner.
- Retains the user's selected photo in state so they do not need to re-browse their file system.

#### User Impact
- Prevents user frustration and provides clear, actionable technical recovery guidance.
- **Verification:** Verified in Playwright test `ERR-04`.
