# Security Review (Phase 20)

## Checked, no issues found

- **Secrets never committed**: `.env` was never tracked in git history on either package (`git ls-files` confirms), and a grep across all committed source for Anthropic/Gemini/Supabase key patterns found nothing hardcoded.
- **No service-role/AI keys reach the frontend**: grepped `hotel-liff-frontend/src` for `SUPABASE_SERVICE_ROLE`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` — none present. The frontend only ever talks to this project's own backend.
- **RLS still enforced**: re-ran the Phase 3 anon-key probe against all 7 tables (`users`, `rooms`, `bookings`, `hotel_info`, `ai_conversations`, `ai_messages`, `room_images`) - every one returns 0 rows for the anon key, no errors. Deny-by-default is intact.
- **Route auth coverage**: reviewed every route file. `/api/bookings/*` and `/api/ai/*` require `verifyLineToken`; `/api/admin/*` requires `verifyAdminToken` except `/login` (which is itself rate-limited). `/api/rooms/*`, `/api/hotel-info`, `/health` are intentionally public read-only endpoints (room browsing, hotel info, uptime check - no user-specific or sensitive data).
- **No XSS surface**: no `dangerouslySetInnerHTML` anywhere in the frontend; all rendering goes through React's default escaping.
- **No SQL injection surface**: every query goes through the Supabase JS query builder (parameterized) or the `create_booking_atomic` Postgres function (typed function parameters, never string-concatenated SQL).
- **CORS genuinely restrictive**: tested actual preflight behavior (not just header presence) with `Origin: http://evil.example` - the response's `Access-Control-Allow-Origin` still names only the configured `ALLOWED_ORIGIN`, never reflects the requesting origin, so a browser will block a malicious site's JS from reading the response even though the preflight itself returns 204.
- **Error responses don't leak internals**: `errorHandler.js` returns the generic "Internal server error" for any unhandled/unexpected exception (status 500); only errors this codebase deliberately throws with an explicit `.status` (validation/not-found/auth errors, all with a written Thai message) return their own message. No stack traces or raw DB errors ever reach the client.
- **Helmet headers present**: confirmed `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` on live responses; `X-Powered-By` is absent (Helmet strips it).
- **Admin auth**: password compared with `crypto.timingSafeEqual` (length-mismatch handled without leaking length via a throw), JWT signed with a 256-bit random secret, 24h expiry, login rate-limited to 5 attempts/15min.

## Found and fixed this phase

1. **Admin room validation gaps** - `pricePerNight`/`maxGuests` weren't checked as real positive numbers before hitting the DB (a non-numeric price would `JSON.stringify` to `null`, then fail the DB's `NOT NULL` constraint as an opaque 500), and `status` on `PATCH /api/admin/rooms/:id` wasn't checked against the three valid values before hitting the DB's `CHECK` constraint the same way. Neither was a real vulnerability (the DB constraints already prevented bad data from being stored) but both produced an unhelpful generic 500 instead of a clear 400. Added explicit checks in `admin.controller.js`.
2. **Booking/availability date format** - `checkIn`/`checkOut` were only checked for truthiness, not shape. A malformed value (not a real date-shaped string) would sail past validation and fail deep inside the Postgres call as a raw, unhandled error. Added a `YYYY-MM-DD` regex check to `bookings.controller.js` (`postBooking`) and `rooms.controller.js` (`postCheckAvailability`).
3. **AI chat message length** - no cap existed on how long a single chat message could be. Not exploitable for injection (Gemini receives it as plain text, not executable), but an extremely long message inflates token cost and specifically the shared Gemini free-tier quota that Phase 13/14 already found is easy to exhaust. Added a 2000-character cap in `ai.controller.js`.
4. **`trust proxy` unset** - `express-rate-limit`'s IP-based limiter (admin login) derives the caller's IP from `req.ip`, which without `trust proxy` configured resolves to the reverse proxy's own address once this is deployed behind one (Render, Phase 22) - every user would share one rate-limit bucket, or the limiter could reject entirely. Set `app.set('trust proxy', 1)` in `app.js` (trusts exactly one hop, matching a single-proxy deployment; a no-op locally since there's no proxy in front yet).

All four were verified live after the fix: admin room creation/update now returns a clean 400 for bad price/status, and unauthenticated requests still correctly get rejected before any of the new validation runs (confirmed auth middleware executes first, never leaking validation detail to an unauthenticated caller). 22/22 backend unit tests still pass.

## Known, accepted risk (not fixed this phase)

- **`qs` via `express`** (backend, moderate): array-limit bypass / isBuffer DoS advisories. This app only ever parses simple flat query strings (`?room_type=X&guests=2`), never complex nested arrays, so practical exploitability here is low. Fixing requires a breaking `express` upgrade; deferred rather than risking stability this close to deployment.
- **`esbuild` via `vite`** (frontend, moderate/high): lets any website send requests to the Vite *dev server* and read the response. This only matters while `npm run dev` is running locally - the deployed app (Phase 22) serves a static `vite build` output via Vercel, which doesn't run this dev server at all, so production is unaffected. Fixing requires a breaking `vite` major upgrade (5 → 8); deferred for the same reason.

Both are worth revisiting in a future maintenance pass, but neither blocks deployment.
