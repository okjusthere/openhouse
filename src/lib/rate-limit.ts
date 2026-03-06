const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __openhouseRateLimitStore: Map<string, Bucket> | undefined;
}

function getStore() {
  if (!globalThis.__openhouseRateLimitStore) {
    globalThis.__openhouseRateLimitStore = new Map<string, Bucket>();
  }

  return globalThis.__openhouseRateLimitStore;
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit({
  key,
  limit,
  windowMs = DEFAULT_WINDOW_MS,
}: {
  key: string;
  limit: number;
  windowMs?: number;
}) {
  const store = getStore();
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      resetAt,
    };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}
