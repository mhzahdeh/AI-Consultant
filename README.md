# AI Consultant

Full-stack consulting workspace demo inspired by the shared Figma Make file.

## Features

- Authentication entry flow
- Dashboard with seeded engagements and metrics
- New engagement creation
- Multi-tab engagement workspace
- Layered vault model with internal knowledge, public analog cases, and project artifacts
- Trusted-source case importer for Bain, BCG, and McKinsey
- Organization members and invites
- Usage, billing, and settings pages
- Local JSON-backed API and persistence

## Run locally

```bash
npm start
```

The app runs on `http://127.0.0.1:3000`.

## AI generation

The workspace generation flow now supports two modes:

- `OpenAI`: used automatically when `OPENAI_API_KEY` is set
- `Local fallback`: used when no API key is configured or the provider request fails

Optional environment variables:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.2
```

Example:

```bash
OPENAI_API_KEY=your_key_here OPENAI_MODEL=gpt-5.2 npm start
```

The backend uses OpenAI's Responses API with a structured JSON schema so the generated artifacts can be saved directly into the engagement workspace.

## Vault positioning

The vault is intentionally modeled as a layered knowledge base:

- `Internal knowledge foundation`: proprietary templates, playbooks, and delivery assets
- `Public analog case library`: curated public consulting-firm cases used as external evidence and analogs
- `Project artifact layer`: uploads and engagement-specific materials

Public cases are positioned as a seed and evidence layer, not as the entire foundation of the vault.
