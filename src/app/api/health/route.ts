import { NextResponse } from "next/server";
import { env, hasOpenAiKey } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    openaiKeyConfigured: hasOpenAiKey(),
    openaiModel: env.openaiModel,
    n8nWebhookConfigured: Boolean(env.n8nWebhookUrl),
  });
}
