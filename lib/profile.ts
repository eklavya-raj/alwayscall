import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export const usernamePattern = /^[a-z0-9_]{3,24}$/;
export const avatarsBucket = 'avatars';

export type AppProfile = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_onboarded: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CompleteProfileInput = {
  username: string;
  fullName: string;
  avatarUrl?: string | null;
};

export type SearchableProfile = Pick<
  AppProfile,
  'id' | 'username' | 'full_name' | 'avatar_url' | 'email'
>;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export function isProfileComplete(profile: AppProfile | null) {
  return Boolean(profile?.is_onboarded && profile.username && profile.full_name);
}

export function getDefaultProfileValues(user: User | null, profile: AppProfile | null) {
  const rawUsername =
    profile?.username ??
    user?.user_metadata?.username ??
    user?.email?.split('@')[0] ??
    '';

  return {
    email: profile?.email ?? user?.email ?? '',
    fullName: profile?.full_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '',
    username: normalizeUsername(rawUsername),
    avatarUrl:
      profile?.avatar_url ??
      (typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : ''),
  };
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, username, full_name, avatar_url, is_onboarded, completed_at, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle<AppProfile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertProfile(user: User, input: CompleteProfileInput) {
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    throw new Error('Your account is missing an email address.');
  }

  const username = normalizeUsername(input.username);
  const fullName = input.fullName.trim();
  const avatarUrl = input.avatarUrl?.trim() ? input.avatarUrl.trim() : null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        is_onboarded: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id, email, username, full_name, avatar_url, is_onboarded, completed_at, created_at, updated_at')
    .single<AppProfile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function searchProfiles(query: string, limit = 10) {
  const trimmedQuery = query.trim();
  const { data, error } = await supabase.rpc('search_profiles', {
    p_limit: limit,
    p_query: trimmedQuery,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as SearchableProfile[];
}

function getAvatarFileExtension(contentType: string | null, fallbackUri: string) {
  if (contentType?.includes('/')) {
    return contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  }

  const uriMatch = fallbackUri.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
  return uriMatch?.[1] ?? 'jpg';
}

export async function uploadProfileAvatar(userId: string, fileUri: string) {
  const response = await fetch(fileUri);

  if (!response.ok) {
    throw new Error('Unable to read the selected image.');
  }

  const contentType = response.headers.get('content-type');
  const fileExtension = getAvatarFileExtension(contentType, fileUri);
  const filePath = `${userId}/avatar-${Date.now()}.${fileExtension}`;
  const fileData = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(avatarsBucket).upload(filePath, fileData, {
    contentType: contentType ?? 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(avatarsBucket).getPublicUrl(filePath);
  return data.publicUrl;
}
