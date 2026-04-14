# PROJECT.md — Technical Specification

## What This App Does

This is a **Moroccan customs declaration automation tool** built for a freight forwarding company (Med Africa Logistics). It takes raw airline cargo manifest Excel files (listing waybills, product descriptions, weights, and values from Chinese suppliers), looks up Moroccan NGP (Nomenclature Générale des Produits) tariff codes for each product, and outputs: (1) reformatted multi-sheet Excel files grouped and structured for customs submission, and (2) multiple Moroccan customs PDF documents (DUM — Déclaration Unique de Marchandises, quittance, and other official forms) ready for filing at the customs office.

---

## Business Logic and Core Rules

### Excelslice (Main Page — `convertpdf.jsx`)

1. User uploads a raw manifest Excel file (airline format with columns: waybill number, product description, pieces, total value, weight, etc.).
2. Optionally uploads an **exclusion file** (Excel with a list of waybill numbers to skip).
3. The app reads the manifest starting from row 6 (rows 1–5 are headers/metadata).
4. For each row, it looks up the NGP code by matching the product description (lowercased) against `bddngp.json` using **exact match first, then fuzzy string similarity** (`string-similarity` library).
5. Rows sharing the same waybill number AND same NGP code are **aggregated** (pieces, value, weight summed).
6. Already-seen waybill+NGP combinations and excluded waybills are skipped.
7. Output is split into **two sets of sheets**:
   - **Set 1 (GLOBAL)**: Single consolidated sheet with all items, first row uses a master identifier.
   - **Set 2**: Split into sheets of max 1000 rows each, grouped by recipient name. When the next group of same-named recipients won't fit in the current sheet, a new sheet is started.
8. A USD→MAD exchange rate (`tauxusd`) is applied to convert values if entered.
9. The user can also provide a MAWB (Master Air Waybill) number and flight metadata.
10. The app generates multiple PDF documents for each sheet using **jsPDF + jsPDF-autotable** (client-side):
    - **PDF 1**: Main customs declaration table.
    - **PDF 2**: Summary/recap document.
    - **PDF 3**: Financial breakdown form with majoration (surcharge) and échéance (due dates) fields.
    - **Quittance PDF**: Payment receipt form.
11. A secondary info extraction flow reads a **Word (.docx) or PDF file** (e.g., freight invoice/BL) to auto-populate form fields like gross weight, MAWB, dates.

### Model 5 (`newmodel.jsx`)

1. Accepts a different Excel format where NGP codes already exist in column 15 (index 14).
2. Reads the 2-digit prefix of each NGP code and applies a **hard-coded switch mapping** to a standardized 10-digit `Code NGP(à 10 chiffres)`. This covers chapters 01–96 of the HS nomenclature.
3. Alternatively, if the NGP column is empty, it attempts a fallback lookup against `bddngp.json` (same description→NGP lookup as Excelslice).
4. Identifies and reports **missing NGP rows** (products that couldn't be mapped).
5. Outputs a modified Excel with the mapped NGP codes filled in.

### NGP Database Management (`ngpbdd.jsx`)

1. CRUD interface over the `bddngp.json` file, served via the Express backend (port 3000).
2. Entries: `{ "Désignation commerciale": string, "Code NGP(à 10 chiffres)": number, "TAUX": number }`.
3. Functions: list all, search by designation, add single entry, bulk-add from Excel upload, delete by designation+code, update by designation+code, find duplicate designations.
4. Pagination: 6 items per page, with prev/next controls.

### Authentication

- Login: hardcoded check — `admin@gmail.com` / `12345`. If match, sets `localStorage.token = 1` and redirects to dashboard.
- The `loginservice.js` file also targets an external API at `http://localhost:5000` for real JWT-based login/register, but that backend is not included in this repo and is not currently used by the sign-in form.
- Dashboard layout guard: checks `localStorage.token`; redirects to sign-in if absent.
- Sign-up: calls external API at `http://localhost:5000/register/` (broken — external backend missing).

---

## Data Flow

### Excelslice Flow

```
User uploads manifest.xlsx
  → FileReader reads ArrayBuffer
  → XLSX.read() parses to JSON rows
  → bddngp.json loaded as static import (ngpMap dict built once)
  → For each row (starting row 6):
      - Look up NGP by description key in ngpMap (exact lowercase match)
      - If not found, fallback: stringSimilarity.findBestMatch()
      - Aggregate pieces/value/weight for same waybill+NGP
  → Build newdata[] array of deduplicated rows
  → Build slicedSheets[] (GLOBAL + per-1000 splits)
  → ExcelJS.Workbook → format cells with borders/styles → save to Blob
  → FileSaver.saveAs() downloads .xlsx
  → For each sheet, user can click generate PDF buttons
  → jsPDF generates customs PDF docs in browser, downloads via saveAs
```

### NGP Lookup Flow

```
Frontend (convertpdf.jsx, newmodel.jsx)
  → static import of bddngp.json (bundled into app)

Frontend (ngpbdd.jsx) — for CRUD management
  → axios GET/POST/PUT/DELETE → http://localhost:3000
  → Express reads/writes ../tyaybi_front/src/pages/dashboard/clients/bddngp.json
```

### Excel→PDF Backend Flow (currently unused in main UI)

```
POST /upload with multipart Excel file
  → multer saves to uploads/
  → convertExcelToPdf() (converter.js):
      - ExcelJS reads .xlsx
      - pdf-lib creates PDF with NotoSans/NotoSansArabic fonts
      - Renders each cell as rectangle + text, auto-detects Arabic vs Latin
      - Appends "Total Value DDP" and "Freight Included" totals
  → returns PDF binary as attachment
  → uploaded file deleted from uploads/
```

### Client Management Flow (partial/broken)

```
Frontend clientservices.js
  → axios → http://localhost:5000 (external Django/FastAPI backend, not in repo)
  → /clients/ [GET, POST], /clients/{id}/ [PUT, DELETE], /clients/show/{id}/
```

---

## Entities and Models

### NGP Entry (primary data entity)

```json
{
  "Désignation commerciale": "string — product description in French/English",
  "Code NGP(à 10 chiffres)": "integer — 10-digit Moroccan HS tariff code",
  "TAUX": "number — customs duty rate (percent)"
}
```

Stored in: `tyaybi_front/src/pages/dashboard/clients/bddngp.json` (static import + backend CRUD)

### Shipment Row (transient, from uploaded Excel)

```
waybill_number, description, pieces, total_value_MAD, weight_kg, hawb, recipient_name, ...
```

Columns: `Identifiant unique`, `N° ordre`, `Nombre Contenants`, `Type Contenant`, `Marque (N° Envoi)`, `Code NGP`, `Désignation commerciale`, `Pays d'origine`, `Indicateur de Paiement`, `Indicateur Occasion`, `Valeur`, `Devise`, `Quantité Article`, `Unité de mesure`, `Poids net`, `Quantité normalisée`, `Code Référence Accord`, `Code Référence Franchise`, `Nom et Prénom`, `CIN`, `Carton or bag N°`, `HAWB`

### Client (external entity, via port 5000)

```json
{
  "raison_sociale": "string",
  "responsable": "string",
  "email": "string",
  "adresse": "string",
  "telephone": "string"
}
```

### num.json (MAWB tracking)

Tracks which MAWB+sheet combinations have been processed, with sequential code numbers (`codecpmt`, `codecpmt2`) for customs registration numbering. Format:

```json
{
  "codecpmt": number,
  "codecpmt2": number,
  "archive": [{ "name": "Mawb ...", "sheet": "Sheet N", "code": number, "code2": number }]
}
```

### PDF Form Data (transient, user-entered)

**DUM Form**: `{ poidBrute, date, city, time, colis, Numenregistrement, cityAbbrev, numtitre, country, countryAbbrev, exportateur, phrasecolis, codeqr }`
**PDF3 (financial)**: `{ date1-5, time, code, ben, drp, codeem, codees, majoration1-4, echeance1-4 }`

---

## Session and Auth Logic

- **No real session management**. Authentication is purely via `localStorage.token`.
- The token value is literally `1` (integer) when logged in with the hardcoded admin account.
- `Dashboard` layout checks for the token on mount and on every re-render; redirects to `/auth/sign-in` if absent.
- No token expiry, no role-based access (the `userRole` state in `dashboard.jsx` is initialized to `0` and never updated).
- The `loginservice.js` is imported in `sign-up.jsx` but the `login()` function targets the non-existent external backend.

---

## External APIs and Services

| Service                     | URL                     | Status      | Used for                            |
| --------------------------- | ----------------------- | ----------- | ----------------------------------- |
| Express backend (this repo) | `http://localhost:3000` | Active      | NGP CRUD, Excel→PDF conversion      |
| External backend            | `http://localhost:5000` | **Missing** | Auth (JWT), client CRUD, statistics |

### Backend API Endpoints (port 3000)

```
GET    /data                          — Get all NGP entries
GET    /data/filter?designationCommerciale=  — Search NGP by description
GET    /data/filterDuplicates         — List duplicate NGP entries
POST   /data                          — Add single NGP entry
DELETE /data                          — Clear all NGP entries
DELETE /data/delete                   — Delete by designation + codeNGP
PUT    /data/update                   — Update by designation + codeNGP
POST   /upload                        — Upload Excel, convert to PDF (returns binary)
POST   /uploadJsonData                — Upload Excel, bulk-add to bddngp.json
```

### External Backend API (port 5000, not in repo)

```
POST   /login
POST   /register/
POST   /logout/
GET    /clients/
POST   /clients/
GET    /clients/show/{id}/
PUT    /clients/{id}/
DELETE /clients/{id}/
```

---

## Key Business Domain Notes

- This app is specific to **Moroccan customs (ADII — Administration des Douanes et Impots Indirects)**.
- NGP = Nomenclature Générale des Produits = Morocco's implementation of the HS (Harmonized System).
- DUM = Déclaration Unique de Marchandises = the official Moroccan customs declaration form.
- Shipments come from **China** via air freight, transiting through Middle East hubs (Dubai, Doha, Riyadh, Abu Dhabi, Jeddah).
- The company (Med Africa Logistics) is located at "195 BD EMILE ZOLA 7EME ETAGE N21 CASABLANCA".
- N° d'agrément: 1633, ICE: 000230731000088.
