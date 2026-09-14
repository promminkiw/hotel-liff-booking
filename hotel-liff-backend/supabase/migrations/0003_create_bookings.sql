-- bookings: check_out > check_in is enforced at the DB level, not just in application code.
-- total_price is captured at booking time and must never be recalculated from rooms.price_per_night.
-- idempotency_key has a UNIQUE constraint so a retried create_booking request cannot create a duplicate.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  user_id uuid not null references public.users(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  guests int not null,
  total_price numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  constraint check_out_after_check_in check (check_out > check_in)
);

create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_status on public.bookings(status);

-- speeds up the overlap-check query (room_id + status IN (...) + check_in/check_out range)
-- that runs before every booking is created
create index if not exists idx_bookings_room_dates on public.bookings(room_id, check_in, check_out);
