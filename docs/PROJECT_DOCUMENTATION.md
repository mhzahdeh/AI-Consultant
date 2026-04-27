# Project Documentation

## Overview

AI Consultant is a local-first consulting workflow application. It simulates how a boutique consulting team would manage organizations, engagements, documents, reusable case knowledge, and generated work products inside one product surface.

The current implementation is split into:

- A React single-page application under `src/`
- A Node HTTP API in `server.js`
- A SQLite database in `data/app.db`
- Disk-backed uploads in `data/uploads/`

## Product Flows

### 1. Authentication and Access

The app supports:

- Sign up
- Log in
- Log out
- Organization creation
- Organization selection
- Invite acceptance

Route access is guarded in [src/app/App.tsx](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/App.tsx):

- `PublicOnly`: pages for unauthenticated users
- `RequireAuth`: authenticated but not fully bootstrapped users
- `RequireWorkspace`: authenticated users with an active organization/workspace

### 2. Workspace Bootstrap

[src/app/lib/AppProvider.tsx](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/AppProvider.tsx) is the main frontend orchestration layer.

It is responsible for:

- Loading session state from `/api/session`
- Loading workspace bootstrap data from `/api/bootstrap`
- Fetching detailed engagement records
- Keeping the selected engagement in sync after mutations
- Exposing all major actions to UI components through context

### 3. Engagement Lifecycle

An engagement typically moves through:

1. Creation from the new-engagement flow
2. Brief and notes capture
3. File upload ingestion
4. Matched-case review
5. Proposal starter / issue tree / workplan editing
6. Save/export/version operations

Workspace UI lives mostly under [src/app/components/workspace](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/components/workspace).

### 4. Organization and Team Management

The application also models a multi-user consulting organization:

- Owners, admins, editors, viewers, and billing roles
- Invite issuance and invite acceptance
- Member role changes
- Member removal
- Billing plan updates
- Privacy and deletion settings

These flows are represented in the organization, billing, usage, and settings components.

## Backend Architecture

[server.js](/Users/mohammadzahedah/Desktop/AI-Consultant/server.js) implements a simple custom HTTP API instead of Express or another framework.

Major backend responsibilities:

- SQLite initialization and schema management
- Demo seed creation
- Session creation and cookie management
- Authorization and membership checks
- CRUD-style API endpoints for organizations and engagements
- Upload persistence and document text extraction
- Artifact persistence and restore/version logic
- Audit logging

The server listens on `127.0.0.1:3001` by default.

## Database Model

The SQLite schema includes these core tables:

- `users`
- `organizations`
- `memberships`
- `sessions`
- `invites`
- `engagements`
- `uploads`
- `matched_cases`
- `vault_cases`
- `artifacts`
- `engagement_versions`
- `audit_logs`
- `id_counters`

At a high level:

- A user can belong to one or more organizations through memberships
- A session optionally points to an active organization
- An organization owns many engagements
- Curated vault cases are stored separately from engagement-specific matched cases
- An engagement owns uploads, matched cases, artifacts, and version history
- Audit logs capture important mutations for traceability

## File Upload Handling

Uploads are stored on disk and indexed in SQLite.

Current behavior:

- `txt`, `md`, `csv`, and `json` are read as text
- `pdf` is stored and tracked with parsing support through `pdf-parse`
- `docx` is supported through `mammoth`
- Unsupported file types can still be stored with limited preview behavior

This makes the workspace capable of showing source material and associating uploads with generated artifacts.

## Frontend Structure

Key frontend areas:

- `src/app/components/workspace`: engagement editing and artifact flows
- `src/app/components/organization`: member and invite management
- `src/app/components/settings`: privacy, deletion, and support settings
- `src/app/components/billing`: plan and payment-state UI
- `src/app/components/ui`: reusable low-level UI primitives
- `src/app/lib`: types, API client, and app state

The frontend uses a context-based approach rather than Redux or another global store.

## API Shape

The frontend talks to the backend using the API client in [src/app/lib/api.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/api.ts).

Key endpoint groups include:

- Session and auth
- Organization management
- Invite retrieval and acceptance
- Bootstrap loading
- Vault case retrieval and contextual ranking
- Engagement CRUD-style flows
- Artifact save and restore
- File uploads
- Member updates
- Billing plan changes

Vite proxies `/api` to the backend during development via [vite.config.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/vite.config.ts).

## Testing

Current test setup:

- Unit/integration-style coverage with Vitest
- Smoke end-to-end coverage with Playwright

Primary files:

- [src/app/lib/api.test.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/src/app/lib/api.test.ts)
- [tests/smoke.spec.ts](/Users/mohammadzahedah/Desktop/AI-Consultant/tests/smoke.spec.ts)

Recommended local verification:

```bash
npm run test
npm run lint
npm run typecheck
```

## Known Design Shape

This codebase is optimized for a local prototype:

- The backend is a single file
- API routing is manual
- Database migrations are implicit in startup schema creation
- The app uses seeded demo data for first-run usability

That is reasonable for a prototype, but if the project grows, the next structural improvements would likely be:

- Split `server.js` by domain
- Extract database access helpers
- Add explicit migration tooling
- Expand automated test coverage across API flows
- Document deployment and environment configuration separately
