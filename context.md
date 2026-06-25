# Developer Context - ToolNext PWA

This file contains architectural details, codebase organization, and configurations for **ToolNext PWA** to assist future developers or AI agents.

---

## Directory Structure

```
ToolNext/
├── .gitignore          # Files excluded from git tracking (node_modules, logs, dist)
├── README.md           # User documentation
├── context.md          # Technical developer context (this file)
├── package.json        # Node configuration (Vite devDependency, run scripts)
├── index.html          # Main HTML markup shell for both tools
├── styles.css          # Core CSS variables, typography, layouts, animations
├── app.js              # Application logic, calculation math, local storage, SW registration
├── sw.js               # Service Worker caching script (stale-while-revalidate)
├── manifest.json       # PWA installer specifications
├── logo.svg            # Base application logo in vector format
├── logo-192.png        # 192x192 logo icon for manifest
└── logo-512.png        # 512x512 logo icon for manifest
```

---

## Technical Details

### 1. Progressive Web App (PWA) Setup
- **Service Worker (`sw.js`)**: Caches static assets (`/`, `index.html`, `styles.css`, `app.js`, `manifest.json`, and logo assets) during the service worker `install` lifecycle. Intercepts network requests using a cache-first approach, serving assets from cache immediately while fetching and updating in the background (stale-while-revalidate).
- **Manifest (`manifest.json`)**: Configured with `display: "standalone"`, `orientation: "portrait-primary"`, and a deep color scheme (`#0a0b1e` theme color) to fit natively on mobile screens when installed.

### 2. LocalStorage Caching Strategy
The app caches all user inputs locally in their browser. These are retrieved automatically on page load:
- `toolnext_dob`: Stores the Date of Birth string (Format: `YYYY-MM-DD`).
- `toolnext_target_date`: Stores the target date to calculate age against (Format: `YYYY-MM-DD`).
- `toolnext_maghrib`: Stores Maghrib sunset time (Format: `HH:MM` 24h format).
- `toolnext_fajr`: Stores Fajr dawn time (Format: `HH:MM` 24h format).

When these values are fetched on load, `app.js` runs calculations automatically to display statistics.

### 3. Calculators Math Logic

#### A. Age Calculator
- Performs full Date arithmetic:
  1. Computes total year difference.
  2. Adjusts months and days according to negative values and different month days (accounting for leap years in February).
  3. Displays secondary stats (total months, weeks, days, hours, minutes lived).
  4. Keeps a live ticker counting seconds lived since birth using an interval of 1 second.
  5. Computes the next birthday countdown and shows which weekday the birthday falls on.

#### B. Tahajjut Time Calculator
- Divides the night into three equal parts (thirds) from Maghrib (sunset) to Fajr (dawn):
  1. Converts times to minutes relative to midnight.
  2. If Fajr (dawn) is numerically smaller than Maghrib (sunset), it implies a cross-midnight duration, so `24 * 60` minutes are added to the Fajr time.
  3. Total night gap: `fajr - maghrib` in minutes.
  4. **First Third End**: `maghrib + (total_gap / 3)`
  5. **Second Third End / Tahajjut Start**: `maghrib + (total_gap * 2 / 3)`
  6. Renders a linear segmented bar graph visualizing the thirds. Highlights the third segment (Tahajjut window) using a glowing linear gradient.
  7. Calculates current time alignment and overlays a white dot indicator along the timeline representing "Now" if current time is within the night gap.

---

## Future Features Backlog
- **Weight Converter**: A utility to translate weight values (kg, lbs, stones, grams) offline.
- **Unit/Length Converter**: Multi-unit distance mapping.
- **PWA Update Popup**: Interactive alert prompt when service worker detects cache changes to automatically skip waiting and reload the browser page.
