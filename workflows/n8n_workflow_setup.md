# Workflow: n8n Setup for the Medigap Chat Webhook

## Objective
Get the `medigap-chat` n8n workflow running locally so the website's chat can forward requests to it.

## Node-by-node design (`n8n/workflows/medigap-chat.json`)
1. **Webhook** — listens on `POST /webhook/medigap-chat`. Response mode is "Using Respond to Webhook Node"
   so the flow can process the request before answering.
2. **Build OpenAI Request** (Code node) — normalizes the incoming JSON and builds the OpenAI Chat
   Completions request body, including the `image_url` content part when an image is present. Contains an
   inline copy of the system prompt — **keep this in sync with `src/lib/systemPrompt.ts`** if you change
   the assistant's behavior; n8n's JSON export can't import a JS constant directly.
3. **Call OpenAI** (HTTP Request node) — `POST https://api.openai.com/v1/chat/completions`, authenticated
   via an HTTP Header Auth credential (see setup below). `onError` is set to continue on failure so the
   workflow can branch on success/error rather than crashing.
4. **Succeeded?** (IF node) — branches on whether the response contains `choices`.
5. **Extract Reply** / **Build Error** (success/error branches) — shape the final response payload.
6. **Respond Success** / **Respond Error** (Respond to Webhook nodes) — return `{ reply, source: "n8n" }`
   (200) or `{ error, code }` (502).

## Setup steps
This project expects n8n to already be running as your own separately-managed container (e.g. an existing
`n8n-local` container publishing port 5678 on the host) rather than being started by this repo's
`docker-compose.yml`. If you don't have one running yet, start any n8n Community Edition container that
publishes port 5678, then continue below.

1. Open the n8n editor at `http://localhost:5678` (log in if you've configured auth on your instance).
2. Import the workflow: **Workflows → Import from File** → select `n8n/workflows/medigap-chat.json`.
3. Create the OpenAI credential:
   - Go to **Credentials → New → Header Auth**.
   - Name it exactly `OpenAI Header Auth` (matches the name referenced in the imported workflow).
   - Header name: `Authorization`. Header value: `Bearer <your OPENAI_API_KEY>`.
4. Open the **Call OpenAI** node and reselect the `OpenAI Header Auth` credential (imports never carry
   credential secrets, so this manual step is expected and is the reason the workflow JSON is safe to
   commit to git).
5. Click **Activate** (top-right toggle) to enable the webhook.
6. Confirm the webhook path matches what the `web` container calls: `docker-compose.yml` sets
   `N8N_WEBHOOK_URL=http://host.docker.internal:5678/webhook/medigap-chat`, i.e. path `/medigap-chat`
   reaching your host's port 5678 — the same port n8n publishes to.
7. Test in isolation first, before involving the website — e.g.:
   ```
   curl -X POST http://localhost:5678/webhook/medigap-chat \
     -H "Content-Type: application/json" \
     -d '{"message":"What is Part B?","messages":[]}'
   ```
   You should get back `{"reply": "...", "source": "n8n"}`. This isolates n8n/OpenAI issues from
   website issues before testing through the full chat widget.

## Alternative credential approach (not the default)
You can reference `{{$env.OPENAI_API_KEY}}` directly in an expression instead of using a Credential, but
n8n blocks environment-variable access inside node expressions by default. Enabling it requires setting
`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` on the n8n container, which weakens a security default — only do this
if you understand the tradeoff.
