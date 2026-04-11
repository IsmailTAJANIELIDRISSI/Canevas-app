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
Rate is cached per currency per page session. MAD = round(fret * rate).

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

