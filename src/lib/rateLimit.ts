// PATH: src/lib/rateLimit.ts
// Jednoduchý in-memory rate limiter

const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 1000 // 1 minuta
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requests.get(ip)

  // Vyčisti staré záznamy (každých 100 requestů)
  if (requests.size > 1000) {
    for (const [key, val] of requests) {
      if (val.resetAt < now) requests.delete(key)
    }
  }

  if (!record || record.resetAt < now) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
