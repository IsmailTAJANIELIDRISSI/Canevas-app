# Setup Guide — Tyaybi App (Canevas)

## 1. Prerequisites

- [Node.js](https://nodejs.org/) 20+ (includes npm)
- Git

## 2. Clone the repository

```bash
git clone https://github.com/IsmailTAJANIELIDRISSI/Canevas-app.git
cd Canevas-app
git checkout edited-version
```

## 3. Install dependencies

The project has two parts: a backend (Express, port 3000) and a frontend (Vite/React, port 5173).

```bash
# Backend
cd tyaybi_back
npm install

# Frontend
cd ../tyaybi_front
npm install
```

## 4. Configure environment variables (backend)

Create `tyaybi_back/.env` (this file is gitignored and must be created manually):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

- `GEMINI_API_KEY` is used as a Gemini Vision fallback when extracting the MAWB
  currency/total-prepaid (Acheminements page) fails via regex (e.g. scanned PDFs).
  Get a key at https://aistudio.google.com/app/apikey.
- If omitted, the app still works — that fallback is simply skipped.

## 5. Run the app

### Option A — one-click (Windows)

From the repo root, double-click (or run) `Tyaybi_app.bat`. It:

- Frees port 3000 if already in use
- Starts the backend in a new window (`node index.js`)
- Starts the frontend dev server in a new window (`npm run dev`)

### Option B — manual (two terminals)

```bash
# Terminal 1 — backend
cd tyaybi_back
node index.js
# → http://localhost:3000

# Terminal 2 — frontend
cd tyaybi_front
npm run dev
# → http://localhost:5173
```

## 6. Login

Open http://localhost:5173 and sign in with:

- **Email**: `admin@gmail.com`
- **Password**: `12345`

(This is a hardcoded credential — see `ai-docs/PROJECT.md` for known limitations.)

## 7. More context

- `ai-docs/PROJECT.md` — what the app does, business logic
- `ai-docs/STACK.md` — tech stack, folder structure, conventions
- `ai-docs/PROGRESS.md` — change log
- `ai-docs/TASKS.md` — current state, known issues, next steps
