-- Pin an immutable search_path on every helper/trigger function we own so
-- the Supabase security linter stops flagging them and so they behave
-- deterministically regardless of the caller's session.

alter function public.generate_room_code() set search_path = public, extensions;
alter function public.generate_stream_call_id() set search_path = public, extensions;
alter function public.get_room_payload(public.rooms) set search_path = public, extensions;
alter function public.build_room_invite_payload(public.room_invites) set search_path = public, extensions;
alter function public.handle_profiles_updated_at() set search_path = public;
alter function public.handle_rooms_updated_at() set search_path = public;
alter function public.handle_room_invites_updated_at() set search_path = public;
