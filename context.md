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
├── vite.config.js      # Vite build configuration (disables hashed filenames for offline SW)
├── index.html          # Main HTML markup shell for both tools
├── styles.css          # Core CSS variables, typography, layouts, animations
├── app.js              # Application logic, calculation math, local storage, SW registration
└── public/             # Static PWA assets copied directly to build root
    ├── sw.js           # Service Worker caching script (stale-while-revalidate)
    ├── manifest.json   # PWA installer specifications
    ├── logo.svg        # Base application logo in vector format
    ├── logo-192.png    # 192x192 logo icon for manifest
    └── logo-512.png    # 512x512 logo icon for manifest
```

---

## Technical Details

### 1. Progressive Web App (PWA) Setup
- **Service Worker (`sw.js`)**: Caches static assets (`/`, `index.html`, `styles.css`, `app.js`, `manifest.json`, and logo assets) during the service worker `install` lifecycle. Intercepts network requests using a cache-first approach, serving assets from cache immediately while fetching and updating in the background (stale-while-revalidate).
  - *Version*: The service worker cache is named `toolnext-cache-v2`. It was incremented to v2 to force invalidation of cached stylesheets and load sidebar navigation style adjustments.
- **Manifest (`manifest.json`)**: Configured with `display: "standalone"`, `orientation: "portrait-primary"`, and a deep color scheme (`#0a0b1e` theme color) to fit natively on mobile screens when installed.

### 2. Sidebar Navigation Layout System
The interface features a responsive layout designed to accommodate future utilities easily:
- **Structure (`index.html`)**: Wrapping everything in `.app-layout`.
  - `#sidebar` containing app branding, links, and PWA options.
  - `#sidebar-backdrop` rendering a dim background blur for mobile drawer.
  - `.mobile-header` representing a white top-bar header containing a hamburger menu `#menu-toggle` visible only on screen widths `< 900px`.
- **Drawer Toggling & Tab Switching (`app.js` & `styles.css`)**:
  - CSS transitions slide the sidebar drawer from `-100%` (hidden) to `0` (opened) when the `.open` class is toggled on mobile view.
  - Listeners toggle this class on hamburger menu click, close menu click, or backdrop click.
  - Selecting a calculator tab switches visibility of `#panel-age`/`#panel-tahajjut` and automatically closes the mobile drawer view (`closeSidebar()`).

### 3. LocalStorage Caching Strategy
The app caches user inputs locally in their browser. These are retrieved automatically on page load:
- `toolnext_dob`: Stores the Date of Birth string (Format: `YYYY-MM-DD`). Defaults to `2000-01-01` on first load if empty.
- `toolnext_maghrib`: Stores Maghrib sunset time (Format: `HH:MM` 24h format). Defaults to `18:50` on first load if empty.
- `toolnext_fajr`: Stores Fajr dawn time (Format: `HH:MM` 24h format). Defaults to `03:45` on first load if empty.

*Note: Target Date is intentionally NOT cached to ensure that it always defaults to the current local date (today's date) on page load in the user's timezone.*

When these values are fetched on load, `app.js` runs calculations automatically to display statistics.

### 4. Calculators Math Logic

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
