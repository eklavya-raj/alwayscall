-- Pin search_path on a few legacy helpers that ship with the older video
-- backend migration so the Supabase security linter goes quiet.

alter function public.is_video_room_member(uuid) set search_path = public;
alter function public.is_video_room_host(uuid) set search_path = public;
alter function public.set_updated_at() set search_path = public;
