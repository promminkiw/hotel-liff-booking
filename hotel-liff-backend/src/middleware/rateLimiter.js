import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// Keyed by the verified LINE identity (set by verifyLineToken, which must
// run before this) rather than IP - IP alone doesn't distinguish LINE
// users behind the same NAT/carrier, and it's the wrong unit for a
// per-user cost/abuse control anyway.
//
// The limit itself is deliberately conservative: testing in Phase 13 found
// the Gemini free tier enforces ~5 requests/minute/model *shared across
// the whole API key*, not per caller. A per-user cap can't fully prevent
// two concurrent users from exhausting that shared quota together, but
// keeping each user well under it (and relying on chatService's
// retry-with-backoff for the rare remaining collision) is the practical
// mitigation available without introducing a global request queue.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  // req.lineUser is always set here in practice (this runs after
  // verifyLineToken, which rejects the request otherwise) - the IP
  // fallback exists only so the limiter degrades safely rather than
  // throwing if it's ever mounted without that middleware in front of it.
  keyGenerator: (req) => req.lineUser?.lineUserId ?? ipKeyGenerator(req.ip),
  message: { error: 'คุณส่งข้อความเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง' },
})
