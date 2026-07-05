# Workflow: Local End-to-End Setup via Docker

## Objective
Run the website locally through Docker, talking to your own separately-managed self-hosted n8n Community
Edition container, and prove the chat/image pipeline works end-to-end before ever deploying to Vercel.

## Prerequisites
- Docker Desktop installed and running.
- Your own n8n Community Edition container already running and publishing port 5678 on the host (this repo
  does not start n8n for you — see the note in `docker-compose.yml`).
- A real `OPENAI_API_KEY` filled into `.env` (copy `.env.example` if you don't have a `.env` yet).

> **Cost note:** every live test below makes a real, paid call to the OpenAI API. Confirm with the project
> owner before the first run of steps 4-6, and before any repeat run, per this project's `CLAUDE.md`.

## Steps
1. Build the website image:
   ```
   docker compose build
   ```
2. Set up the n8n workflow first: follow `workflows/n8n_workflow_setup.md` completely (import, credential,
   activate) — this isolates n8n issues from website issues before the two are connected.
3. Start the website:
   ```
   docker compose up -d
   ```
4. Sanity-check the website is up:
   ```
   curl http://localhost:3000/api/health
   ```
   Expect `{"status":"ok","openaiKeyConfigured":true,...}`.
5. **Full browser E2E**: open `http://localhost:3000`, click "Ask about Medicare", send a text message, and
   confirm a real reply appears. Then attach a **sample, non-real** image (do not upload a real Medicare
   card or any document with real personal data) and confirm the assistant describes/interprets it.
6. **Fallback path test** (this is what proves the exact code path Vercel production will use): pause or
   stop your n8n container, repeat the chat test in the browser — it should still work, now via the
   direct-OpenAI fallback (`chatOrchestrator.ts` logs a warning; check with `docker compose logs web`).
   Restart your n8n container afterward.
7. **Size-limit test**: attach a very large image and confirm a friendly "too large" message rather than a
   crash.
8. Inspect logs if anything looks wrong:
   ```
   docker compose logs web
   ```
9. Tear down when done:
   ```
   docker compose down
   ```
   (Your separately-managed n8n container is untouched by this — stop/manage it independently.)

Only proceed to `workflows/vercel_deploy.md` after steps 4-7 are all green.
