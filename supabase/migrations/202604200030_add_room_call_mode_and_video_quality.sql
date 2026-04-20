-- Add per-room `call_mode` (audio/video) and preferred `video_quality`.
-- These drive client-side camera enablement + incoming video resolution.
-- We keep the Stream call_type as `default` for both modes so the existing
-- ringing flow works unchanged; audio-only is enforced in the client by
-- disabling the camera and calling setIncomingVideoEnabled(false).

alter table public.rooms
add column if not exists call_mode text not null default 'video',
add column if not exists video_quality text not null default 'auto';

alter table public.rooms
drop constraint if exists rooms_call_mode_check;
alter table public.rooms
add constraint rooms_call_mode_check
check (call_mode in ('audio', 'video'));

alter table public.rooms
drop constraint if exists rooms_video_quality_check;
alter table public.rooms
add constraint rooms_video_quality_check
check (video_quality in ('auto', '1080p', '720p', '480p'));

-- PostgreSQL does not allow `create or replace function` when the return
-- type changes, so drop the old signatures first.
drop function if exists public.get_room_payload(public.rooms);
drop function if exists public.create_room(text, text, text);
drop function if exists public.create_room(text, text, text, text, text);
drop function if exists public.get_room_by_code(text);
drop function if exists public.join_room(text, text);
drop function if exists public.list_my_rooms();
drop function if exists public.list_open_rooms();
drop function if exists public.build_room_invite_payload(public.room_invites);
drop function if exists public.list_incoming_room_invites();
drop function if exists public.list_room_invites(uuid);
drop function if exists public.create_room_invite(uuid, uuid);
drop function if exists public.respond_to_room_invite(uuid, text);

-- Keep the `get_room_payload` helper aligned with the new columns so every
-- RPC that builds on it returns them automatically.
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
  call_mode text,
  video_quality text,
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
    p_room.call_mode,
    p_room.video_quality,
    p_room.created_at,
    p_room.updated_at;
$$;

-- create_room accepts the two new optional parameters.
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

  -- Audio rooms do not use a preferred resolution; normalize to `auto`.
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

-- get_room_by_code / join_room / list_my_rooms all must expose the new columns.
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
  call_mode text,
  video_quality text,
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
    rooms.call_mode,
    rooms.video_quality,
    rooms.created_at,
    rooms.updated_at
  from public.rooms
  inner join public.room_memberships memberships
    on memberships.room_id = rooms.id
  where memberships.user_id = auth.uid()
  order by memberships.joined_at desc, rooms.updated_at desc;
$$;

create or replace function public.list_open_rooms()
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
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'You must be signed in to view open rooms.';
  end if;

  return query
  select payload.*
  from public.rooms r
  cross join lateral public.get_room_payload(r) payload
  where r.password_hash is null
  order by r.updated_at desc, r.created_at desc
  limit 24;
end;
$$;

-- Update invite payload + list functions so clients (and the overlay) know
-- whether the incoming ring is for an audio-only room and what quality to use.
create or replace function public.build_room_invite_payload(p_invite public.room_invites)
returns table (
  id uuid,
  room_id uuid,
  inviter_id uuid,
  invitee_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  responded_at timestamptz,
  room_code text,
  room_display_name text,
  room_owner_id uuid,
  stream_call_id text,
  ringing_call_id text,
  password_required boolean,
  call_mode text,
  video_quality text,
  inviter_full_name text,
  inviter_username text,
  inviter_avatar_url text,
  invitee_full_name text,
  invitee_username text,
  invitee_avatar_url text
)
language sql
stable
as $$
  select
    invites.id,
    invites.room_id,
    invites.inviter_id,
    invites.invitee_id,
    invites.status,
    invites.created_at,
    invites.updated_at,
    invites.responded_at,
    rooms.room_code,
    rooms.display_name as room_display_name,
    rooms.owner_id as room_owner_id,
    rooms.stream_call_id,
    invites.ringing_call_id,
    rooms.password_hash is not null as password_required,
    rooms.call_mode,
    rooms.video_quality,
    inviter.full_name as inviter_full_name,
    inviter.username as inviter_username,
    inviter.avatar_url as inviter_avatar_url,
    invitee.full_name as invitee_full_name,
    invitee.username as invitee_username,
    invitee.avatar_url as invitee_avatar_url
  from public.room_invites invites
  inner join public.rooms
    on rooms.id = invites.room_id
  inner join public.profiles inviter
    on inviter.id = invites.inviter_id
  inner join public.profiles invitee
    on invitee.id = invites.invitee_id
  where invites.id = p_invite.id;
$$;

create or replace function public.list_incoming_room_invites()
returns table (
  id uuid,
  room_id uuid,
  inviter_id uuid,
  invitee_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  responded_at timestamptz,
  room_code text,
  room_display_name text,
  room_owner_id uuid,
  stream_call_id text,
  ringing_call_id text,
  password_required boolean,
  call_mode text,
  video_quality text,
  inviter_full_name text,
  inviter_username text,
  inviter_avatar_url text,
  invitee_full_name text,
  invitee_username text,
  invitee_avatar_url text
)
language sql
security definer
set search_path = public, extensions
as $$
  select payload.*
  from public.room_invites invites
  cross join lateral public.build_room_invite_payload(invites) payload
  where invites.invitee_id = auth.uid()
    and invites.status = 'pending'
  order by invites.created_at desc;
$$;

create or replace function public.list_room_invites(p_room_id uuid)
returns table (
  id uuid,
  room_id uuid,
  inviter_id uuid,
  invitee_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  responded_at timestamptz,
  room_code text,
  room_display_name text,
  room_owner_id uuid,
  stream_call_id text,
  ringing_call_id text,
  password_required boolean,
  call_mode text,
  video_quality text,
  inviter_full_name text,
  inviter_username text,
  inviter_avatar_url text,
  invitee_full_name text,
  invitee_username text,
  invitee_avatar_url text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'You must be signed in to view room invites.';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.owner_id = v_user_id
  ) then
    raise exception 'Only the room owner can view invite activity.';
  end if;

  return query
  select payload.*
  from public.room_invites invites
  cross join lateral public.build_room_invite_payload(invites) payload
  where invites.room_id = p_room_id
  order by invites.created_at desc;
end;
$$;

create or replace function public.create_room_invite(p_room_id uuid, p_invitee_id uuid)
returns table (
  id uuid,
  room_id uuid,
  inviter_id uuid,
  invitee_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  responded_at timestamptz,
  room_code text,
  room_display_name text,
  room_owner_id uuid,
  stream_call_id text,
  ringing_call_id text,
  password_required boolean,
  call_mode text,
  video_quality text,
  inviter_full_name text,
  inviter_username text,
  inviter_avatar_url text,
  invitee_full_name text,
  invitee_username text,
  invitee_avatar_url text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms;
  v_invite public.room_invites;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to invite users.';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id;

  if not found then
    raise exception 'Room not found.';
  end if;

  if v_room.owner_id <> v_user_id then
    raise exception 'Only the room owner can send invites.';
  end if;

  if p_invitee_id = v_user_id then
    raise exception 'You are already in this room.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = p_invitee_id
      and is_onboarded = true
  ) then
    raise exception 'That user could not be invited.';
  end if;

  insert into public.room_invites (
    room_id,
    inviter_id,
    invitee_id,
    status,
    responded_at,
    ringing_call_id
  )
  values (
    v_room.id,
    v_user_id,
    p_invitee_id,
    'pending',
    null,
    public.generate_stream_call_id()
  )
  on conflict (room_id, invitee_id)
  where status = 'pending'
  do update
  set inviter_id = excluded.inviter_id,
      status = 'pending',
      responded_at = null,
      ringing_call_id = public.generate_stream_call_id(),
      updated_at = timezone('utc', now())
  returning *
  into v_invite;

  return query
  select *
  from public.build_room_invite_payload(v_invite);
end;
$$;

-- respond_to_room_invite returns a room payload on accept; keep it aligned.
create or replace function public.respond_to_room_invite(
  p_invite_id uuid,
  p_response text
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
declare
  v_user_id uuid := auth.uid();
  v_response text := lower(trim(coalesce(p_response, '')));
  v_invite public.room_invites;
  v_room public.rooms;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to respond to an invite.';
  end if;

  if v_response not in ('accept', 'decline') then
    raise exception 'Invite response must be accept or decline.';
  end if;

  select *
  into v_invite
  from public.room_invites
  where id = p_invite_id
    and invitee_id = v_user_id;

  if not found then
    raise exception 'Invite not found.';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'This invite has already been handled.';
  end if;

  select *
  into v_room
  from public.rooms
  where id = v_invite.room_id;

  if not found then
    raise exception 'Room not found.';
  end if;

  update public.room_invites
  set status = case when v_response = 'accept' then 'accepted' else 'declined' end,
      responded_at = timezone('utc', now())
  where id = v_invite.id
  returning *
  into v_invite;

  if v_response = 'accept' then
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
  end if;
end;
$$;

grant execute on function public.create_room(text, text, text, text, text) to authenticated;
grant execute on function public.get_room_by_code(text) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;
grant execute on function public.list_my_rooms() to authenticated;
grant execute on function public.list_open_rooms() to authenticated;
grant execute on function public.list_incoming_room_invites() to authenticated;
grant execute on function public.list_room_invites(uuid) to authenticated;
grant execute on function public.create_room_invite(uuid, uuid) to authenticated;
grant execute on function public.respond_to_room_invite(uuid, text) to authenticated;
