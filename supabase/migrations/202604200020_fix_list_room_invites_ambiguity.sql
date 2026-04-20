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

grant execute on function public.list_room_invites(uuid) to authenticated;
