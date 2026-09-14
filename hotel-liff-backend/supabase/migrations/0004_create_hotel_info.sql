-- hotel_info: single-row hotel configuration (cancellation policy, booking limits, contact info)
create table if not exists public.hotel_info (
  id int primary key default 1,
  hotel_name text not null,
  address text,
  phone text,
  check_in_time text,
  check_out_time text,
  facilities jsonb not null default '[]'::jsonb,
  policies text,
  cancellation_days_before int not null default 1,
  max_advance_booking_days int not null default 365,
  max_length_of_stay_nights int not null default 30
);

-- ai_conversations / ai_messages: conversation history for the AI assistant,
-- including a log of every tool call (tool_name/tool_input/tool_result) for debugging.
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text,
  tool_name text,
  tool_input jsonb,
  tool_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_conversations_user_id on public.ai_conversations(user_id);
create index if not exists idx_ai_messages_conversation_id on public.ai_messages(conversation_id);
