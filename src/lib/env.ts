function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get openaiApiKey() {
    return required("OPENAI_API_KEY");
  },
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || null,
};

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
