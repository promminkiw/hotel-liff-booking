-- create_booking_atomic: the only path allowed to insert a booking.
--
-- Runs as a single Postgres transaction (the whole function body), so the
-- "check availability, then insert" pattern is safe from the race
-- condition where two concurrent requests both see a room as free and
-- both insert. It locks every active room of the requested room_type with
-- FOR UPDATE (in room_number order, to avoid deadlocks between concurrent
-- calls), then for each locked room checks for an overlapping booking. The
-- first room with no overlap gets the booking; if none qualify, it raises
-- NO_ROOM_AVAILABLE.
--
-- Idempotency: if p_idempotency_key already has a booking, that existing
-- row is returned immediately instead of creating a duplicate.
create or replace function public.create_booking_atomic(
  p_user_id uuid,
  p_room_type text,
  p_check_in date,
  p_check_out date,
  p_guests int,
  p_idempotency_key text
) returns public.bookings
language plpgsql
as $$
declare
  v_existing public.bookings;
  v_room record;
  v_total_price numeric(10,2);
  v_booking public.bookings;
  v_booking_code text;
begin
  if p_idempotency_key is not null then
    select * into v_existing from public.bookings where idempotency_key = p_idempotency_key;
    if found then
      return v_existing;
    end if;
  end if;

  for v_room in
    select * from public.rooms
    where room_type = p_room_type
      and status = 'active'
      and max_guests >= p_guests
    order by room_number
    for update
  loop
    if not exists (
      select 1 from public.bookings
      where room_id = v_room.id
        and status in ('pending', 'confirmed')
        and check_in < p_check_out
        and check_out > p_check_in
    ) then
      v_total_price := v_room.price_per_night * (p_check_out - p_check_in);
      v_booking_code := 'BK' || to_char(now(), 'YYYYMMDDHH24MISS') || substr(md5(random()::text), 1, 4);

      insert into public.bookings (
        booking_code, user_id, room_id, check_in, check_out, guests, total_price, status, idempotency_key
      ) values (
        v_booking_code, p_user_id, v_room.id, p_check_in, p_check_out, p_guests, v_total_price, 'confirmed', p_idempotency_key
      )
      returning * into v_booking;

      return v_booking;
    end if;
  end loop;

  raise exception 'NO_ROOM_AVAILABLE';
end;
$$;
