# Change Log

_Populated as we work. Each entry = problem + solution + files changed._

---

## Session 2 — Acheminements Feature Implementation

### Context

User described their manual workflow: receive MAWB PDF + MANIFEST Excel from Abdelhak, go to PARTAGE folder, find by LTA ref, read Fret value + currency from MAWB PDF, convert to MAD via xe.com, write MAD into Excel A4, upload and slice. Goal: maximum automation while keeping Fret/Currency as manual inputs (scanned PDFs are too unreliable for auto-extraction).

### Architecture Decided

- Backend only provides PARTAGE folder access (reads files, returns base64)
- Frontend handles all slice logic (already proven, no need to duplicate)
- Fret + Currency entered manually by user who reads the MAWB PDF in an inline viewer
- MAD calculated live using frankfurter.app exchange rate API
- Downloads happen in browser (reusing same ExcelJS/saveAs approach)

### Problems Solved

**Problem 1:** Stray `0` after `});` in `tyaybi_back/index.js` line ~67 caused JavaScript syntax error.  
**Solution:** Removed the `0`.  
**File:** `tyaybi_back/index.js`

**Problem 2:** Slice algorithm was ~1000 lines of React-stateful code, couldn't be reused.  
**Solution:** Extracted as pure function `sliceManifest(arrayBuffer, madValue, exclusionWaybills)` into `tyaybi_front/src/utils/sliceManifest.js`. The original `convertpdf.jsx` is untouched.  
**File:** `tyaybi_front/src/utils/sliceManifest.js` (new)

**Problem 3:** No way to access PARTAGE folder from browser.  
**Solution:** Added `POST /lta/scan` endpoint to Express backend. Receives `{ partagePath, refs[] }`, searches for `MAWB {ref}` subfolders, returns manifest xlsx + MAWB pdf as base64 strings.  
**File:** `tyaybi_back/index.js`

### New Features Implemented

1. **`tyaybi_back/index.js`** — fixed syntax error, added `/lta/scan` endpoint
2. **`tyaybi_front/src/utils/sliceManifest.js`** — pure slice algorithm as reusable utility
3. **`tyaybi_front/src/pages/dashboard/acheminements/index.jsx`** — new automation page:
   - PARTAGE path configuration (persisted in localStorage)
   - Multi-LTA ref input (comma/newline separated)
   - "Charger" button → calls /lta/scan → creates per-LTA cards
   - Per-LTA card: inline MAWB PDF viewer (iframe blob URL), Fret input, Currency dropdown (CNY/HKD/USD/EUR/GBP/AED/SAR), live MAD calculation (frankfurter.app), Execute button
   - After execute: download buttons — "Télécharger tout (Excel)", per-sheet Excel + PDF
4. **`tyaybi_front/src/routes.jsx`** — added Acheminements route at `/Acheminements`

### Key Algorithm Notes (sliceManifest.js)

- Mad value override: if `madValue` arg provided, it overrides what's in jsonData[3][0] for parvaleur
- Model detection: model2 (jsonData[4][1]=="Connote #"), model3 (jsonData[4][0]=="Docket #"), default
- HSCODE test flag: sanshawb column header === "HSCODE"
- Sheet split: max 400 rows per Canevas sheet (GLOBAL is separate, no limit)
- Value splitting: NGP codes in SPLIT_NGPS set AND total > 500 MAD → split into 495 + remainder (8512100000)
- 85121000000 is a sentinel for "electronic parts" split rows, corrected to 8512100000 after sort

### Exchange Rate

Uses `https://api.frankfurter.app/latest?from={CURRENCY}&to=MAD`  
Rate is cached per currency per page session. MAD = round(fret \* rate).

---

## Session 13 — Backend file generation (architecture refactor)

### Problem

For a 90-DUM manifest the old flow made **90+ HTTP round-trips** to `/lta/sheet-to-pdf`, then sent a **30–80 MB base64 JSON** body to `/lta/save-results` → 413 crash + browser freeze.

### Solution

New `POST /lta/generate-and-save` endpoint:

- Receives `{ sliceResult, ref, folderPath }` — ~200 KB JSON max
- Runs ExcelJS (Node, no browser thread) to build summary_file.xlsx, generated_excel.xlsx, and per-DUM .xlsx files
- Runs pdf-lib inline to build per-DUM .pdf files — **zero HTTP round-trips**
- `fs.mkdirSync(folderPath, { recursive:true })` auto-creates the output folder
- Writes all files directly to disk, returns `{ saved[], errors[], total }`

**Result**: 90 HTTP calls → **1 call**. 30–80 MB payload → **~200 KB**.

### Also

- Raised body-parser limit to 50 MB (covers sliceResult JSON for edge cases)
- `handleBulkDownloadAll` (bulk button) now loops cards and calls `generate-and-save` once per card
- `handleSaveToFolder` (per-card “Sauvegarder dans dossier”) now calls `generate-and-save` directly
- `saveToFolder`, `buildAllFiles`, `toBase64` are no longer called from these paths (kept in file for browser-download path)

### Files Modified

- `tyaybi_back/index.js` — helpers + `POST /lta/generate-and-save`, limit 50 MB
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — simplified handlers

---

## Session 12 — UI cleanup + Desktop/Canevas auto-path

### Changes

1. **Unified action bar**: Merged the separate "Découper tous" and "Tout télécharger" cards into one clean action bar card that appears above the LTA cards once manifests are loaded. Download button becomes visible inside that same bar once results exist.

2. **Desktop/Canevas default path**: Bulk download no longer shows a directory picker. Instead:
   - Backend `GET /lta/desktop-path` returns `os.homedir() + Desktop/Canevas`
   - Backend `POST /lta/save-results` now calls `fs.mkdirSync(folderPath, {recursive:true})` to auto-create the folder
   - Frontend calls `saveToFolder` per card with path `Desktop\Canevas\MAWB {ref}\`
   - Label shows "Enregistrer tout — Bureau/Canevas"

3. **Currency input**: Removed `<datalist>` / combobox — now a plain `<input type="text">` (free entry). Removed unused `CURRENCIES` constant.

### Files Modified

- `tyaybi_back/index.js` — `os` import, `GET /lta/desktop-path`, `mkdirSync` in save-results
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — action bar, handleBulkDownloadAll, currency input

---

## Session 11 — Bulk Slice button

Added **"▶ Découper tous les LTAs (N)"** button that appears between the config card and the LTA cards as soon as at least one card has both `manifestB64` and a computed `madValue`.

- `handleSliceAll` loops all eligible cards sequentially (skips any already `processing`) and calls `handleExecute` on each
- Button is disabled and shows a spinner while any card is processing
- Count in label reflects only cards that are actually ready (have fret + manifest)

### Files Modified

- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx`

---

## Session 10 — Stack overflow fix + Bulk download button

### Problems Fixed

1. **`saveToFolder` stack overflow** — `btoa(String.fromCharCode(...largeUint8Array))` spreads tens-of-thousands of args onto the JS call stack, crashing on large xlsx manifests. Fixed by adding a `toBase64(data)` helper that encodes in 8 KB chunks.

2. **Bulk "Tout télécharger" button** — User wanted one click to create an LTA subfolder per card in a user-chosen directory, without ZIP, using the File System Access API.

### Solution

**`toBase64` helper** added above `saveToFolder`:

- Processes buffer in 8192-byte chunks via `String.fromCharCode(...bytes.subarray(...))` + `btoa`
- `saveToFolder` now uses `toBase64(f.data)` for all files

**`handleBulkDownloadAll`** added to `Acheminements` component:

- `window.showDirectoryPicker()` once → loop each `card.sliceResult` → `buildAllFiles` → `dirHandle.getDirectoryHandle(card.ref, {create:true})` → write raw bytes
- Falls back to sequential `downloadToFolder()` (ZIP) if File System Access API not available
- Per-card progress displayed in button label while running

**Bulk button** rendered after cards map, visible only when ≥1 card has `sliceResult`.

### Files Modified

- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx`

---

## Session 9 — ZIP Download + Save to PARTAGE Folder

### Problem

"Tout télécharger" produced one multi-tab `.xlsx` file. User needed: per-sheet `.xlsx`, per-sheet `.pdf`, summary `.xlsx`, all packaged as `{ref}.zip` — matching the old Excelise tab output format. Also needed files saved directly to the LTA folder in PARTAGE.

### Solution

**Backend — 2 new endpoints:**

- `POST /lta/sheet-to-pdf` — takes `{ rows[][] }`, generates PDF via pdf-lib, returns `{ pdfB64 }`
- `POST /lta/save-results` — takes `{ folderPath, files: [{ name, contentB64 }] }`, writes files to the PARTAGE LTA folder

**Frontend (`acheminements/index.jsx`):**

- Installed JSZip (npm)
- `downloadAsZip(sliceResult, ref)` — creates `{ref}.zip` with: `summary_file.xlsx` + `{SheetName}.xlsx` + `{SheetName}.pdf` for each DUM
- `saveToFolder(sliceResult, folderPath, ref)` — sends all files to backend to write to `{partagePath}\MAWB {ref}\`
- Progress feedback: `(done/total)` displayed on buttons during generation
- Result feedback: green/red message after save shows files saved count and any errors
- "Tout télécharger (.zip)" renamed, "Sauvegarder dans dossier" button added (teal)

### Verified

- `POST /lta/sheet-to-pdf` → `pdfB64` length 405340 ✓
- Backend running with all 4 new endpoints ✓
- No frontend errors ✓

### Files Modified

- `tyaybi_back/index.js` — added `/lta/sheet-to-pdf` and `/lta/save-results`
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — full download/save overhaul
- `tyaybi_front/package.json` — added `jszip`

---

## Session 15 — PARTAGE root path MAWB scan fix

### Problem

`/lta/scan` only searched direct children of `partagePath` for `MAWB {ref}` folders. When the user provides the root path `\\10.0.0.15\partage\PARTAGE`, direct children are **type subfolders** (`ALIEXPRESS/`, `TEMU HKG/`, `TEMU SPEEDAF/`), not MAWB folders → scan always returns `found: false`.

When the user manually typed the type subfolder path (e.g. `\\10.0.0.15\partage\PARTAGE\ALIEXPRESS`) it worked because MAWB folders are direct children there.

### Solution

Made the scan automatically descend one level into subdirectories when the MAWB folder isn't found at the top level:

1. Try `partagePath` direct children first (existing behavior, fast path)
2. If not found, iterate all subdirectories of `partagePath` and search each for the MAWB folder
3. Stop at first match

Extracted into local `findMawbFolder(searchPath, targetKey)` helper to avoid code duplication.

### Files Modified

- `tyaybi_back/index.js` — `/lta/scan` endpoint: 2-level MAWB search

---

## Session 8 — Free-text currency input + openexchangerates 3rd fallback

### Problem

User may receive an LTA with a currency not in the fixed dropdown (e.g. JPY, TRY, THB). The `<select>` blocked those.

### Solution

**Frontend** (`acheminements/index.jsx`):

- Replaced `<select>` with `<input type="text" list="...">` + `<datalist>` — user can pick from suggestions OR type any ISO code
- Rate fetch only triggers when input is exactly 3 uppercase letters (`/^[A-Z]{3}$/`)
- Input is auto-uppercased

**Backend** (`index.js`):

- Added 3rd fallback: openexchangerates.org cross-rate `(MAD/USD) / (FROM/USD)` using API key `2da90db00995499ea8ff537a94caf80c`
- Full priority chain: **BAM → frankfurter blended → openexchangerates**

### Verified

- `CNY = 1.3599 MAD` (BAM) ✓
- `HKD = 1.1875 MAD` (blended) ✓
- `JPY = 0.065... MAD` (openexchangerates) ✓

### Files Modified

- `tyaybi_back/index.js` — 3-tier fallback exchange rate logic
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — combobox currency input

---

## Session 7 — Switched back to frankfurter.dev v2

### Context

User requested switching back to Frankfurter, using the new v2 API at `api.frankfurter.dev`. The new v2 API supports MAD via Bank Al-Maghrib (BAM) provider — unlike the old `api.frankfurter.app` which was ECB-only.

### Solution

Used the single-pair rate endpoint: `GET https://api.frankfurter.dev/v2/rate/{from}/MAD`
Response: `{ "date": "...", "base": "CNY", "quote": "MAD", "rate": 1.3609 }`. Mapped to `{ rates: { MAD: data.rate } }` to keep frontend unchanged.

### Verified

`GET http://localhost:3000/exchange-rate?from=CNY` → `{ rates: { MAD: 1.3609 } }` ✓

### Files Modified

- `tyaybi_back/index.js` — swapped exchangerate-api.com for api.frankfurter.dev/v2/rate

---

## Session 6 — Exchange Rate API Fix

### Problem

`/exchange-rate` proxy returned 502. Root cause: `frankfurter.app` uses ECB (European Central Bank) data — MAD (Moroccan Dirham) is not in their dataset and never will be.

### Solution

Swapped to `https://api.exchangerate-api.com/v4/latest/{currency}` — free, no API key, supports MAD. Response shape is the same: `{ rates: { MAD: 1.36 } }`. No frontend changes needed.

### Verified

`GET http://localhost:3000/exchange-rate?from=CNY` → `{ rates: { MAD: 1.36 } }` ✓

### Files Modified

- `tyaybi_back/index.js` — swapped frankfurter.app URL for exchangerate-api.com

---

## Session 5 — CORS + Layout Fix (Acheminements)

### Problems

1. **CORS**: `fetch('https://api.frankfurter.app/...')` from `localhost:5173` was blocked — no `Access-Control-Allow-Origin` header from that external API.
2. **Layout conflict**: Material Tailwind `<Input>` + `<Select>` side-by-side in a flex container caused the two controls to visually merge (overlapping borders/labels).

### Solutions

1. Added `/exchange-rate?from={currency}` proxy endpoint to `tyaybi_back/index.js` — server-side `fetch` to frankfurter.app, returns the JSON to the frontend. No CORS headers needed.
2. Replaced Material Tailwind `<Input>`/`<Select>` Fret+Devise row with native `<input>`/`<select>` in a `grid grid-cols-2` layout — clean, independent borders, no style interference. Rate + MAD value moved below the grid.

### Files Modified

- `tyaybi_back/index.js` — added `/exchange-rate` GET proxy (before `/lta/scan`)
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — proxy URL, native input/select, grid layout, removed unused Select/Option imports

---

## Session 4 — Acheminements Feature Recreation

### Context

The Acheminements page and sliceManifest.js were deleted/reverted between sessions. The `/lta/scan` backend endpoint survived. This session recreated all three lost artifacts.

### Solution

1. Read the complete `handleSliceExcel` algorithm from `convertpdf.jsx` (all model variants, NGP switch, split logic, sheet building).
2. Extracted the algorithm as a pure, React-free function `sliceManifest(arrayBuffer, madValueOverride, exclusionWaybills)`.
3. Created the Acheminements page with: PARTAGE path config (localStorage), multi-LTA textarea, per-card PDF iframe viewer, Fret input, Currency dropdown, live MAD calculation (frankfurter.app, debounced), Execute button, per-sheet + bulk download buttons.
4. Added the route to `routes.jsx`.

### Files Created

- `tyaybi_front/src/utils/sliceManifest.js` — pure slice function (~300 lines)
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — full React page (~380 lines)

### Files Modified

- `tyaybi_front/src/routes.jsx` — added Acheminements import + route entry with InboxArrowDownIcon

### Key Architecture Decisions

- `madValueOverride` (fret × rate) overrides `parvaleur` read from cell A4 of the manifest
- `poidbrut` is read FROM the manifest (`jsonData[1][0]`) — no user input needed
- Exchange rate: frankfurter.app, debounced 600ms, shows "rate unavailable" if MAD not in response
- Slice result returned as `{ sheets, mawbValue, parvaleur, position, poidbrut, ... }` — all needed for summary download calculations

---

## Session 3 — Root .gitignore Setup

### Problem

No root-level `.gitignore` existed. The only ignore file was `tyaybi_front/.gitignore` which only covers the frontend subdirectory. This meant `tyaybi_back/node_modules/` (full npm packages), `tyaybi_back/uploads/` (50+ binary multer temp files), `tyaybi_back/*.pdf`, `tyaybi_back/temp.*`, and the stray root-level `Manifeste 607-52839835.xlsx` would all have been committed.

### Solution

Created `.gitignore` at the repo root with:

- `node_modules/` — global, covers both front and back
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` — lock files everywhere
- `*.log` and npm debug logs
- `tyaybi_back/uploads/*` with `!tyaybi_back/uploads/.gitkeep` — preserves folder structure
- `tyaybi_back/*.pdf` and `tyaybi_back/temp.*` — generated/temp output files
- `/*.xlsx`, `/*.xls` — data files at repo root

Created `tyaybi_back/uploads/.gitkeep` so the uploads folder is tracked as empty.

### Verified

`git ls-files --others --exclude-standard tyaybi_back/` confirms: only source files, fonts, and `.gitkeep` are visible — `node_modules/` and all binary uploads are excluded.

**Files changed:** `.gitignore` (new), `tyaybi_back/uploads/.gitkeep` (new)
