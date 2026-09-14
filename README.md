# Hotel Booking + AI Voice Assistant (LINE MINI App)

A hotel room booking system with LINE LIFF login and a Gemini-powered AI
assistant (text + voice) that can search rooms, check availability, and
create real bookings through tool calling — using the exact same backend
API and business rules as the normal booking UI.

## Status

Through Phase 12 of 25 (see `docs/analysis.md` for the full roadmap).
Core booking flow, LINE LIFF login, LINE push notifications, and
text-based AI chat are built and tested. Tool calling for the AI
assistant (Phase 13) is next.

**Note on the AI provider**: the original plan (see `docs/analysis.md`)
specified Claude API (Anthropic). Partway through Phase 12 this was
switched to Google Gemini instead, to use Gemini's free API tier during
development rather than paid Anthropic credits. The diagrams below
reflect the current Gemini-based implementation.

## Architecture

```mermaid
flowchart TB
    subgraph LINE["LINE App (mobile)"]
        LIFF["LINE MINI App / LIFF SDK"]
    end

    subgraph FE["Frontend — React + Vite (Vercel)"]
        UI["UI Pages: Home / Rooms / Booking / My Bookings / AI Assistant"]
        VoiceUI["Voice Service Layer (voiceService.js)"]
        LIFFAuth["LIFF Auth Module"]
        AdminUI["/admin — edit room price/status (password-protected)"]
    end

    subgraph BE["Backend — Node.js + Express (Render)"]
        API["REST API Layer"]
        AICtrl["AI Controller (/api/ai/chat, /api/ai/voice)"]
        ToolExec["Tool Executor (search_rooms, check_availability, create_booking, ...)"]
        Auth["LINE Token Verification"]
        AdminAuth["Admin Auth Middleware"]
    end

    subgraph EXT["External Services"]
        Gemini["Gemini API (Google)\nAPI key lives here only"]
        LineAPI["LINE Login API (verify id_token)"]
        LineMsg["LINE Messaging API (booking notifications)"]
    end

    subgraph DB["Supabase (PostgreSQL + Storage)"]
        Tables["users / rooms / bookings / hotel_info / ai_conversations / ai_messages / room_images"]
        Storage["Supabase Storage (room photos)"]
    end

    LIFF -->|"Get Profile / ID Token"| LIFFAuth
    LIFFAuth --> UI
    UI -->|"HTTPS REST"| API
    VoiceUI -->|"transcribed text"| API
    API --> Auth
    Auth -->|"verify token"| LineAPI
    API --> AICtrl
    AICtrl -->|"system prompt + tools + message"| Gemini
    Gemini -->|"function call request"| AICtrl
    AICtrl --> ToolExec
    ToolExec -->|"query/insert"| Tables
    ToolExec -->|"result"| AICtrl
    AICtrl -->|"result"| Gemini
    Gemini -->|"final text response"| AICtrl
    AICtrl -->|"text response"| VoiceUI
    VoiceUI -->|"text-to-speech"| LIFF
    API -->|"normal CRUD"| Tables
    UI -->|"room photos"| Storage
    AdminUI -->|"PATCH price/status"| API
    API --> AdminAuth
    AdminAuth -->|"update rooms"| Tables
    API -->|"booking created/cancelled"| LineMsg
    LineMsg -->|"push message"| LINE
```

### Voice flow

```mermaid
sequenceDiagram
    participant U as User (speaks)
    participant B as Browser (Web Speech API)
    participant F as Frontend (voiceService.js)
    participant S as Backend (/api/ai/voice)
    participant C as Gemini API
    participant D as Supabase

    U->>B: "Book a Deluxe room for 2 nights"
    B->>F: SpeechRecognition result (text)
    F->>S: POST /api/ai/voice { text, conversationId }
    S->>C: message + tool schema + system prompt
    C-->>S: function call: check_room_availability
    S->>D: query availability (by room_type)
    D-->>S: available rooms
    S->>C: function result
    C-->>S: reply text + (if enough info) function call: create_booking
    S->>D: insert booking (SELECT ... FOR UPDATE, idempotency key)
    D-->>S: booking_code
    S->>C: function result
    C-->>S: final reply text
    S-->>F: { reply }
    F->>B: speechSynthesis.speak(reply)
    B-->>U: spoken response
```

## Key design decisions

- Frontend never talks to Gemini or the Supabase service role directly —
  only to this backend.
- The Tool Executor is a hard gate: the AI cannot call `create_booking`
  without the code first checking availability. Business rules live in
  code, not just in the system prompt.
- Room search/availability always operates at the `room_type` level, not
  a specific `room_id` — a guest wants "a Deluxe room", not a specific
  room number.
- All "is this date in the past" comparisons are pinned to `Asia/Bangkok`,
  never the server's UTC clock.
- Bookings are created as `confirmed` immediately (no payment step in this
  version); `pending` is reserved for a future payment integration.
- Overlap prevention uses `SELECT ... FOR UPDATE` inside a transaction to
  prevent two simultaneous requests from double-booking the same room.
- Every booking-creating request carries a client-generated idempotency
  key so a network retry can't create a duplicate booking.
- Every booking-affecting request (create/list/cancel, AI chat) is gated
  behind a LINE ID token verified against LINE's own API — the client's
  claimed identity is never trusted directly.

See `docs/analysis.md` for the full project analysis (all 25 phases,
database schema, risk list, and scope decisions) this structure was built
from — note its AI provider references predate the Gemini switch above.

## Repository layout

```
hotel-liff-frontend/   React + Vite frontend (Vercel)
hotel-liff-backend/    Node.js + Express backend (Render)
```

Each has its own `.env.example` — copy to `.env` and fill in values.
Requires: a Supabase project (Phase 3), a LINE Login channel + LIFF app
and a LINE Messaging API channel (Phase 10-11), and a Gemini API key
(Phase 12, free tier at aistudio.google.com).

## Local setup

```bash
cd hotel-liff-backend
npm install
cp .env.example .env
npm run dev
```

```bash
cd hotel-liff-frontend
npm install
cp .env.example .env
npm run dev
```

## Roadmap

25 phases from folder structure to deployment — see `docs/analysis.md`
for the full table. Each phase ships working code, is tested, and is
reviewed before moving to the next.
