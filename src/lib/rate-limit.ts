/**
 * Small in-memory rate limiter.
 *
 * Enough to stop a script hammering the public endpoints from one address.
 * It is per-instance and resets on redeploy, which is the right trade-off for a
 * validation experiment — the real integrity guarantees are the payload
 * validation and the database constraints.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 5000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED) {
    for (const [entry, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(entry);
    }
    if (buckets.size > MAX_TRACKED) buckets.clear();
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Best-effort client address, used only as a rate-limit key. Never stored. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
