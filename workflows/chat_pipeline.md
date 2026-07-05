# Workflow: Chat & Image Analysis Pipeline

## Objective
Answer a visitor's Medicare/Medigap question and/or interpret an uploaded image (e.g. a Medicare card,
insurance letter, or Explanation of Benefits), through the chat widget on the homepage.

## Required inputs
- User's typed message (optional if an image is attached) and/or one image.
- `OPENAI_API_KEY` (server-side env var, required).
- `N8N_WEBHOOK_URL` (server-side env var, optional — see "Two execution paths" below).

## Lifecycle
1. **Client (`ChatWidget.tsx` → `ChatInput.tsx` → `ImageUploadButton.tsx`)**: user types a message and/or
   selects an image. Images are resized client-side (max 1280px edge, JPEG ~70% quality) via a canvas
   before being base64-encoded, keeping typical payloads under ~500KB.
2. **POST `/api/chat`** (`src/app/api/chat/route.ts`): rejects requests from a client that has exceeded the
   rate limit (see `src/lib/rateLimit.ts`), then validates the JSON body against the zod schema in
   `src/lib/types.ts` (message length caps, image mime-type allowlist, image size cap).
3. **Orchestration (`src/lib/chatOrchestrator.ts`)** decides one of two execution paths.

### Two execution paths
- **n8n path** (used in local Docker, where `N8N_WEBHOOK_URL` is set): the request is forwarded to the n8n
  webhook (`n8n/workflows/medigap-chat.json`), which itself calls OpenAI and returns `{ reply }`.
- **Direct OpenAI path** (used on Vercel production, where `N8N_WEBHOOK_URL` is unset, and as an automatic
  fallback locally if n8n is unreachable or times out): `src/lib/openai.ts` calls the OpenAI Chat Completions
  API directly with the same system prompt and message shape.

Both paths use the same system prompt content (`src/lib/systemPrompt.ts` for the direct path; a manually
kept-in-sync copy inside the n8n workflow's "Build OpenAI Request" Code node for the n8n path).

## Edge cases
| Case | Handling |
|---|---|
| OpenAI 429/5xx | Surfaced as a `502 UPSTREAM_ERROR`; the widget shows a friendly retry message. |
| Oversized image | Rejected with `413 IMAGE_TOO_LARGE` before any AI call is made. |
| n8n unreachable/slow | `chatOrchestrator.ts` times out after ~8s and falls back to the direct OpenAI path, logging a warning. |
| Malformed mime type | Rejected client-side by `ImageUploadButton.tsx`; also rejected server-side by the zod schema as `400 BAD_REQUEST`. |
| Empty message + no image | Rejected as `400 BAD_REQUEST` by the zod schema's `.refine()`. |
| Long conversation history | Truncated server-side to the last 10 messages (`MAX_HISTORY_MESSAGES`) to bound latency/cost. |
| Too many requests from one client | `429 RATE_LIMITED` (see `src/lib/rateLimit.ts` — in-memory, per-instance, best-effort). |
