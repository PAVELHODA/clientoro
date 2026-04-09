// PATH: src/lib/api/rateLimit.ts

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

/** Simple in-memory rate limiter. Returns true if request should be blocked. */
export function isRateLimited(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  
  // Cleanup old entries periodically
  if (rateLimitMap.size > 10_000) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) rateLimitMap.delete(k)
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}
