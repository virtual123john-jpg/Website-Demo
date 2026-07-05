import OpenAI from "openai";
import { env } from "./env";
import { SYSTEM_PROMPT } from "./systemPrompt";
import type { ChatImage, ChatMessage } from "./types";

const MAX_REPLY_TOKENS = 500;

export async function callOpenAiDirect(
  history: ChatMessage[],
  message: string,
  image: ChatImage | null | undefined
): Promise<string> {
  const client = new OpenAI({ apiKey: env.openaiApiKey });

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
  if (message.trim().length > 0) {
    content.push({ type: "text", text: message });
  }
  if (image) {
    content.push({ type: "image_url", image_url: { url: image.dataUrl } });
  }

  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    max_tokens: MAX_REPLY_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content },
    ],
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) {
    throw new Error("OpenAI returned an empty response");
  }
  return reply;
}
