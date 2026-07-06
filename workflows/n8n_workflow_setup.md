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
   via a Predefined Credential Type → OpenAI credential (n8n's native OpenAI credential, simpler than a
   manual Header Auth credential — just paste the API key, no `Bearer` prefix needed). `onError` is set to
   continue on failure so the workflow can branch on success/error rather than crashing.
4. **Succeeded?** (IF node) — branches on whether the response contains `choices`. The condition
   deliberately evaluates `{{ $json.choices ? "yes" : "" }}` as a **string** "is not empty" check, not a
   direct array-type check on `$json.choices` — a direct array check was found to throw a spurious
   `Conversion error: the string '' can't be converted to an array` in testing, seemingly tied to how nodes
   imported from JSON (rather than built by hand in the UI) can end up with a stuck/stale parameter that the
   UI doesn't fully let you overwrite. Coercing to a plain string first sidesteps the issue entirely. If you
   ever see that error on an imported IF node, the fix is: delete the node, add a brand-new IF node from the
   node panel (not edit the imported one), and use the string-ternary form for the condition.
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
3. Create the OpenAI credential on the **Call OpenAI** node:
   - Open the node, set **Authentication** to **Predefined Credential Type**, and the credential type
     search to **OpenAI**.
   - Click the credential dropdown → **Create New Credential**.
   - Paste your real API key into the **API Key** field (just the raw key — no `Bearer` prefix). Leave
     Organization ID and Base URL at their defaults. Save.
   - (Imports never carry credential secrets, so creating this fresh after import is expected and is
     exactly why the workflow JSON is safe to commit to git.)
4. Activate the webhook. **Depending on your n8n version this may not be a simple toggle** — some newer
   n8n builds use a **"Publish"** button (top-right of the editor) instead of an Active/Inactive switch.
   Click **Publish**. Note that editing any node afterward (e.g. fixing the IF node above) reverts the
   workflow to draft — you must click **Publish** again after any edit for the webhook to actually respond
   with real data instead of falling through to n8n's "unknown webhook" handler (which returns an empty
   200, not an error — easy to miss).
5. Confirm the webhook path matches what the `web` container calls: `docker-compose.yml` sets
   `N8N_WEBHOOK_URL=http://host.docker.internal:5678/webhook/medigap-chat`, i.e. path `/medigap-chat`
   reaching your host's port 5678 — the same port n8n publishes to.
6. Test in isolation first, before involving the website — e.g.:
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
