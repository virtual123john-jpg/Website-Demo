# Workflow: Deploy the Website to Vercel (Free Hobby Tier)

## Objective
Deploy the website (not n8n) to Vercel's free Hobby tier, keeping cost at $0, only after the local Docker
end-to-end tests in `workflows/local_docker_setup.md` are all green.

## Pre-deploy checklist
- [ ] All steps in `workflows/local_docker_setup.md` pass, including the fallback test (step 6) — this
      proves the direct-OpenAI code path (the one Vercel will actually run) works correctly.
- [ ] `npm run build` completes with no errors.
- [ ] No secrets are committed — `.env` is gitignored; only `.env.example` (placeholder values) is tracked.
- [ ] The image-size guard (`413` response) was verified.
- [ ] The disclaimer banner and system prompt are present and reviewed.
- [ ] Confirmed this deployment is for personal/demo use, consistent with Vercel Hobby's non-commercial
      terms of service (re-confirm if the site's purpose ever changes).

## Vercel project settings
- Framework preset: **Next.js** (auto-detected, zero-config).
- Build command / output: defaults (Vercel handles `next build` automatically; `output: 'standalone'` in
  `next.config.js` is fine to leave as-is for Vercel — Vercel does its own build packaging and ignores that
  setting, it only matters for the Docker image).
- Environment variables (Project Settings → Environment Variables):
  - `OPENAI_API_KEY` — your real key. **Do not** prefix with `NEXT_PUBLIC_`.
  - `OPENAI_MODEL` — e.g. `gpt-4o-mini` (optional, defaults to `gpt-4o-mini` if unset).
  - **Do not set `N8N_WEBHOOK_URL`** — leaving it unset is intentional, so the deployed app uses the
    direct-OpenAI path (there is no publicly reachable n8n instance in this free-tier setup).

## Deploy
1. Push the repository to GitHub (see `SECURITY.md` and the README's GitHub security section first if you
   haven't already configured branch protection / secret scanning).
2. In the Vercel dashboard, "Add New Project" → import the GitHub repo → set the environment variables
   above → Deploy.

## Post-deploy smoke test
1. Open the deployed URL and confirm `/api/health` reports `openaiKeyConfigured: true` and
   `n8nWebhookConfigured: false`.
2. Send a text chat message and confirm a real reply.
3. Upload a sample image and confirm it's interpreted.
4. Confirm the response's `source` field reads `"openai-direct"` (visible in the browser network tab),
   confirming production is using the intended code path.

This step also makes real, paid OpenAI API calls — confirm with the project owner before running it.
