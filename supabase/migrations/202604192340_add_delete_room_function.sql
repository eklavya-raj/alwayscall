create or replace function public.delete_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'You must be signed in to delete a room.';
  end if;

  if p_room_id is null then
    raise exception 'Room ID is required.';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.owner_id = v_user_id
  ) then
    raise exception 'Only the room owner can delete this room.';
  end if;

  delete from public.rooms r
  where r.id = p_room_id
    and r.owner_id = v_user_id;
end;
$$;

grant execute on function public.delete_room(uuid) to authenticated;
