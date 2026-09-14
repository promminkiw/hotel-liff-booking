-- Enable Row Level Security on every table, with no policies defined for
-- the anon/authenticated roles. This is deny-by-default: the anon key
-- (which must never reach the backend or frontend for these tables) gets
-- zero access. The backend's service_role key bypasses RLS entirely, so
-- it keeps working normally - this is purely a defense-in-depth layer in
-- case the anon key is ever used somewhere it shouldn't be.
alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_images enable row level security;
alter table public.bookings enable row level security;
alter table public.hotel_info enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
