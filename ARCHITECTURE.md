# Architecture Notes

## WAT framework mapping for this project

This project follows the account-wide WAT framework described in `CLAUDE.md` (Workflows / Agents / Tools),
adapted for a web application rather than a Python automation pipeline:

- **Workflows** (`workflows/*.md`) — unchanged from the standard convention: markdown SOPs describing
  objectives, inputs, and edge cases.
- **Tools** (deterministic execution) — for this project, "tools" are:
  - Next.js API route handlers (`src/app/api/**/route.ts`) — deterministic request handling, validation,
    and orchestration.
  - The n8n workflow (`n8n/workflows/medigap-chat.json`) — a deterministic node graph that calls OpenAI.
  
  There is no standalone `tools/*.py` directory here, since this is a web app, not a scraping/generation
  pipeline like the sibling "Newsletters Demo" project — a Python tools directory would just duplicate
  logic already expressed as route handlers and n8n nodes.
- **`.env`** — same convention: secrets never committed, `.env.example` documents required variables.
- **`.tmp/`** — not applicable to a web app; the `.next/` build cache (already gitignored by Next.js
  convention) serves the same disposable-intermediate role.

## Two execution paths, one codebase

The chat API (`src/lib/chatOrchestrator.ts`) supports two paths so the same code works both locally and in
production, without paying for a publicly-hosted n8n instance:

- **Local Docker**: `N8N_WEBHOOK_URL` is set in `docker-compose.yml` to
  `http://host.docker.internal:5678/webhook/medigap-chat`, reaching an n8n Community Edition container you
  run and manage yourself (this repo does not start n8n) — chat requests are forwarded there, and n8n
  itself calls OpenAI.
- **Vercel production**: `N8N_WEBHOOK_URL` is left unset, so the same route handler calls OpenAI directly.

Stopping your n8n container locally (see `workflows/local_docker_setup.md`) exercises the exact fallback
code path that runs in production, so it gets tested before every deploy.

See `workflows/chat_pipeline.md` for the full request lifecycle and edge cases.
