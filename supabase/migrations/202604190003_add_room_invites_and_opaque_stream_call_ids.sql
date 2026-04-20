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
    );
  end loop;

  return candidate;
end;
$$;

alter table public.rooms
alter column stream_call_id set default public.generate_stream_call_id();

update public.rooms
set stream_call_id = public.generate_stream_call_id()
where stream_call_id is null
   or stream_call_id = room_code;

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
    public.generate_stream_call_id(),
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

create table if not exists public.room_invites (
  id uuid primary key default extensions.gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  constraint room_invites_status_check check (status in ('pending', 'accepted', 'declined', 'canceled')),
  constraint room_invites_no_self_invite check (inviter_id <> invitee_id)
);

create unique index if not exists room_invites_one_pending_per_room_invitee_idx
on public.room_invites (room_id, invitee_id)
where status = 'pending';

create index if not exists room_invites_invitee_status_created_idx
on public.room_invites (invitee_id, status, created_at desc);

create index if not exists room_invites_room_status_created_idx
on public.room_invites (room_id, status, created_at desc);

create or replace function public.handle_room_invites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_room_invites_updated_at on public.room_invites;

create trigger set_room_invites_updated_at
before update on public.room_invites
for each row
execute function public.handle_room_invites_updated_at();

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

create or replace function public.search_profiles(p_query text default '', p_limit integer default 10)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  email text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_query text := lower(trim(coalesce(p_query, '')));
  v_limit integer := greatest(1, least(coalesce(p_limit, 10), 20));
begin
  if v_user_id is null then
    raise exception 'You must be signed in to search users.';
  end if;

  return query
  select
    profiles.id,
    profiles.username,
    profiles.full_name,
    profiles.avatar_url,
    profiles.email
  from public.profiles
  where profiles.is_onboarded = true
    and profiles.id <> v_user_id
    and (
      v_query = ''
      or lower(profiles.username) like '%' || v_query || '%'
      or lower(profiles.full_name) like '%' || v_query || '%'
      or lower(profiles.email) like '%' || v_query || '%'
    )
  order by
    case when v_query <> '' and lower(profiles.username) = v_query then 0 else 1 end,
    case when v_query <> '' and lower(profiles.email) = v_query then 0 else 1 end,
    profiles.full_name asc,
    profiles.username asc
  limit v_limit;
end;
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

  insert into public.room_invites (room_id, inviter_id, invitee_id, status, responded_at)
  values (v_room.id, v_user_id, p_invitee_id, 'pending', null)
  on conflict (room_id, invitee_id)
  where status = 'pending'
  do update
  set inviter_id = excluded.inviter_id,
      status = 'pending',
      responded_at = null,
      updated_at = timezone('utc', now())
  returning *
  into v_invite;

  return query
  select *
  from public.build_room_invite_payload(v_invite);
end;
$$;

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

alter table public.room_invites enable row level security;

drop policy if exists "Users can read invites they participate in" on public.room_invites;
create policy "Users can read invites they participate in"
on public.room_invites
for select
using (auth.uid() = inviter_id or auth.uid() = invitee_id);

drop policy if exists "Owners can insert invites for their rooms" on public.room_invites;
create policy "Owners can insert invites for their rooms"
on public.room_invites
for insert
with check (
  auth.uid() = inviter_id
  and exists (
    select 1
    from public.rooms
    where rooms.id = room_invites.room_id
      and rooms.owner_id = auth.uid()
  )
);

drop policy if exists "Participants can update their invites" on public.room_invites;
create policy "Participants can update their invites"
on public.room_invites
for update
using (auth.uid() = inviter_id or auth.uid() = invitee_id)
with check (auth.uid() = inviter_id or auth.uid() = invitee_id);

grant execute on function public.generate_stream_call_id() to authenticated;
grant execute on function public.search_profiles(text, integer) to authenticated;
grant execute on function public.list_incoming_room_invites() to authenticated;
grant execute on function public.list_room_invites(uuid) to authenticated;
grant execute on function public.create_room_invite(uuid, uuid) to authenticated;
grant execute on function public.respond_to_room_invite(uuid, text) to authenticated;
