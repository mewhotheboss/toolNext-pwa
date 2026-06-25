# ToolNext PWA

ToolNext is a premium, lightweight, and completely offline Progressive Web App (PWA) that contains two essential utility tools:
1. **Age Calculator**: Compute your exact age in years, months, and days. It features additional details such as total months/weeks/days/hours/minutes lived, a next birthday countdown, and a live seconds counter ticker showing the seconds lived since birth.
2. **Tahajjut Time Calculator**: Compute the exact phases of the night (first third, second third, and last third/Tahajjut start) based on Maghrib and Fajr times. It features an interactive, glowing Night Timeline showing where you are in the night in real time.

All calculations are executed locally in the browser with **zero external APIs**, making it extremely fast, secure, and 100% offline-ready. Inputs are persisted using `localStorage` so they remain populated upon closing and reopening the app.

---

## Live Demo
You can deploy this repository to **Vercel** with a single click. It is fully pre-configured for Vite deployment.

---

## Tech Stack
- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- **Bundler/Dev Server**: Vite
- **PWA Features**: Service Worker (`sw.js`) for static assets caching, Web App Manifest (`manifest.json`) for installation support.
- **Design**: Premium glassmorphism, responsive grids, custom Outfit & JetBrains Mono typography, dark and light theme options.

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone or download this repository.
2. Open the directory in your terminal and run:
   ```bash
   npm install
   ```
   *(Or `npm.cmd install` on Windows PowerShell)*

### Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## Deployment (Vercel)
Vercel will auto-detect the Vite configuration:
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Click **Deploy** (No manual build settings needed!).

---

## License
MIT License. Feel free to modify and adapt.
