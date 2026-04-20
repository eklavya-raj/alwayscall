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

grant execute on function public.list_open_rooms() to authenticated;
