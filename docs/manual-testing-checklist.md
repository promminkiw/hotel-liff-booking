# Manual Testing Checklist — Real Device Required

Everything backend-side (business logic, guardrails, data consistency)
has been verified through automated testing throughout Phases 1-17. The
items below need a real LINE account, a real phone with a microphone/
speaker, and (for LINE login + push notifications) an HTTPS URL — none
of which the coding assistant has access to in its sandboxed browser.
Run this once now if you'd like, or wait until Phase 22 when the app is
deployed with a real HTTPS URL (recommended, since LINE login needs one).

## Setup (once deployed, or via ngrok for earlier testing)

- [ ] Frontend reachable over HTTPS at the URL registered as the LIFF app's Endpoint URL
- [ ] Backend `ALLOWED_ORIGIN` matches that frontend URL

## 1. LINE Login

- [ ] Open the app link on your phone, inside the LINE app
- [ ] Go to "การจองของฉัน" or "AI Assistant" → tap "เข้าสู่ระบบด้วย LINE"
- [ ] Consent screen appears, log in completes, you're taken back to the app
- [ ] Your name/profile is recognized (check the LiffGuard banner disappears since you're now inside the LINE app)

## 2. Text booking (baseline, should already work from Phase 7 testing)

- [ ] Book a room via Rooms → Room Detail → Booking → confirm
- [ ] Booking appears in "การจองของฉัน" with status "ยืนยันแล้ว"
- [ ] **Check your LINE chat with the official account** — a push message with the booking confirmation should arrive within a few seconds

## 3. AI chat — text

- [ ] Open "AI Assistant", ask "มีห้อง Deluxe ว่างไหม" — should get a real answer, not a guess
- [ ] Ask to book a room, confirm when asked — booking should complete and show up in "การจองของฉัน"
- [ ] Ask something out of scope (e.g. "ขอคืนเงิน") — should get the hotel's phone number, not a made-up answer

## 4. Voice input (Speech-to-Text)

- [ ] Tap the microphone button — browser/LINE asks for microphone permission, grant it
- [ ] Speak a short sentence in Thai — the recognized text should appear in the input box (not auto-sent)
- [ ] Edit if needed, then tap Send

## 5. Voice output (Text-to-Speech)

- [ ] Tap the speaker icon to turn voice replies on
- [ ] Send a message — the AI's reply should be read aloud in Thai
- [ ] Send another message while the previous reply is still speaking — it should stop and speak the new reply, not overlap

## 6. Cancellation notification

- [ ] Cancel a booking from "การจองของฉัน"
- [ ] A LINE push message confirming the cancellation should arrive

## If something fails

- **No push message arrives**: check you've added the LINE Messaging API's official account as a friend (Phase 11 setup) — pushes silently fail for non-friends by design (the booking itself still succeeds either way)
- **Login redirects to a 400 error page**: the LIFF Endpoint URL in the LINE Developers Console doesn't match the URL you're actually testing from — update it there
- **Mic button doesn't appear**: your browser doesn't support Web Speech API (expected on some iOS in-app browsers) — this is the documented fallback case, typing still works
