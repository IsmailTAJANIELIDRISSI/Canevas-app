# Change Log

_Populated as we work. Each entry = problem + solution + files changed._

---

## Session 32 — Block LTA whose files' ref ≠ folder ref

### Problem
A folder `MAWB 235-96139503` sometimes contains files for a DIFFERENT LTA
(`MAWB 235-96139035.pdf`, `Manifeste 235-96139035.xlsx` — transposed digits).
The wrong manifest/MAWB would be processed silently.

### Solution
- `POST /lta/scan` now extracts the ref (`\d{2,4}-\d{4,}`) from each xlsx/pdf
  filename and compares it (zero-normalized) to the folder's ref. On mismatch it
  returns `refMismatch:true` + a French warning naming the offending file(s), and
  logs `[scan] REF MISMATCH …`.
- Frontend: card shows a **red** critical banner ("Référence incohérente.");
  `handleExecute` blocks single slicing with an alert; bulk "Découper tous" skips
  mismatched cards (they're visibly flagged) so no alert stalls the run.

### Files Modified
- `tyaybi_back/index.js` — scan: per-file ref check + `refMismatch` flag
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — card state, scan
  mapping, red banner, execute block, bulk skip

---

## Session 31 — Scan: match LTA folder despite leading-zero differences

### Problem
Scanning `157-00067174` returned `found:false` even though the folder existed —
it was named `MAWB 157-0067174` (**one fewer leading zero** than the typed ref).
The exact-string folder match failed on that zero difference.

### Solution
- `POST /lta/scan` now normalizes both the ref and folder names by stripping
  **leading zeros from each digit group** (`157-00067174` and `157-0067174` both
  → `157-67174`), then matches. Also added a containment fallback (folder name
  merely *contains* the ref) and full `[scan]` console+log-file diagnostics
  (targetKey, every folder scanned, match/no-match).
- Files inside the matched folder are still picked by extension, so mismatched
  filename zeros don't matter once the folder is found.

### Files Modified
- `tyaybi_back/index.js` — scan folder matcher: zero-normalization, containment
  fallback, `[scan]` logging via `appendLtaLog`

---

## Session 30 — Manifest validation step before DUM slicing

### Problem
Corrupted/malformed manifests were sliced silently, producing wrong DUMs — e.g.
a manifest whose row-3 "Positions" count didn't match the real number of waybills
went through unnoticed.

> ⚠️ First attempt was lost: the changes were uncommitted and `Tyaybi_app.bat`'s
> `git reset --hard origin/ismail` + `git clean -fd` wiped them on next launch.
> Re-implemented and committed/pushed to `ismail` this time.

### Solution
New pre-slice validator `tyaybi_front/src/utils/validateManifest.js` returning
`{ status: PASS|WARNING|BLOCKED, file, summary, issues[] }`:
- **Structural (BLOCKER)**: detects the header row (searches rows 3–6); the slicer
  requires it at row 5 (index 4) — if elsewhere, one clear `structure_shifted`
  message. MAWB/Pcs/Positions metadata lines; exact 13-column header match; data
  truncation (slicer stops at first non-mad/usd currency — flags real data dropped
  after the stop; a lone trailing terminator is NOT flagged).
- **Cross-consistency (BLOCKER)**: declared Positions == distinct Waybills;
  declared Pcs == distinct "Carton or bag N°".
- **Field-level (aggregated, WARNING; escalates to BLOCKER if >10% of rows)**:
  Pieces int>0, Value/Weight num>0, hs Code 10 digits, Phone 9–10 digits, required
  non-null fields, ambiguous-comma numbers, per-row currency.
- **WARNING**: duplicate rows, within-waybill inconsistency, weight-sum sanity.

Integration in `handleExecute`: validate before slicing. BLOCKED → red panel, no
generation. WARNING → amber panel + explicit "continuer quand même" button.
PASS → slice automatically.

### Files Modified
- `tyaybi_front/src/utils/validateManifest.js` — new validator
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — validate in
  handleExecute, `ManifestValidationPanel`, card `validation` state, confirm flow

### Follow-up — normalized header comparison + per-cell errors
Header check was exact-string, so a valid manifest differing only by case/spacing
was wrongly blocked (and unhandled paths could crash the slicer). Now:
- Headers compared after normalization (`replace(/\s+/g,' ').toLowerCase()`), so
  `" Pieces "`, `"PIECES"`, `"hs  code"` all pass.
- On real mismatch (missing/renamed/reordered) each bad column reports its exact
  cell: `Cellule D5 : attendu « Pieces », trouvé « Value ».` — never crashes.
- Non-empty columns beyond the 13 expected → WARNING (`extra_column`), not a block.
- Header-row detection also normalized. Added `colLetter()` (0→A … 26→AA).

### Follow-up — malformed numeric cells + comma-decimal support
Manifests use comma decimals (`7,03` = 7.03). Two fixes:
- `toNum` now accepts a single decimal separator (comma OR dot) + spaces as
  thousands, so `"7,03"` is valid and never false-flags a text-stored decimal.
- Genuinely illegible numeric cells — garbage (`#*****`) or multi-separator
  (`11,5,451145`) — are now a hard **BLOCKER** (`malformed_number`) naming the
  exact cell (e.g. `E7`), regardless of count (one NaN corrupts the slice math).
  Empty/zero/non-integer stay softer per-column WARNINGs. Dropped the old broad
  `ambiguous_number` check (it false-flagged every comma decimal).

### Follow-up — skip phone check for AliExpress
AliExpress phones are in international format (`00212622511266`), not the 9–10
digit local form, so the phone check was wrongly BLOCKING those manifests.
Schemas can now carry per-format check overrides; AliExpress sets
`checkPhone: false`, so phone length isn't validated for that schema (the check
still applies to Standard/TEMU). The matched schema is captured as
`activeSchema` and consulted in the row loop.

### Follow-up — third header schema (Connote) with shifted columns
A Connote-type manifest uses a different layout with an extra `Sender Ref.`
column, shifting the data columns:
`Currency | Connote # | Sender Ref. | Piece Goods Descriptions | Piece | Value |
Receiver Town | Contact | Receiver | Sender | Phone | Weight | Bag Number | HS Code`
(Value→F/5, Weight→L/11, HS Code→N/13). Each `SCHEMAS` entry now carries its own
`col` (column→index) map; the validator uses the **matched schema's** map for all
data checks (`const C = activeSchema.col`), so shifted columns are validated at the
right positions. Header-row detection changed to `Currency` + `Value` (common to
all schemas, since Connote has neither "Waybill Number" nor "Description of Goods").

### Follow-up — second header schema (AliExpress)
AliExpress LTAs use a variant header row:
`… Receiver Name | Shipper Company | Phone | Weight | Carton or bag N° | HSCODE | HAWB`
(vs TEMU's `… Company | … | hs Code`). The validator now matches against a list
of `SCHEMAS` (Standard TEMU + AliExpress); a manifest passes if it matches **any**
schema (normalized). Data columns are read by the same indices (0–12) in both, so
the slicer is unaffected; the AliExpress `HAWB` (col N) no longer trips the
extra-column check. On a real mismatch, per-cell errors are reported against the
**closest** schema and list the accepted formats.

### ⚠️ To verify
Test with a manifest that CURRENTLY slices correctly. If it flags
`structure_shifted`, the real header row isn't index 4 → adjust `HEADER_ROW`
(repo sample 607-52839835 has headers at row 4).

---

## Session 29 — Email draft reuses the original acheminement subject (Outlook COM)

### Problem
The "Envoyer par email" / "Envoyer tous les canevas" drafts always used the
subject `Canevas de MAWB <ref>`. The team instead wants the draft to carry the
**subject of the original acheminement email** that Abdelhak TACHRIFY
(`abdelhak.tachrify@medafrica-log.com`) sent for that LTA — e.g.
`3éme Acheminement Express (TM Spdf) DS Combiné###…###`.

### Solution
Extended the PowerShell Outlook COM automation in `POST /lta/open-email-draft`.
Searches the current user's **Inbox (recursively)**:
- `Restrict` to acheminement emails (`subject LIKE '%Acheminement%'`).
- A candidate matches THIS LTA if the ref appears in the **subject OR in an
  attachment filename** (e.g. `MAWB 235-98097311.pdf`) — trying both the ref
  as-is (`072-…`) and with the leading zero stripped (`72-…`). **Key learning:
  Abdelhak TACHRIFY's email has no ref in the subject — only in the attached
  PDF's name** (which is why Outlook's own search finds it). Subject-only
  matching missed it entirely.
- Prefers the candidate from **Abdelhak TACHRIFY**; otherwise uses the first
  ref-matching acheminement email (e.g. the DS team's
  `DS MEAD LTA <ref> // 4éme Acheminement…`).
- The chosen subject is cleaned: a leading `… // ` prefix is stripped so the
  draft subject is just `4éme Acheminement Express (TM Spdf)…`.
- Falls back to `Canevas de MAWB <ref>` when nothing matches.
- Applies to both single and bulk send (both call this endpoint).
- **Logging**: the PS script now `Write-Host`s every step (variants searched,
  each subject-match with folder+sender+subject, folders-scanned/match counts,
  final subject). Node captures the PS stdout/stderr and writes it to the
  console **and** the daily LTA log via `appendLtaLog`, so an empty result is
  diagnosable (wrong folder / subject format / sender mismatch).

### Follow-up — Display() COM crash on temp/lock files
Intermittent `$mail.Display()` failure: `Index de la matrice en dehors des
limites` (array index out of bounds, COMException). Cause: the folder sometimes
contains an Excel **lock/temp file** (`~.xlsx`, `~$foo.xlsx`) when a DUM is open;
`Attachments.Add` fails on it and destabilizes the draft. Fixes:
- Node attachment list now skips `~*` and dotfiles (never attach lock files).
- PS now `$mail.Save()`s first, wraps `Display()` in try/catch, retries once via
  `$mail.GetInspector.Display()` after 800ms; the draft is saved to Drafts either
  way so it's never lost.

### Bug found via logging — .ps1 encoding
The captured PS output showed the script **failed to parse entirely**
(`L'opérateur «<» est réservé…`, unexpected `}` tokens). Root cause: the file
was written as **BOM-less UTF-8**, which Windows PowerShell 5.1 reads as ANSI
(cp1252) — mangling em-dashes/accents into characters PS treated as string
delimiters. Fix: write the `.ps1` with a **UTF-8 BOM**
(`String.fromCharCode(0xFEFF) + psScript`) so PS reads it as UTF-8, and keep the
generated script **pure ASCII** (no em-dashes/`>>>`/`<ref>`). This also fixes
accented attachment paths (e.g. `C:\Users\Nouhaila\…`).

### Files Modified
- `tyaybi_back/index.js` — `open-email-draft`: mailbox subject lookup in the
  generated `.ps1` (ref-with/without-leading-zero + sender filter + fallback),
  full search logging captured from PowerShell output, and UTF-8-BOM/ASCII fix

---

## Session 28 — Warn when an LTA folder has no manifest Excel

### Problem
Typing ref `235-96139083` returned a card with no feedback: the folder had a
MAWB PDF but **no manifest Excel (.xlsx)**. The DUM slicing needs the manifest,
so the LTA silently can't be processed with no explanation.

### Solution
- Scan endpoint now collects warnings in an array and adds a **critical** warning
  when `xlsxFile` is missing (`manifestMissing: true`), alongside the existing
  MAWB-PDF warnings. Multiple issues are joined into one message.
- Frontend card shows the warning banner in **red** (critical) when the manifest
  is missing, **amber** otherwise, with a matching label
  ("Manifeste manquant." vs "PDF MAWB manquant.").

### Files Modified
- `tyaybi_back/index.js` — scan: warnings[] + `manifestMissing` flag
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — card state,
  scan mapping, red/amber warning banner

---

## Session 27 — Gestion BDD: backup download + JSON sync (model_five / Supabase)

### What was added
Two features in the model_five "Gestion BDD" tab (now backed by Supabase, not the
old Express `bddngp.json`):

1. **💾 Télécharger la base** — downloads the entire NGP database as a JSON backup
   named `bddngp-YYYY-MM-DD.json`, in the `{ "Feuil1": [...] }` shape (internal `id`
   stripped) so a backup can be fed straight back into "Synchroniser".
2. **🔄 Synchroniser la base** — user picks a JSON file (e.g. `docs/bddngp.json`);
   the app persists **only elements not already present**. Existing rows (matched on
   normalized designation + code) are skipped; the toast reports added / already-present
   / invalid counts.

### Implementation
- New serverless endpoint `api/data/sync.js`: loads all existing keys via `fetchAll`,
  filters incoming items to new + valid + batch-deduplicated, bulk-inserts in chunks of
  500. Dedup key = `designation.toLowerCase().trim() + '|||' + code` (same as everywhere).
- `BddNgp.jsx`: `handleDownloadDb` (client-side blob download) and `handleSync` (parse
  JSON file → POST `/data/sync`), plus two buttons in the filter bar.

### Files Modified
- `model_five/api/data/sync.js` — new endpoint (insert-only-new)
- `model_five/src/BddNgp.jsx` — download + sync handlers, two buttons, state/refs

---

## Session 26 — Copy MAWB PDF to output folder alongside manifest Excel

### Problem
"Enregistrer tout — Bureau/Canevas" was copying the manifest Excel from PARTAGE
but NOT the MAWB PDF file. User wanted the PDF copied too.

### Solution
Same `fs.copyFileSync` pattern as the manifest:
- Scan endpoint now also computes and returns `pdfSrcPath` (full disk path to the PDF)
- `generate-and-save` destructures `pdfSrcPath` + `pdfName`, copies PDF as step 0b
- Frontend stores `pdfSrcPath` in card state and passes it in both save calls

### Files Modified
- `tyaybi_back/index.js` — scan returns `pdfSrcPath`; generate-and-save copies PDF
- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — card state + both fetch calls

---

## Session 25 — Gestion BDD tab in model_five standalone app

### What was added

Added a full "Gestion de BDD" section to the standalone `model_five` Vite app so
users can manage the NGP database from their iPad, without accessing the main tyaybi_app.

### Architecture

- **`model_five/server/`** — new Express backend (port 3001) with `bddngp.json`
  as file-based storage. Routes: GET /data, GET /data/filter, GET /data/filterDuplicates,
  POST /data, PUT /data/update, DELETE /data/delete, POST /uploadJsonData (Excel import).
- **`model_five/src/App.jsx`** — rewritten to own a shared Header with tab navigation
  (Traitement | Gestion BDD) and logout. Model5 and BddNgp are rendered below it.
- **`model_five/src/BddNgp.jsx`** — mobile-first card list with sticky search bar,
  filter-duplicates, Excel import, pagination, edit and delete per card, FAB "+" button.
- **`model_five/src/AddMarchandise.jsx`** / **`UpdateMarchandise.jsx`** — bottom-sheet
  modals for adding and editing entries.
- **`model_five/src/api.js`** — fetch wrappers; uses `VITE_API_URL` env var so frontend
  works against local dev server or a Render deployment.
- **`model_five/.env.example`** — documents VITE_API_URL for deployment.

### Also fixed

- `model_five/src/Model5.jsx` — removed its own duplicate `<header>` (now App.jsx owns it),
  removed `onLogout` prop from function signature.

### Files Modified / Created

- `model_five/src/App.jsx` — shared Header with tabs
- `model_five/src/Model5.jsx` — stripped standalone header
- `model_five/src/BddNgp.jsx` — new
- `model_five/src/AddMarchandise.jsx` — new
- `model_five/src/UpdateMarchandise.jsx` — new
- `model_five/src/api.js` — new
- `model_five/server/index.js` — new Express backend
- `model_five/server/package.json` — new
- `model_five/server/bddngp.json` — copied from src/bddngp.json
- `model_five/.env.example` — new

---

## Session 24 — Model 5 page audit (read-only)

No code changed. Full behaviour documented in TASKS.md.

---

## Session 23 — Copy manifest Excel into Bureau/Canevas output folder

### Problem

"Découper tous" and "Enregistrer tout — Bureau/Canevas" saved DUM sheets, summary,
and generated Excel but did NOT copy the original manifest Excel file into the folder.
Users had to manually find and move it.

### Solution

- **Frontend** (`acheminements/index.jsx`): both `handleBulkDownloadAll` and
  `handleSaveToFolder` now pass `manifestB64` and `manifestName` from the card
  alongside the existing `sliceResult` payload.
- **Backend** (`index.js` `/lta/generate-and-save`): destructures `manifestB64`
  and `manifestName` from the request body. If present, decodes the base64 string
  and writes the file as step 0 (before summary/generated sheets), using the
  original filename. The progress `total` count is adjusted accordingly (+1).

### Files Modified

- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — `handleBulkDownloadAll`
  and `handleSaveToFolder` include `manifestB64` + `manifestName` in the POST body
- `tyaybi_back/index.js` — `/lta/generate-and-save` writes manifest file as first step

---

## Session 22 — Retry Gemini Vision calls on 429/503 (quota/overload) errors

### Problem

In a multi-LTA batch scan, the last LTAs were failing extraction
(`method=scanned-pdf`, currency=null, fret=null) because `gemini-2.5-flash`'s
free-tier limit (5 requests/minute) was exhausted partway through the scan,
returning `429 RESOURCE_EXHAUSTED`. `gemini-2.0-flash` also returned 429 (0 quota
on this key's tier). With no retry, the function gave up immediately on both
models for those LTAs.

### Solution

Added retry-with-delay helpers in `tyaybi_back/index.js`, right before
`supplementCurrencyFretViaVision`:

- `GEMINI_MAX_ATTEMPTS = 3`, `GEMINI_DEFAULT_RETRY_MS = 5000`
- `sleep(ms)` — promise-based delay
- `parseGeminiRetryDelayMs(message)` — extracts Google's requested
  `"retryDelay":"21.2s"` (or `"retry in 21.2s"`) from the error message and
  returns that delay + 1s buffer in ms, or `null` if not present
- `isRetryableGeminiError(message)` — true for `RESOURCE_EXHAUSTED` (429) or
  `UNAVAILABLE` (503)

`supplementCurrencyFretViaVision` now wraps each model's call in an inner
attempt loop (1..`GEMINI_MAX_ATTEMPTS`). On a retryable error it waits
`parseGeminiRetryDelayMs(e.message) ?? GEMINI_DEFAULT_RETRY_MS * attempt` before
retrying the same model; on a non-retryable error (or after the last attempt)
it breaks and falls through to the next model fallback. Only returns
`{ mawbCurrency: null, fretValue: null }` after every model/attempt combination
has been exhausted.

### Files Modified

- `tyaybi_back/index.js` — added retry helpers + wrapped
  `supplementCurrencyFretViaVision`'s model loop with a per-model attempt loop

---

## Session 21 — Fix `pdf-parse` v2 API (regex extraction was always failing)

### Problem

Daily logs (Session 20) revealed `extractMawbMeta error: pdfParse is not a function`
on every LTA — `pdf-parse@2.4.5` replaced the old callable-function export with a
`PDFParse` class. Regex extraction never ran, so every PDF fell through to Gemini
Vision, hitting 503 (server overload, transient) and 429 (free-tier quota = 0 for
`gemini-2.0-flash`) errors.

### Solution

`extractMawbMeta` now uses the v2 API:
```js
const { PDFParse } = require("pdf-parse");
const parser = new PDFParse({ data: buf });
const result = await parser.getText();
await parser.destroy();
const text = result.text;
```
Verified against a generated PDF — text extracts correctly, regex can now find
currency/fret without needing the Gemini fallback for normal text-based MAWBs.

### Files Modified

- `tyaybi_back/index.js` — `extractMawbMeta` uses `PDFParse` class instead of
  calling `pdf-parse` as a function

---

## Session 20 — Daily MAWB extraction logs grouped by LTA reference

### Problem

Some LTAs' MAWB PDFs weren't getting currency/fret auto-filled, but the only debug
output (Session 19's `[mawb-extract]` logs) went to the console, which is hard to
review after the fact and not grouped per LTA.

### Solution

- Added `tyaybi_back/logs/` (gitignored), created on startup via `fs.mkdirSync`.
- New helpers in `index.js`: `dailyLogFileName()` (returns `DD-MM-YYYY.logs`) and
  `appendLtaLog(ref, lines)` which appends a `[timestamp] LTA ref {ref} :` block
  followed by the collected log lines.
- `extractMawbMeta` and `supplementCurrencyFretViaVision` now accept a `log`
  callback (default `console.log`) instead of calling `console.log`/`console.error`
  directly.
- In `/lta/scan`, each ref gets its own `logLines` array fed to a `log()` function
  that both prints to console AND collects lines; after extraction, `appendLtaLog`
  writes the block to today's log file (e.g. `tyaybi_back/logs/11-06-2026.logs`).

### Files Modified

- `tyaybi_back/index.js` — `LOGS_DIR`, `dailyLogFileName`, `appendLtaLog`,
  `log` callback plumbing in extraction functions and `/lta/scan`
- `.gitignore` — added `tyaybi_back/logs/`

---

## Session 19 — Gemini Vision fallback for MAWB currency/fret extraction

### Context

`/lta/scan` already extracted `mawbCurrency`/`fretValue` from the MAWB PDF via regex
(`extractMetaFromPdfText`) and the frontend already auto-filled the Devise/Fret inputs
from those values (user just verifies/corrects with their eyes). Regex-only extraction
fails on scanned PDFs (no text layer) and on text PDFs where pdf-parse flattens the
"Total Prepaid" layout away.

### Solution

- Added `supplementCurrencyFretViaVision(pdfBuffer)` in `tyaybi_back/index.js` — sends
  the raw PDF bytes to Gemini (`gemini-2.5-flash` → `gemini-2.0-flash` fallback) asking
  only for `currency` + `total_prepaid`, with the same OCR/decimal-correction guards as
  the reference implementation (strip thousands separators, reinsert missing decimal
  point for integer-only responses).
- `extractMawbMeta` now calls this fallback whenever regex left `mawbCurrency` or
  `fretValue` null (covers both scanned PDFs and incomplete text extraction). `method`
  field reflects `text-extraction` / `scanned-pdf` / `text+vision` / `vision` / `error`.
- Added `tyaybi_back/.env` (gitignored) with `GEMINI_API_KEY`, loaded via
  `require("dotenv").config({ quiet: true })` at the top of `index.js`.
- Installed `dotenv` in `tyaybi_back/package.json`.

### Files Modified

- `tyaybi_back/index.js` — dotenv config, `GEMINI_MODEL_FALLBACKS`,
  `supplementCurrencyFretViaVision`, updated `extractMawbMeta`
- `tyaybi_back/package.json` — added `dotenv`
- `tyaybi_back/.env` — new (gitignored), `GEMINI_API_KEY`
- `.gitignore` — added `.env`

---

## Session 18 — blocageUsdRate made optional

### Problem

Mode BLOCAGE required "Taux USD → MAD (Badr)" even when the freight is already in a non-USD currency or when the user only wants to exclude HAWBs. The alert blocked execution.

### Solution

- Removed the mandatory check on `blocageUsdRate` — only validate format if the user typed something
- `tauxusdOverride` is passed as `null` when left empty (sliceManifest falls back to D4 from the manifest)
- Label updated to show "(optionnel)"

### Files Modified

- `tyaybi_front/src/pages/dashboard/acheminements/index.jsx` — validation + tauxusdOverride + label

---

## Session 17 — PDF Nombre Contenants 0 → blank fix

### Problem

`sheetRowsToPdf` in `index.js` used `cell != null ? String(cell) : ""` for data cell text.
This rendered `0` as `"0"` in the PDF column "Nombre Contenants".

Old `converter.js` uses `cell.value ? cell.value.toString() : ""` — JavaScript falsy check — so `0` renders as `""` (blank), matching the old behavior.

### Solution

Changed data row cell text resolution in `sheetRowsToPdf` to `cell ? String(cell).trim() : ""` — same falsy semantics as `converter.js`.
Excel keeps `0` (correct for xlsx), PDF now shows blank (correct for PDF).

### Files Modified

- `tyaybi_back/index.js` — `sheetRowsToPdf` data row cell text check

---

## Session 16 — Summary header naming fix

### Problem

`buildSummaryDataXL` in `tyaybi_back/index.js` used wrong column names:

- `"Total Quantite"` → should be `"Total Pieces"`
- `"Total fret"` → should be `"Total freight"`
- `"Total position"` → should be `"total position"`

Original `convertpdf.jsx` line 1282 is the source of truth.

### Solution

Fixed all three headers in `buildSummaryDataXL` to match `convertpdf.jsx` exactly.

### Files Modified

- `tyaybi_back/index.js` — `buildSummaryDataXL` header row

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
