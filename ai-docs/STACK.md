# STACK.md — Tech Stack and Conventions

## Languages and Runtimes

| Layer | Language | Runtime |
|---|---|---|
| Frontend | JavaScript (JSX) | Node.js 20+ (build only) |
| Backend | JavaScript (CommonJS) | Node.js 20+ |

No TypeScript. No type annotations in use (despite `@types/*` devDependencies in frontend).

---

## Frontend Stack (`tyaybi_front/`)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI component framework |
| Vite | 4.x | Build tool and dev server |
| React Router DOM | 6.17.0 | Client-side routing |
| Material Tailwind | 2.1.4 | UI component library (buttons, cards, dialogs, inputs) |
| Tailwind CSS | 3.3.4 | Utility-first CSS |
| Heroicons | 2.0.18 | SVG icon set (used in sidebar/navbar) |
| XLSX (SheetJS) | 0.18.5 | Client-side Excel parsing (read raw manifest files) |
| ExcelJS | 4.4.0 | Client-side Excel generation (write formatted output files with styles/borders) |
| jsPDF | 2.5.1 | Client-side PDF generation (customs declaration forms) |
| jsPDF-autotable | 3.8.2 | Table rendering plugin for jsPDF |
| @react-pdf/renderer | 3.4.4 | Alternative React-based PDF rendering (imported but usage unclear) |
| pdf-lib | — (backend) | Used in backend converter.js only |
| pdfjs-dist | 4.8.69 | Client-side PDF reading/parsing (to extract info from uploaded PDFs) |
| mammoth | 1.8.0 | Client-side Word (.docx) file parsing (to extract customs info) |
| axios | 1.7.2 | HTTP client for API calls to local backends |
| file-saver | 2.0.5 | `saveAs()` to trigger browser downloads of generated files |
| string-similarity | 4.0.4 | Fuzzy string matching for NGP code lookup when exact match fails |
| moment | 2.30.1 | Date formatting/manipulation |
| sweetalert | 2.1.2 | Confirmation and alert dialogs (`swal()`) |
| jwt-decode | 4.0.0 | Decode JWT tokens from external auth backend (imported but not actively used) |
| apexcharts / react-apexcharts | 3.44.0 / 1.4.1 | Charts on the Home dashboard page |
| bootstrap | 5.3.3 | Included but minimal usage (Material Tailwind handles most styling) |
| sheetjs-style / xlsx-style | 0.15.8 / 0.8.13 | Excel cell styling (partially duplicates ExcelJS capabilities) |
| prop-types | 15.8.1 | Runtime prop type checking for React components |

---

## Backend Stack (`tyaybi_back/`)

| Technology | Version | Purpose |
|---|---|---|
| Express | 4.19.2 | HTTP server and REST API |
| multer | 1.4.5-lts.1 | Multipart file upload handling |
| ExcelJS | 4.4.0 | Read uploaded Excel files server-side |
| pdf-lib | 1.17.1 | PDF creation and manipulation |
| @pdf-lib/fontkit | 1.1.1 | Custom font embedding in PDFs |
| fontkit | 2.0.2 | Peer dependency for font handling |
| pdfkit | 0.15.0 | Alternative PDF generation (used in `puper.js` for DUM form prototype) |
| puppeteer | 23.4.1 | Headless browser (installed but appears unused in production routes) |
| cors | 2.8.5 | CORS headers for cross-origin frontend requests |
| body-parser | 1.20.2 | Parse JSON and URL-encoded request bodies |

---

## Folder Structure

### Frontend (`tyaybi_front/src/`)
```
src/
├── App.jsx                  — Root router: /dashboard/* and /auth/*
├── main.jsx                 — React entry point, wraps with MaterialTailwindControllerProvider
├── routes.jsx               — Route definitions array (path + component + icon)
│
├── context/
│   └── index.jsx            — Global UI state: sidenav open/close, sidenav type/color,
│                              navbar transparency, configurator visibility. Uses React.useReducer.
│
├── layouts/
│   ├── dashboard.jsx        — Dashboard shell: Sidenav + DashboardNavbar + nested routes.
│   │                          Also token guard (redirect to sign-in if no token).
│   └── auth.jsx             — Minimal auth shell with Navbar and route rendering.
│
├── pages/
│   ├── auth/
│   │   ├── sign-in.jsx      — Login form. Hardcoded admin@gmail.com/12345 → localStorage.token=1
│   │   └── sign-up.jsx      — Register form. Calls external API at localhost:5000 (broken).
│   └── dashboard/
│       ├── home.jsx         — Stats dashboard with KPI cards and charts. Calls external API
│       │                      (stats functions undefined → broken).
│       ├── notifications.jsx — Boilerplate alerts page from template, not used for real notifs.
│       ├── clients/
│       │   ├── convertpdf.jsx      — *** ACTIVE MAIN PAGE *** Exports `Clients`.
│       │   │                         Full customs document generator (Excelslice route).
│       │   ├── newmodel.jsx        — Model 5 feature: Maps NGP prefix codes to full codes.
│       │   ├── clients.jsx         — Legacy/alternate Excel slicer. Exports `ExcelToPdfConverter`.
│       │   │                         Imported in routes.jsx but not placed in any route.
│       │   ├── addclient.jsx       — Dialog to add client via external API (port 5000).
│       │   ├── updateclient.jsx    — Dialog to update client via external API (port 5000).
│       │   ├── bddngp.json         — *** PRIMARY DATABASE *** NGP lookup dictionary.
│       │   │                         Structure: { "Feuil1": [{ "Désignation commerciale", "Code NGP(à 10 chiffres)", "TAUX" }] }
│       │   ├── num.json            — MAWB tracking archive with sequential code numbers.
│       │   ├── Ngpbdd.json         — Alternate/larger NGP database (not imported anywhere currently).
│       │   ├── archive.js          — Old version of Clients component (v1). Unused.
│       │   ├── archiveee2.jsx      — Old version of Clients component (v2). Unused.
│       │   ├── archivelastupdate.jsx — Old version (v3). Unused.
│       │   ├── sortieupdate.jsx    — Old version (v4). Unused.
│       │   ├── archive_model5.jsx  — Old version of Newmodel (archive). Unused.
│       │   ├── test.jsx            — Dev copy of convertpdf.jsx. Exports `Clientss`.
│       │   │                         Imported in routes.jsx but not placed in any route.
│       │   └── test2.jsx           — Standalone PDF parser test component. Not used.
│       └── ngpbdd/
│           ├── ngpbdd.jsx          — NGP database CRUD management page.
│           ├── addmarchandise.jsx  — Dialog to add new NGP entry.
│           └── updatemarchandise.jsx — Dialog to update existing NGP entry.
│
├── services/
│   ├── envirenment.js       — axios instance for external backend: baseURL=http://localhost:5000
│   ├── clientservices.js    — CRUD API calls to /clients/ (external, port 5000)
│   ├── loginservice.js      — login/register/logout API calls (external, port 5000) — not used by sign-in form
│   └── ngpservice.js        — CRUD API calls to /data (Express backend, port 3000)
│
├── data/
│   ├── statistics-cards-data.js — Calls undefined functions (getnombreprojets, etc.) — broken
│   ├── statistics-charts-data.js — Static chart config data
│   ├── projects-table-data.js — Static placeholder data
│   └── ...                      — Other static template data files
│
├── widgets/
│   ├── alert_confirmation.jsx — SweetAlert confirmation dialog wrapper
│   ├── cards/
│   │   ├── statistics-card.jsx — KPI card widget for home dashboard
│   │   ├── profile-info-card.jsx
│   │   └── message-card.jsx
│   ├── charts/
│   │   └── statistics-chart.jsx — ApexCharts wrapper
│   ├── layout/
│   │   ├── sidenav.jsx      — Side navigation with route links, filters auth routes
│   │   ├── dashboard-navbar.jsx — Top navbar with breadcrumb, user menu
│   │   ├── configurator.jsx — UI settings panel (sidenav color/type)
│   │   ├── navbar.jsx       — Public-facing navbar (auth pages)
│   │   └── footer.jsx       — Footer component
│   └── routessans.jsx       — Unknown/unused
│
└── configs/
    ├── charts-config.js     — ApexCharts default configuration
    └── index.js             — Exports chart config
```

### Backend (`tyaybi_back/`)
```
tyaybi_back/
├── index.js      — Main Express API server (port 3000). NGP CRUD + Excel upload endpoints.
├── converter.js  — Excel→PDF conversion logic using pdf-lib. Arab/Latin font detection.
├── puper.js      — DUM form generator proof-of-concept using pdfkit. Not called from index.js.
├── server.js     — Standalone static HTML server (serves index.html). Unrelated to API.
├── index.html    — Placeholder HTML page for server.js.
├── package.json  — Dependencies list.
├── fonts/
│   ├── Consolas.ttf
│   ├── NotoSansArabic-Regular.ttf
│   └── NotoSans-Regular.ttf
├── uploads/      — Temp storage for multer uploads (files deleted after processing)
├── output.pdf    — Last converted PDF (artifact from testing)
└── outputt.pdf   — Another artifact
```

---

## Naming Conventions

- **Components**: PascalCase (`SignIn`, `ExcelToPdfConverter`, `Ngp`)
- **Files**: kebab-case for layout/widget files (`sign-in.jsx`, `dashboard-navbar.jsx`); camelCase/PascalCase for feature files (`convertpdf.jsx`, `newmodel.jsx`)
- **Services**: camelCase functions, grouped by domain (`getClientList`, `createClient`)
- **Routes path**: `camelCase` or `PascalCase` (`/Excelslice`, `/Model5`, `/Bddngp`)
- **CSS**: Tailwind utility classes inline. No separate CSS modules.
- **JSON data keys**: French language strings used as object keys (e.g., `"Désignation commerciale"`, `"Code NGP(à 10 chiffres)"`) — must be accessed with bracket notation.
- **Archive naming**: old versions named `archive.js`, `archiveee2.jsx`, `archivelastupdate.jsx` — no consistent versioning strategy

---

## Environment Variables and Config

**There are NO `.env` files.** All configuration is hardcoded.

| Value | Location | Current Value |
|---|---|---|
| External backend URL | `src/services/envirenment.js` | `http://localhost:5000` |
| NGP backend URL | `src/services/ngpservice.js` | `http://localhost:3000` |
| Express port | `tyaybi_back/index.js` | `3000` |
| Admin email | `src/pages/auth/sign-in.jsx` | `admin@gmail.com` |
| Admin password | `src/pages/auth/sign-in.jsx` | `12345` |
| bddngp.json path (backend) | `tyaybi_back/index.js` | `../tyaybi_front/src/pages/dashboard/clients/bddngp.json` |
| Alias `@` | `vite.config.js` | resolves to `/src` |
| PDF worker path | `convertpdf.jsx`, `test.jsx` | `/pdf.worker.mjs` (from public/) |

---

## How to Run

### Frontend
```bash
cd tyaybi_front
npm install
npm run dev   # Vite dev server, typically http://localhost:5173
```

### Backend (NGP API)
```bash
cd tyaybi_back
npm install
node index.js  # Starts at http://localhost:3000
```

### Login
- Navigate to the app → sign in with `admin@gmail.com` / `12345`
- The external backend at port 5000 is not required for the Excel/NGP features to work
