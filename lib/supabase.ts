import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseCallbackPath = '/auth/callback';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Missing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `EXPO_PUBLIC_SUPABASE_ANON_KEY`).';

// The placeholder values keep the client constructible in local environments until env vars exist.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabasePublishableKey ?? 'placeholder-publishable-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export function getSupabaseFunctionUrl(functionName: string) {
  if (!supabaseUrl) {
    throw new Error('Supabase is not configured.');
  }

  return new URL(`/functions/v1/${functionName}`, supabaseUrl).toString();
}
