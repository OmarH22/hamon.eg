// src/lib/rateLimit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

// Waitlist: max 3 submissions per IP per hour
export const waitlistLimiter = new RateLimiterMemory({
  points: 3,
  duration: 3600,
})

// Admin login: max 10 attempts per IP per 15 minutes
export const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 900,
})

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real
  return 'unknown'
}
