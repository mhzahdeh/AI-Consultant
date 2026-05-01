# AI Consultant

AI Consultant is a full-stack consulting workspace demo built with React, Vite, a local Node HTTP API, and SQLite. The product models a consulting workflow from sign-up and organization setup through engagement creation, file upload, matched-case review, artifact generation, version history, billing, and team management.

## What It Does

- Auth flow with sign-up, log-in, session cookies, and organization selection
- Organization setup with plans, memberships, roles, and invites
- Engagement creation with brief intake, notes, uploads, and matched cases
- Workspace artifacts for proposal starter, issue tree, and workplan
- Save, restore, and version history for engagement outputs
- File ingestion for `txt`, `md`, `csv`, `json`, `pdf`, and `docx`
- Usage, billing, privacy, support, and member-management screens
- Curated vault case seeding from [data/vault_cases.seed.json](/Users/mohammadzahedah/Desktop/AI-Consultant/data/vault_cases.seed.json)

## Stack

- Frontend: React 18, TypeScript, Vite, React Router
- Styling/UI: Tailwind, Radix UI, custom component library
- Backend: Node.js HTTP server in [server.js](/Users/mohammadzahedah/Desktop/AI-Consultant/server.js)
- Database: SQLite stored at `data/app.db`
- Tests: Vitest and Playwright

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Optional: configure OpenAI for live artifact generation:

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_MODEL="gpt-5"
```

You can also set `OPENAI_BASE_URL` if you need to route through a compatible proxy. If `OPENAI_API_KEY` is not set, the app falls back to the existing local template-based artifact generator.

3. Start the backend API in one terminal:

```bash
npm run backend
```

4. Start the frontend dev server in a second terminal:

```bash
npm run dev
```

5. Open the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

The frontend proxies `/api` requests to `http://127.0.0.1:3001` through [vite.config.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/vite.config.ts).

## Demo Data

On first run, the backend seeds a default workspace into SQLite.

- Demo email: `sarah@northstar-advisory.com`
- Demo password: `ChangeMe123!`

The API also exposes `GET /api/health` for a simple health check.

## Scripts

- `npm run backend`: start the Node API server
- `npm run dev`: start the Vite frontend
- `npm run build`: build the frontend bundle
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript type checking
- `npm run test`: run Vitest
- `npm run test:watch`: run Vitest in watch mode
- `npm run e2e`: run Playwright tests

## Repository Map

- [src/main.tsx](/Users/mohammadzahedah/Desktop/AI-Consultant/src/main.tsx): frontend entry point
- [src/app/App.tsx](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/App.tsx): application routing and route guards
- [src/app/lib/AppProvider.tsx](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/AppProvider.tsx): app state and API orchestration
- [src/app/lib/api.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/api.ts): frontend API client
- [src/app/lib/types.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/types.ts): shared frontend types
- [src/app/components/workspace](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/components/workspace): engagement workspace tabs and modals
- [server.js](/Users/mohammadzahedah/Desktop/AI-Consultant/server.js): API, persistence, uploads, seeding, and business logic
- [data](/Users/mohammadzahedah/Desktop/AI-Consultant/data): SQLite database and uploaded files
- [data/vault_cases.seed.json](/Users/mohammadzahedah/Desktop/AI-Consultant/data/vault_cases.seed.json): curated reusable case metadata imported into SQLite
- [tests](/Users/mohammadzahedah/Desktop/AI-Consultant/tests): end-to-end coverage

## Architecture Notes

- The app is a client-rendered SPA.
- Auth and workspace bootstrap happen through `AppProvider`.
- The backend stores organizations, users, memberships, sessions, engagements, uploads, matched cases, artifacts, versions, invites, and audit logs in SQLite.
- Uploaded files are saved to disk under `data/uploads` and their metadata is recorded in SQLite.
- Curated public case metadata is synced into the `vault_cases` SQLite table on backend startup.
- The UI is organized around guarded routes: public pages, authenticated pages, and workspace-ready pages.

## Additional Documentation

See [docs/PROJECT_DOCUMENTATION.md](/Users/mohammadzahedah/Desktop/AI-Consultant/docs/PROJECT_DOCUMENTATION.md) for a fuller walkthrough of the architecture, data model, and product flows.
