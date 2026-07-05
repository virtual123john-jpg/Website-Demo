# JAI Medicare & Medigap Guide

An educational website about Medicare and Medigap with an interactive AI chat widget (text + image
analysis). Runs end-to-end locally via Docker (website + self-hosted n8n Community Edition), and deploys
to Vercel's free Hobby tier for production.

See `ARCHITECTURE.md` for how the pieces fit together, and `workflows/*.md` for step-by-step SOPs.

## Quickstart (local, via Docker)

1. Copy env template and fill in your real OpenAI key:
   ```
   cp .env.example .env
   ```
   Edit `.env`: set `OPENAI_API_KEY` and a strong `N8N_BASIC_AUTH_PASSWORD`.
2. Follow `workflows/local_docker_setup.md` for the full build/up/test/teardown sequence.
3. Website: http://localhost:3000 — n8n editor: http://localhost:5678

## Quickstart (local, without Docker)

```
npm install
npm run dev
```
Runs the Next.js app directly on the host (uses the direct-OpenAI path unless you separately run n8n in
Docker and set `N8N_WEBHOOK_URL=http://localhost:5678/webhook/medigap-chat` in `.env`).

## Deploying to Vercel

See `workflows/vercel_deploy.md`. Summary: set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in the
Vercel project's environment variables; leave `N8N_WEBHOOK_URL` unset.

## Security

- Application-level hardening (headers, rate limiting, input validation) is documented in
  `ARCHITECTURE.md` and implemented in `next.config.js` / `src/lib/rateLimit.ts` / `src/lib/types.ts`.
- See `SECURITY.md` for the vulnerability reporting policy.
- **Once this repo has a remote on GitHub**, enable these repo settings manually (not configurable via
  committed files):
  - **Settings → Code security → Dependabot alerts** and **Dependabot security updates**: on.
  - **Settings → Code security → Secret scanning** and **Push protection**: on.
  - **Settings → Branches → Branch protection rule** for `main`: require a pull request before merging,
    require the `CI` status check (from `.github/workflows/ci.yml`) to pass, and require the `CodeQL`
    check to pass before merging.
- `.github/dependabot.yml` and `.github/workflows/{ci,codeql}.yml` are already included to support the
  above once the repo is pushed to GitHub.

## Brand assets

Real logo/photo files go in `public/brand/` — see `public/brand/README.md` for expected filenames. A
placeholder monogram is used until then.
