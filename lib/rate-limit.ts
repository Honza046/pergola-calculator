const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  if (buckets.size > 5000) buckets.clear();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  if (current.count >= limit) return { ok: false as const };
  current.count += 1;
  return { ok: true as const };
}

export function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
