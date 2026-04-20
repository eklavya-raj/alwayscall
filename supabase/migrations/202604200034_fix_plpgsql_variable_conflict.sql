-- The RETURNS TABLE(...) output columns become PL/pgSQL variables inside the
-- function body. With `plpgsql.variable_conflict = error` (Supabase default),
-- any reference to a column whose name matches an OUT param throws
-- `column reference "..." is ambiguous`. We resolve this by telling PL/pgSQL
-- to prefer column references over the OUT variables in every affected RPC.

create or replace function public.create_room(
  p_display_name text,
  p_room_code text default null,
  p_password text default null,
  p_call_mode text default 'video',
  p_video_quality text default 'auto'
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
  call_mode text,
  video_quality text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_room_code text := lower(trim(coalesce(p_room_code, '')));
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_password text := trim(coalesce(p_password, ''));
  v_call_mode text := lower(trim(coalesce(p_call_mode, 'video')));
  v_video_quality text := lower(trim(coalesce(p_video_quality, 'auto')));
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

  if v_call_mode not in ('audio', 'video') then
    raise exception 'Room call mode must be audio or video.';
  end if;

  if v_video_quality not in ('auto', '1080p', '720p', '480p') then
    raise exception 'Room video quality must be auto, 1080p, 720p, or 480p.';
  end if;

  if v_call_mode = 'audio' then
    v_video_quality := 'auto';
  end if;

  insert into public.rooms (
    owner_id,
    room_code,
    display_name,
    stream_call_id,
    password_hash,
    call_mode,
    video_quality
  )
  values (
    v_user_id,
    v_room_code,
    v_display_name,
    public.generate_stream_call_id(),
    case
      when v_password = '' then null
      else extensions.crypt(v_password, extensions.gen_salt('bf'))
    end,
    v_call_mode,
    v_video_quality
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
  call_mode text,
  video_quality text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
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
  call_mode text,
  video_quality text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
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
