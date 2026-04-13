# TASKS.md — Current State and Next Steps

## ✅ Backend file generation refactor — DONE (Session 13)

- New `POST /lta/generate-and-save`: receives sliceResult JSON, runs ExcelJS+pdf-lib server-side, writes to disk
- 90 HTTP calls → 1 call per LTA. 30–80 MB payload → ~200 KB
- Per-card "Sauvegarder" and bulk "Enregistrer tout" both use it
- Body-parser limit raised to 50 MB

## 🔲 Architecture refactor: move file generation to backend (RECOMMENDED NEXT)

**Problem**: For a 90-DUM manifest, the current flow makes 90+ HTTP requests and sends a 30–80MB base64 payload → 413 crash + browser freeze.

**Plan**: New `POST /lta/generate-and-save` endpoint:

- Receives `{ sliceResult, ref, folderPath }` (~200KB JSON max)
- Backend runs ExcelJS + pdf-lib (no browser thread blocking)
- Backend writes files directly to disk — zero base64 round-trip
- Returns `{ saved[], errors[] }`
- Frontend calls it once per LTA (not 90+ times)

**Quick fix (unblocks today without refactor)**:

- Raise `bodyParser.json({ limit: "200mb" })` in `tyaybi_back/index.js`
- Send files one-at-a-time in `saveToFolder` instead of all-at-once

---

## ✅ UI cleanup + Desktop/Canevas auto-path — DONE (Session 12)

- Action bar: one card with both "Découper tous" + "Enregistrer tout — Bureau/Canevas" buttons
- Bulk download writes to `Desktop\Canevas\MAWB {réf}\` via backend, no folder picker
- Currency input: plain text, no datalist

## ✅ Bulk Slice all LTAs — DONE (Session 11)

- "▶ Découper tous les LTAs (N)" button appears once ≥1 card has fret+manifest ready
- Runs `handleExecute` sequentially for all eligible cards
- Disabled while any card is processing

## ✅ Stack overflow fix + Bulk download — DONE (Session 10)

- `toBase64()` chunked encoder fixes `btoa` crash on large xlsx
- "⬇ Tout télécharger" button: one `showDirectoryPicker` → subfolder per LTA ref

---

## ✅ ZIP Download + Save to PARTAGE — DONE (Session 9)

- "Tout télécharger" → `{ref}.zip` with per-sheet `.xlsx` + `.pdf` + `summary_file.xlsx`
- "Sauvegarder dans dossier" → writes all files to `{partagePath}\MAWB {ref}\` via backend
- Progress counter on buttons, result feedback message
- Backend: `/lta/sheet-to-pdf` + `/lta/save-results` endpoints added

---

## ✅ Free-text currency + OXR fallback — DONE (Session 8)

- Frontend: `<select>` → `<input>` + `<datalist>` combobox (type any ISO code)
- Backend: 3rd fallback via openexchangerates.org (covers any currency)
- Chain: BAM → frankfurter blended → openexchangerates

---

## ✅ Exchange Rate API Fix — DONE (Session 6)

- frankfurter.app swapped for exchangerate-api.com (MAD is not in ECB dataset)
- Verified: CNY→MAD returns 1.36

---

## ✅ Exchange Rate — frankfurter.dev v2 — DONE (Session 7)

- Switched `/exchange-rate` proxy from exchangerate-api.com to `api.frankfurter.dev/v2/rate/{from}/MAD`
- Supports MAD via Bank Al-Maghrib provider
- Verified: `CNY → MAD = 1.3609` ✓

---

## ✅ Acheminements CORS + Layout Fix — DONE (Session 5)

- Backend: `/exchange-rate` proxy added — no more CORS block
- Frontend: native `<input>`/`<select>` in `grid grid-cols-2` — no more style conflict

---

## ✅ Acheminements Feature — DONE (Session 4)

- `src/utils/sliceManifest.js` created
- `src/pages/dashboard/acheminements/index.jsx` created
- `src/routes.jsx` updated with Acheminements route
- Backend `/lta/scan` already present — no changes needed

---

## Current State

The core Excel processing and PDF generation (Excelslice, Model 5, NGP DB) are functional when both the frontend dev server and the Express backend are running. The app is in active development with significant cleanup and completion work needed.

---

## What Is Broken or Incomplete

### Critical Bugs

1. **Syntax error in `tyaybi_back/index.js` line ~57**: `res.send(Buffer.from(pdfBuffer, 'binary'));0` — trailing `0` after the semicolon causes a JavaScript parse/runtime issue. Fix: remove the `0`.
2. **`filePath2` typo in `tyaybi_back/index.js`**: Path is `'../taibi_front/...'` instead of `'../tyaybi_front/...'`. This variable is defined but not actually used in any route handler currently — but would fail if used.
3. **Dashboard Home (`home.jsx`) is broken**: `statistics-cards-data.js` calls `getnombreprojets()`, `getmontant()`, `getnbrclient()`, `getnbrusers()` — none of these functions are defined anywhere. The home page will throw a runtime error on mount.
4. **Sign-up is broken**: `register()` in `loginservice.js` targets `http://localhost:5000` (external backend not in repo). Sign-up form will always fail.
5. **Client management is broken**: All CRUD in `addclient.jsx`, `updateclient.jsx` targets `http://localhost:5000`. None of those routes will work.

### Security Issues

6. **Hardcoded admin credentials** in `sign-in.jsx` (`admin@gmail.com` / `12345` with token `= 1`). This needs to be replaced with real auth before any production deployment.
7. **No authentication on Express API** (port 3000): any local client can read/modify `bddngp.json` without any token.
8. **`bddngp.json` is written directly** from the backend using `fs.writeFile` with no validation beyond field presence. Malicious POST could corrupt the file.

### Incomplete Features

9. **`num.json` has no UI**: The MAWB tracking archive in `num.json` is read by some logic in `convertpdf.jsx` for generating sequential customs registration codes, but there is no management page for it (view/reset/edit).
10. **`Ngpbdd.json`** exists alongside `bddngp.json` in the clients folder but is never imported or used anywhere. It may be a larger or alternate NGP database that was intended to replace `bddngp.json`.
11. **`puper.js` (backend)** implements a DUM customs form generator using `pdfkit` but is never called from any route in `index.js`. It appears to be a standalone prototype.
12. **`server.js` (backend)** is a dead static file server that serves a placeholder `index.html`. Not connected to anything. Should be removed or clarified.
13. **`routessans.jsx`** in `widgets/` — file exists but its content and purpose are unknown. Not imported anywhere visible.
14. **`ExcelToPdfConverter`** (from `clients/clients.jsx`) is imported in `routes.jsx` but never placed in a route. Dead import.
15. **`Clientss`** (from `test.jsx`) is imported in `routes.jsx` but never placed in a route. Dead import.
16. **Dashboard Home stats** (`statisticsChartsData`, `projectsTableData`, `ordersOverviewData`) use mock/static data. Not connected to any real API.
17. **`userRole` in `dashboard.jsx`** is always `0` — the role-based page filtering logic exists but is never activated (no API call to get the actual user role).
18. **`tauxusd` field** (USD→MAD exchange rate) is available in the UI but the currency conversion logic in the processing loop needs verification — some rows may use MAD already.

### Code Quality / Cleanup

19. **Archive files**: `archive.js`, `archiveee2.jsx`, `archivelastupdate.jsx`, `sortieupdate.jsx`, `archive_model5.jsx` are all obsolete versions of the main component living in the active source directory. They export duplicate `Clients` / `Newmodel` function names which could cause import confusion.
20. **`test.jsx` and `test2.jsx`**: Dev/experimental files in the production source directory.
21. **No `.env` files**: All URLs and credentials are hardcoded. This must be resolved before any deployment.
22. **Backend JSON file path is relative**: If `index.js` is run from a different working directory, the hardcoded relative path `../tyaybi_front/src/...` will break. Should use `path.resolve(__dirname, ...)`.
23. **`uploads/` directory** in the backend contains many unnamed binary files (leftover from multer uploads that failed to be cleaned up). Should be cleared.

---

## Logical Next Steps (Priority Order)

### Phase 1 — Fix Blockers

- [x] Fix syntax error in `tyaybi_back/index.js` (remove trailing `0` after semicolon) ✓ DONE
- [x] Add root `.gitignore` — `node_modules/`, `uploads/*`, generated PDFs, root xlsx ✓ DONE
- [ ] Fix `filePath2` typo in `tyaybi_back/index.js`
- [ ] Fix backend file path to use `path.resolve(__dirname, ...)` instead of relative path
- [ ] Fix `statistics-cards-data.js` — either remove broken function calls or stub them safely so the home page doesn't crash

### Phase 2 — Acheminements (NEW FEATURE) ✓ DONE

- [x] Extract slice algorithm to `src/utils/sliceManifest.js` ✓ DONE
- [x] Add `POST /lta/scan` endpoint to backend ✓ DONE
- [x] Create `/Acheminements` page with:
  - [x] PARTAGE path config (localStorage)
  - [x] Multi-LTA ref input
  - [x] Per-LTA card with inline PDF viewer, Fret + Currency inputs, live MAD calc
  - [x] Execute → slice → download buttons (Excel all, per-sheet Excel/PDF)
- [x] Add route in routes.jsx ✓ DONE

### Phase 3 — Authentication

- [ ] Replace hardcoded `admin@gmail.com / 12345` with real auth:
  - Option A: Build a simple Express auth route (hashed password, JWT) and wire it up
  - Option B: Connect to the missing external port 5000 backend (need to add that project to the repo)
- [ ] Add token validation on the Express backend API endpoints (JWT middleware)
- [ ] Wire `loginservice.js` to the sign-in form (currently bypassed)

### Phase 3 — Clean Up Dead Code

- [ ] Delete or move to `/archive/` folder: `archive.js`, `archiveee2.jsx`, `archivelastupdate.jsx`, `sortieupdate.jsx`, `archive_model5.jsx`
- [ ] Delete `test.jsx`, `test2.jsx` from the active clients directory
- [ ] Remove dead imports from `routes.jsx` (`Clientss`, `ExcelToPdfConverter`)
- [ ] Investigate and either use or delete `Ngpbdd.json`, `routessans.jsx`, `server.js`, `puper.js`
- [ ] Clean up `uploads/` folder orphaned files

### Phase 4 — Environment and Config

- [ ] Create `.env` for frontend: `VITE_NGP_API_URL`, `VITE_AUTH_API_URL`
- [ ] Create `.env` for backend: `PORT`, `BDDNGP_FILE_PATH`
- [ ] Update all hardcoded URLs and paths to use environment variables

### Phase 5 — Feature Completion

- [ ] Build UI for `num.json` MAWB archive management (view processed MAWBs, reset counters)
- [ ] Determine if `Ngpbdd.json` should replace `bddngp.json` as the primary NGP database and migrate
- [ ] Connect `puper.js` to an Express endpoint or integrate its logic into the existing PDF generation pipeline
- [ ] Fix or remove the Home page (wire real statistics or replace with relevant dashboard content)
- [ ] Implement real role-based access control (fetch user role after login, store in context/state)

### Phase 6 — Reliability

- [ ] Add error boundaries to the main processing pages so Excel parse errors don't crash the whole app
- [ ] Add input validation for uploaded Excel files (check expected column structure before processing)
- [ ] Add server-side validation in the Express POST `/data` route (validate field types before writing to JSON)
- [ ] Consider migrating `bddngp.json` + `num.json` to a proper database (SQLite or MongoDB) if the dataset grows large
