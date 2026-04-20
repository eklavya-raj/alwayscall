import type { AppRoom, RoomCallDescriptor, RoomCallMode, RoomVideoQuality } from '@/lib/rooms';
import { roomCallType } from '@/lib/rooms';
import { supabase } from '@/lib/supabase';

export type RoomInviteStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

export type RoomInvite = {
  id: string;
  room_id: string;
  inviter_id: string;
  invitee_id: string;
  status: RoomInviteStatus;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  room_code: string;
  room_display_name: string;
  room_owner_id: string;
  stream_call_id: string;
  ringing_call_id: string;
  password_required: boolean;
  call_mode: RoomCallMode;
  video_quality: RoomVideoQuality;
  inviter_full_name: string;
  inviter_username: string;
  inviter_avatar_url: string | null;
  invitee_full_name: string;
  invitee_username: string;
  invitee_avatar_url: string | null;
};

type InviteResponseAction = 'accept' | 'decline';

type SupabaseErrorLike = {
  message?: string;
};

export function getInviteRingingCallDescriptor(
  invite: Pick<RoomInvite, 'ringing_call_id'>
): RoomCallDescriptor {
  return {
    callId: invite.ringing_call_id,
    callType: roomCallType,
  };
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as SupabaseErrorLike).message ?? 'Unable to manage invites right now.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to manage invites right now.';
}

export async function listIncomingRoomInvites() {
  const { data, error } = await supabase.rpc('list_incoming_room_invites');

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as RoomInvite[];
}

export async function listRoomInvites(roomId: string) {
  const { data, error } = await supabase.rpc('list_room_invites', {
    p_room_id: roomId,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as RoomInvite[];
}

export async function createRoomInvite(roomId: string, inviteeId: string) {
  const { data, error } = await supabase.rpc('create_room_invite', {
    p_invitee_id: inviteeId,
    p_room_id: roomId,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const invite = Array.isArray(data) ? data[0] : data;

  if (!invite) {
    throw new Error('Invite creation did not return an invite.');
  }

  return invite as RoomInvite;
}

export async function respondToRoomInvite(inviteId: string, response: InviteResponseAction) {
  const { data, error } = await supabase.rpc('respond_to_room_invite', {
    p_invite_id: inviteId,
    p_response: response,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (response === 'decline') {
    return null;
  }

  const room = Array.isArray(data) ? data[0] : data;

  if (!room) {
    throw new Error('Invite acceptance did not return a room.');
  }

  return room as AppRoom;
}
