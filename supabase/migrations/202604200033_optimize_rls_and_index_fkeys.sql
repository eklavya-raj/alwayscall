-- Covering indexes for foreign keys on tables this app actively uses.
create index if not exists rooms_owner_id_idx
  on public.rooms (owner_id);
create index if not exists room_invites_inviter_id_idx
  on public.room_invites (inviter_id);

-- Rewrite RLS policies on profiles/rooms/room_memberships/room_invites so
-- `auth.uid()` is evaluated once per query instead of once per row.
-- See https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read rooms they belong to" on public.rooms;
create policy "Users can read rooms they belong to"
on public.rooms
for select
using (
  exists (
    select 1
    from public.room_memberships memberships
    where memberships.room_id = rooms.id
      and memberships.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their own rooms" on public.rooms;
create policy "Users can insert their own rooms"
on public.rooms
for insert
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their own rooms" on public.rooms;
create policy "Owners can update their own rooms"
on public.rooms
for update
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can read their memberships" on public.room_memberships;
create policy "Users can read their memberships"
on public.room_memberships
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read invites they participate in" on public.room_invites;
create policy "Users can read invites they participate in"
on public.room_invites
for select
using ((select auth.uid()) = inviter_id or (select auth.uid()) = invitee_id);

drop policy if exists "Owners can insert invites for their rooms" on public.room_invites;
create policy "Owners can insert invites for their rooms"
on public.room_invites
for insert
with check (
  (select auth.uid()) = inviter_id
  and exists (
    select 1
    from public.rooms
    where rooms.id = room_invites.room_id
      and rooms.owner_id = (select auth.uid())
  )
);

drop policy if exists "Participants can update their invites" on public.room_invites;
create policy "Participants can update their invites"
on public.room_invites
for update
using ((select auth.uid()) = inviter_id or (select auth.uid()) = invitee_id)
with check ((select auth.uid()) = inviter_id or (select auth.uid()) = invitee_id);
