import { env } from "./env";
import { callOpenAiDirect } from "./openai";
import { DISCLAIMER, MAX_HISTORY_MESSAGES, type ChatRequest, type ChatResponseBody } from "./types";

const N8N_TIMEOUT_MS = 8_000;

class UpstreamError extends Error {}
class TimeoutErrorLocal extends Error {}

async function callN8n(payload: ChatRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);
  try {
    const res = await fetch(env.n8nWebhookUrl as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new UpstreamError(`n8n webhook responded with status ${res.status}`);
    }
    const data = (await res.json()) as { reply?: string };
    if (!data.reply) {
      throw new UpstreamError("n8n webhook response missing 'reply'");
    }
    return data.reply;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new TimeoutErrorLocal("n8n webhook timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function orchestrateChat(payload: ChatRequest): Promise<ChatResponseBody> {
  const history = payload.messages.slice(-MAX_HISTORY_MESSAGES);
  const trimmedPayload: ChatRequest = { ...payload, messages: history };

  if (env.n8nWebhookUrl) {
    try {
      const reply = await callN8n(trimmedPayload);
      return { reply, source: "n8n", disclaimer: DISCLAIMER };
    } catch (err) {
      // Falls through to the direct OpenAI path intentionally — this is the same
      // code path Vercel production uses when N8N_WEBHOOK_URL is unset, so local
      // Docker runs exercise it too whenever n8n is unreachable or times out.
      console.warn("[chatOrchestrator] n8n call failed, falling back to direct OpenAI:", err);
    }
  }

  const reply = await callOpenAiDirect(history, payload.message, payload.image);
  return { reply, source: "openai-direct", disclaimer: DISCLAIMER };
}
