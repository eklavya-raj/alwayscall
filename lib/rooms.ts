import type { Href } from 'expo-router';

import { supabase } from '@/lib/supabase';

export const roomCodePattern = /^[a-z0-9]{6,12}$/;
export const roomNameMaxLength = 80;
export const roomPasswordMinLength = 4;
export const roomPasswordMaxLength = 72;
export const roomCallType = 'default';

export const roomCallModes = ['audio', 'video'] as const;
export type RoomCallMode = (typeof roomCallModes)[number];

export const roomVideoQualities = ['auto', '1080p', '720p', '480p'] as const;
export type RoomVideoQuality = (typeof roomVideoQualities)[number];

export type VideoDimension = { width: number; height: number };

export function getPreferredVideoResolution(
  quality: RoomVideoQuality
): VideoDimension | null {
  switch (quality) {
    case '1080p':
      return { width: 1920, height: 1080 };
    case '720p':
      return { width: 1280, height: 720 };
    case '480p':
      return { width: 640, height: 480 };
    case 'auto':
    default:
      return null;
  }
}

export type AppRoom = {
  id: string;
  owner_id: string;
  room_code: string;
  display_name: string;
  stream_call_id: string;
  password_required: boolean;
  is_owner: boolean;
  is_member: boolean;
  call_mode: RoomCallMode;
  video_quality: RoomVideoQuality;
  created_at: string;
  updated_at: string;
};

export type CreateRoomInput = {
  displayName: string;
  roomCode?: string;
  password?: string;
  callMode?: RoomCallMode;
  videoQuality?: RoomVideoQuality;
};

export type JoinRoomInput = {
  roomCode: string;
  password?: string;
};

export type RoomCallDescriptor = {
  callId: string;
  callType: typeof roomCallType;
};

type SupabaseErrorLike = {
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as SupabaseErrorLike).message ?? 'Unable to reach rooms right now.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to reach rooms right now.';
}

function coerceRoomResult(data: AppRoom[] | AppRoom | null, fallbackMessage: string) {
  const room = Array.isArray(data) ? data[0] : data;

  if (!room) {
    throw new Error(fallbackMessage);
  }

  return room;
}

export function normalizeRoomCode(roomCode: string) {
  return roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function buildRoomRoute(roomCode: string): Href {
  const normalizedRoomCode = normalizeRoomCode(roomCode);

  if (!normalizedRoomCode) {
    throw new Error('Room code is required.');
  }

  return {
    pathname: '/rooms/[roomCode]',
    params: {
      roomCode: normalizedRoomCode,
    },
  };
}

export function getRoomCallDescriptor(room: Pick<AppRoom, 'stream_call_id'>): RoomCallDescriptor {
  return {
    callId: room.stream_call_id,
    callType: roomCallType,
  };
}

export function validateRoomDisplayName(displayName: string) {
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    return 'Enter a room name.';
  }

  if (trimmedName.length > roomNameMaxLength) {
    return `Room name must be ${roomNameMaxLength} characters or fewer.`;
  }

  return null;
}

export function validateRoomCode(roomCode: string, options?: { required?: boolean }) {
  const normalizedRoomCode = normalizeRoomCode(roomCode);

  if (!normalizedRoomCode) {
    return options?.required ? 'Enter a room code.' : null;
  }

  if (!roomCodePattern.test(normalizedRoomCode)) {
    return 'Room code must be 6 to 12 lowercase letters or numbers.';
  }

  return null;
}

export function validateRoomPassword(password: string, options?: { required?: boolean }) {
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return options?.required ? 'Enter the room password.' : null;
  }

  if (trimmedPassword.length < roomPasswordMinLength) {
    return `Password must be at least ${roomPasswordMinLength} characters.`;
  }

  if (trimmedPassword.length > roomPasswordMaxLength) {
    return `Password must be ${roomPasswordMaxLength} characters or fewer.`;
  }

  return null;
}

export async function createRoom(input: CreateRoomInput) {
  const displayName = input.displayName.trim();
  const roomCode = normalizeRoomCode(input.roomCode ?? '');
  const password = input.password?.trim() ?? '';
  const callMode: RoomCallMode = input.callMode ?? 'video';
  // Audio-mode rooms do not use a preferred resolution; normalize on the client
  // too so UI state stays consistent with what the DB will persist.
  const videoQuality: RoomVideoQuality =
    callMode === 'audio' ? 'auto' : input.videoQuality ?? 'auto';

  const { data, error } = await supabase.rpc('create_room', {
    p_call_mode: callMode,
    p_display_name: displayName,
    p_password: password || null,
    p_room_code: roomCode || null,
    p_video_quality: videoQuality,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return coerceRoomResult(data as AppRoom[] | AppRoom | null, 'Room creation did not return a room.');
}

export async function fetchRoomByCode(roomCode: string) {
  const normalizedRoomCode = normalizeRoomCode(roomCode);

  const { data, error } = await supabase.rpc('get_room_by_code', {
    p_room_code: normalizedRoomCode,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return coerceRoomResult(data as AppRoom[] | AppRoom | null, 'Room lookup did not return a room.');
}

export async function joinRoom(input: JoinRoomInput) {
  const roomCode = normalizeRoomCode(input.roomCode);
  const password = input.password?.trim() ?? '';

  const { data, error } = await supabase.rpc('join_room', {
    p_password: password || null,
    p_room_code: roomCode,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return coerceRoomResult(data as AppRoom[] | AppRoom | null, 'Room join did not return a room.');
}

export async function listMyRooms() {
  const { data, error } = await supabase.rpc('list_my_rooms');

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as AppRoom[];
}

export async function listOpenRooms() {
  const { data, error } = await supabase.rpc('list_open_rooms');

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as AppRoom[];
}

export async function deleteRoom(roomId: string) {
  const { error } = await supabase.rpc('delete_room', {
    p_room_id: roomId,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
