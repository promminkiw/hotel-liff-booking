-- rooms: individual physical rooms, grouped by room_type
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text unique not null,
  room_type text not null,
  name text not null,
  description text,
  price_per_night numeric(10,2) not null,
  max_guests int not null,
  bed_type text,
  amenities jsonb not null default '[]'::jsonb,
  image_url text,
  status text not null default 'active' check (status in ('active', 'maintenance', 'inactive')),
  created_at timestamptz not null default now()
);

create index if not exists idx_rooms_room_type on public.rooms(room_type);

-- room_images: optional extra photos per room (image_url on rooms covers the single-photo case)
create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_room_images_room_id on public.room_images(room_id);
