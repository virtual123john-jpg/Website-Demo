import { z } from "zod";

export const MAX_IMAGE_BASE64_BYTES = 3_500_000; // leaves headroom under Vercel's 4.5MB request body cap
export const MAX_HISTORY_MESSAGES = 10;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatImageSchema = z.object({
  dataUrl: z.string().startsWith("data:image/"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  approxBytes: z.number().nonnegative(),
});

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).default([]),
    message: z.string().max(4000).default(""),
    image: chatImageSchema.nullable().optional(),
  })
  .refine((data) => data.message.trim().length > 0 || Boolean(data.image), {
    message: "Provide a message or an image.",
  });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatImage = z.infer<typeof chatImageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ChatSource = "n8n" | "openai-direct";

export interface ChatResponseBody {
  reply: string;
  source: ChatSource;
  disclaimer: string;
}

export interface ChatErrorBody {
  error: string;
  code: "BAD_REQUEST" | "IMAGE_TOO_LARGE" | "UPSTREAM_ERROR" | "TIMEOUT" | "RATE_LIMITED";
}

export const DISCLAIMER =
  "This assistant provides general educational information about Medicare and Medigap only. " +
  "It is not affiliated with Medicare.gov or any government agency, and it is not a substitute " +
  "for advice from a licensed insurance agent or your State Health Insurance Assistance Program (SHIP).";
