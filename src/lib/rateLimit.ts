// Best-effort per-IP sliding-window rate limit to bound OpenAI cost/abuse.
// In-memory only: resets on redeploy/cold start and is per-instance, so on
// Vercel with multiple concurrent instances the effective limit is looser
// than the numbers below. Sufficient for a hobby-tier demo; if this ever
// moves to a paid tier with real traffic, replace with a durable store
// (e.g. Upstash Redis) shared across instances.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

export function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(clientId) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(clientId, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(clientId, timestamps);
  return false;
}

export function getClientId(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
