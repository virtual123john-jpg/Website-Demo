import { NextRequest, NextResponse } from "next/server";
import { orchestrateChat } from "@/lib/chatOrchestrator";
import { getClientId, isRateLimited } from "@/lib/rateLimit";
import { MAX_IMAGE_BASE64_BYTES, chatRequestSchema, type ChatErrorBody } from "@/lib/types";

export const runtime = "nodejs";

function errorResponse(body: ChatErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  if (isRateLimited(getClientId(req))) {
    return errorResponse(
      { error: "Too many requests. Please slow down and try again shortly.", code: "RATE_LIMITED" },
      429
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return errorResponse({ error: "Invalid JSON body", code: "BAD_REQUEST" }, 400);
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" },
      400
    );
  }

  const payload = parsed.data;

  if (payload.image && payload.image.dataUrl.length > MAX_IMAGE_BASE64_BYTES) {
    return errorResponse(
      { error: "Image is too large. Please upload a smaller image.", code: "IMAGE_TOO_LARGE" },
      413
    );
  }

  try {
    const result = await orchestrateChat(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("timed out")) {
      return errorResponse({ error: "The assistant took too long to respond.", code: "TIMEOUT" }, 504);
    }
    console.error("[api/chat] upstream failure:", err);
    return errorResponse(
      { error: "The assistant is temporarily unavailable. Please try again.", code: "UPSTREAM_ERROR" },
      502
    );
  }
}
