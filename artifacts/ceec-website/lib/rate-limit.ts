const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxRequests - existing.count, resetIn: existing.resetAt - now };
}

export function getClientIp(req: Request): string {
  const xff = (req.headers as Headers).get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
