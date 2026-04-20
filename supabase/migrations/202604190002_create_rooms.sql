create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.rooms (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  room_code text not null,
  display_name text not null,
  stream_call_id text not null,
  password_hash text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint rooms_room_code_format check (room_code ~ '^[a-z0-9]{6,12}$'),
  constraint rooms_display_name_length check (char_length(trim(display_name)) between 1 and 80),
  constraint rooms_password_hash_requires_value check (
    password_hash is null or char_length(password_hash) > 0
  )
);

create unique index if not exists rooms_room_code_key on public.rooms (lower(room_code));
create unique index if not exists rooms_stream_call_id_key on public.rooms (stream_call_id);

create table if not exists public.room_memberships (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (room_id, user_id),
  constraint room_memberships_role_check check (role in ('owner', 'member'))
);

create index if not exists room_memberships_user_id_idx on public.room_memberships (user_id, joined_at desc);

create or replace function public.handle_rooms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_rooms_updated_at on public.rooms;

create trigger set_rooms_updated_at
before update on public.rooms
for each row
execute function public.handle_rooms_updated_at();

create or replace function public.generate_room_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := substring(encode(extensions.gen_random_bytes(6), 'hex') from 1 for 8);

    exit when not exists (
      select 1
      from public.rooms
      where lower(room_code) = lower(candidate)
    );
  end loop;

  return candidate;
end;
$$;

create or replace function public.get_room_payload(p_room public.rooms)
returns table (
  id uuid,
  owner_id uuid,
  room_code text,
  display_name text,
  stream_call_id text,
  password_required boolean,
  is_owner boolean,
  is_member boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
as $$
  select
    p_room.id,
    p_room.owner_id,
    p_room.room_code,
    p_room.display_name,
    p_room.stream_call_id,
    p_room.password_hash is not null as password_required,
    p_room.owner_id = auth.uid() as is_owner,
    exists (
      select 1
      from public.room_memberships memberships
      where memberships.room_id = p_room.id
        and memberships.user_id = auth.uid()
    ) as is_member,
    p_room.created_at,
    p_room.updated_at;
$$;

create or replace function public.create_room(
  p_display_name text,
  p_room_code text default null,
  p_password text default null
)
returns table (
  id uuid,
  owner_id uuid,
  room_code text,
  display_name text,
  stream_call_id text,
  password_required boolean,
  is_owner boolean,
  is_member boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_code text := lower(trim(coalesce(p_room_code, '')));
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_password text := trim(coalesce(p_password, ''));
  v_room public.rooms;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a room.';
  end if;

  if v_display_name = '' then
    raise exception 'Room name is required.';
  end if;

  if char_length(v_display_name) > 80 then
    raise exception 'Room name must be 80 characters or fewer.';
  end if;

  if v_room_code = '' then
    v_room_code := public.generate_room_code();
  end if;

  if v_room_code !~ '^[a-z0-9]{6,12}$' then
    raise exception 'Room code must be 6 to 12 lowercase letters or numbers.';
  end if;

  if v_password <> '' and char_length(v_password) < 4 then
    raise exception 'Room password must be at least 4 characters.';
  end if;

  insert into public.rooms (
    owner_id,
    room_code,
    display_name,
    stream_call_id,
    password_hash
  )
  values (
    v_user_id,
    v_room_code,
    v_display_name,
    v_room_code,
    case
      when v_password = '' then null
      else extensions.crypt(v_password, extensions.gen_salt('bf'))
    end
  )
  returning *
  into v_room;

  insert into public.room_memberships (room_id, user_id, role)
  values (v_room.id, v_user_id, 'owner')
  on conflict (room_id, user_id) do update
  set role = excluded.role;

  return query
  select *
  from public.get_room_payload(v_room);
exception
  when unique_violation then
    raise exception 'That room code is already in use. Pick a different code.';
end;
$$;

create or replace function public.get_room_by_code(p_room_code text)
returns table (
  id uuid,
  owner_id uuid,
  room_code text,
  display_name text,
  stream_call_id text,
  password_required boolean,
  is_owner boolean,
  is_member boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms;
  v_room_code text := lower(trim(coalesce(p_room_code, '')));
begin
  if v_user_id is null then
    raise exception 'You must be signed in to view rooms.';
  end if;

  if v_room_code = '' or v_room_code !~ '^[a-z0-9]{6,12}$' then
    raise exception 'Enter a valid room code.';
  end if;

  select *
  into v_room
  from public.rooms
  where lower(room_code) = v_room_code;

  if not found then
    raise exception 'Room not found.';
  end if;

  return query
  select *
  from public.get_room_payload(v_room);
end;
$$;

create or replace function public.join_room(
  p_room_code text,
  p_password text default null
)
returns table (
  id uuid,
  owner_id uuid,
  room_code text,
  display_name text,
  stream_call_id text,
  password_required boolean,
  is_owner boolean,
  is_member boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_code text := lower(trim(coalesce(p_room_code, '')));
  v_password text := trim(coalesce(p_password, ''));
  v_room public.rooms;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to join a room.';
  end if;

  if v_room_code = '' or v_room_code !~ '^[a-z0-9]{6,12}$' then
    raise exception 'Enter a valid room code.';
  end if;

  select *
  into v_room
  from public.rooms
  where lower(room_code) = v_room_code;

  if not found then
    raise exception 'Room not found.';
  end if;

  if v_room.password_hash is not null
    and v_room.owner_id <> v_user_id
    and not exists (
      select 1
      from public.room_memberships memberships
      where memberships.room_id = v_room.id
        and memberships.user_id = v_user_id
    ) then
    if v_password = '' then
      raise exception 'This room is password protected.';
    end if;

    if extensions.crypt(v_password, v_room.password_hash) <> v_room.password_hash then
      raise exception 'Incorrect room password.';
    end if;
  end if;

  insert into public.room_memberships (room_id, user_id, role)
  values (
    v_room.id,
    v_user_id,
    case when v_room.owner_id = v_user_id then 'owner' else 'member' end
  )
  on conflict (room_id, user_id) do update
  set joined_at = timezone('utc', now());

  return query
  select *
  from public.get_room_payload(v_room);
end;
$$;

create or replace function public.list_my_rooms()
returns table (
  id uuid,
  owner_id uuid,
  room_code text,
  display_name text,
  stream_call_id text,
  password_required boolean,
  is_owner boolean,
  is_member boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    rooms.id,
    rooms.owner_id,
    rooms.room_code,
    rooms.display_name,
    rooms.stream_call_id,
    rooms.password_hash is not null as password_required,
    rooms.owner_id = auth.uid() as is_owner,
    true as is_member,
    rooms.created_at,
    rooms.updated_at
  from public.rooms
  inner join public.room_memberships memberships
    on memberships.room_id = rooms.id
  where memberships.user_id = auth.uid()
  order by memberships.joined_at desc, rooms.updated_at desc;
$$;

alter table public.rooms enable row level security;
alter table public.room_memberships enable row level security;

drop policy if exists "Users can read rooms they belong to" on public.rooms;
create policy "Users can read rooms they belong to"
on public.rooms
for select
using (
  exists (
    select 1
    from public.room_memberships memberships
    where memberships.room_id = rooms.id
      and memberships.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert their own rooms" on public.rooms;
create policy "Users can insert their own rooms"
on public.rooms
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own rooms" on public.rooms;
create policy "Owners can update their own rooms"
on public.rooms
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Users can read their memberships" on public.room_memberships;
create policy "Users can read their memberships"
on public.room_memberships
for select
using (auth.uid() = user_id);

grant execute on function public.generate_room_code() to authenticated;
grant execute on function public.create_room(text, text, text) to authenticated;
grant execute on function public.get_room_by_code(text) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;
grant execute on function public.list_my_rooms() to authenticated;
