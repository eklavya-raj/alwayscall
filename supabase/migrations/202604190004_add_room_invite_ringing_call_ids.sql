create or replace function public.generate_stream_call_id()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := encode(extensions.gen_random_bytes(16), 'hex');

    exit when not exists (
      select 1
      from public.rooms
      where stream_call_id = candidate
    )
    and not exists (
      select 1
      from public.room_invites
      where ringing_call_id = candidate
    );
  end loop;

  return candidate;
end;
$$;

alter table public.room_invites
add column if not exists ringing_call_id text;

update public.room_invites
set ringing_call_id = public.generate_stream_call_id()
where ringing_call_id is null
   or ringing_call_id = '';

alter table public.room_invites
alter column ringing_call_id set default public.generate_stream_call_id();

alter table public.room_invites
alter column ringing_call_id set not null;

create unique index if not exists room_invites_ringing_call_id_idx
on public.room_invites (ringing_call_id);

drop function if exists public.list_incoming_room_invites();
drop function if exists public.list_room_invites(uuid);
drop function if exists public.create_room_invite(uuid, uuid);
drop function if exists public.build_room_invite_payload(public.room_invites);

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
    from public.rooms
    where id = p_room_id
      and owner_id = v_user_id
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

grant execute on function public.list_incoming_room_invites() to authenticated;
grant execute on function public.list_room_invites(uuid) to authenticated;
grant execute on function public.create_room_invite(uuid, uuid) to authenticated;
