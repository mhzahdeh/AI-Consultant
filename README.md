# AI Consultant

Full-stack consulting workspace demo inspired by the shared Figma Make file.

## Features

- Authentication entry flow
- Dashboard with seeded engagements and metrics
- New engagement creation
- Multi-tab engagement workspace
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
