import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamVideoClient, type User as StreamVideoUser } from '@stream-io/video-react-native-sdk';
import { FunctionsHttpError } from '@supabase/supabase-js';

import type { AppProfile } from '@/lib/profile';
import { isSupabaseConfigured, supabase, supabaseConfigError, supabasePublishableKey } from '@/lib/supabase';

type StreamTokenSuccessResponse = {
  data: {
    expires_at: string;
    token: string;
    user_id: string;
  };
  error: null;
};

type StreamTokenErrorResponse = {
  data: null;
  error: string;
};

type AuthenticatedStreamVideoUser = Exclude<
  StreamVideoUser,
  { type: 'guest' } | { type: 'anonymous' }
>;

const streamApiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

export const streamTokenFunctionName = 'stream-token';
export const isStreamConfigured = Boolean(streamApiKey);
export const streamConfigError = isStreamConfigured
  ? null
  : 'Missing `EXPO_PUBLIC_STREAM_API_KEY`.';

let streamClient: StreamVideoClient | null = null;
let streamClientUserId: string | null = null;
let streamClientPromise: Promise<StreamVideoClient> | null = null;
let streamClientPromiseUserId: string | null = null;
let disconnectPromise: Promise<void> | null = null;
let streamTokenRequestPromise: Promise<string> | null = null;
let streamLifecycleVersion = 0;
const persistedStreamUserKey = '@alwayscall/stream-user';

type PersistedStreamUser = {
  id: string;
  image?: string;
  name: string;
};

function getStreamSetupError() {
  if (!isSupabaseConfigured) {
    return supabaseConfigError ?? 'Supabase is not configured.';
  }

  if (!isStreamConfigured) {
    return streamConfigError ?? 'Stream is not configured.';
  }

  if (!supabasePublishableKey) {
    return 'Missing Supabase publishable key for Edge Function authentication.';
  }

  return null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while connecting to Stream.';
}

export function buildStreamVideoUser(profile: AppProfile): AuthenticatedStreamVideoUser {
  const user: AuthenticatedStreamVideoUser = {
    id: profile.id,
    name: profile.full_name,
  };

  if (profile.avatar_url) {
    user.image = profile.avatar_url;
  }

  return user;
}

export async function persistStreamUser(streamUser: AuthenticatedStreamVideoUser) {
  const payload: PersistedStreamUser = {
    id: streamUser.id,
    image: streamUser.image,
    name: streamUser.name ?? streamUser.id,
  };

  await AsyncStorage.setItem(persistedStreamUserKey, JSON.stringify(payload));
}

export async function clearPersistedStreamUser() {
  await AsyncStorage.removeItem(persistedStreamUserKey);
}

export async function getPersistedStreamUser(): Promise<AuthenticatedStreamVideoUser | null> {
  const serialized = await AsyncStorage.getItem(persistedStreamUserKey);

  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as PersistedStreamUser;

    return {
      id: parsed.id,
      image: parsed.image,
      name: parsed.name,
    };
  } catch {
    await AsyncStorage.removeItem(persistedStreamUserKey);
    return null;
  }
}

export async function requestStreamUserToken() {
  if (streamTokenRequestPromise) {
    return streamTokenRequestPromise;
  }

  streamTokenRequestPromise = (async () => {
    const configurationError = getStreamSetupError();

    if (configurationError) {
      throw new Error(configurationError);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error('You must be signed in to request a Stream token.');
    }

    const { data, error } = await supabase.functions.invoke<
      StreamTokenSuccessResponse | StreamTokenErrorResponse
    >(streamTokenFunctionName, {
      body: {},
      headers: {
        apikey: supabasePublishableKey!,
      },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        let payload: StreamTokenSuccessResponse | StreamTokenErrorResponse | null = null;

        try {
          payload =
            (await error.context.json()) as StreamTokenSuccessResponse | StreamTokenErrorResponse;
        } catch {
          payload = null;
        }

        const message =
          payload && 'error' in payload && payload.error
            ? payload.error
            : `Stream token request failed with status ${error.context.status}.`;

        throw new Error(message);
      }

      throw new Error(error.message);
    }

    if (!data?.data?.token) {
      const message =
        data && 'error' in data && data.error
          ? data.error
          : 'Stream token response did not contain a token.';

      throw new Error(message);
    }

    return data.data.token;
  })().finally(() => {
    streamTokenRequestPromise = null;
  });

  return streamTokenRequestPromise;
}

export async function getOrCreateStreamVideoClient(streamUser: AuthenticatedStreamVideoUser) {
  const configurationError = getStreamSetupError();

  if (configurationError) {
    throw new Error(configurationError);
  }

  if (disconnectPromise) {
    await disconnectPromise;
  }

  if (streamClient && streamClientUserId === streamUser.id) {
    return streamClient;
  }

  if (streamClientPromise && streamClientPromiseUserId === streamUser.id) {
    return streamClientPromise;
  }

  if (streamClient || streamClientPromise) {
    await disconnectStreamVideoClient();
  }

  const lifecycleVersion = streamLifecycleVersion + 1;
  streamLifecycleVersion = lifecycleVersion;
  streamClientPromiseUserId = streamUser.id;

  streamClientPromise = (async () => {
    const token = await requestStreamUserToken();
    const tokenProvider = () => requestStreamUserToken();
    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: streamApiKey!,
      options: {
        maxConnectUserRetries: 3,
        onConnectUserError: (error: Error, allErrors: Error[]) => {
          console.warn('Failed to connect Stream user.', error, allErrors);
        },
        rejectCallWhenBusy: true,
      },
      token,
      tokenProvider,
      user: streamUser,
    });

    if (streamLifecycleVersion !== lifecycleVersion) {
      await client.disconnectUser().catch(() => undefined);
      throw new Error('Stream client initialization was superseded.');
    }

    await persistStreamUser(streamUser);
    streamClient = client;
    streamClientUserId = streamUser.id;

    return client;
  })()
    .catch((error) => {
      streamClient = null;
      streamClientUserId = null;
      throw error;
    })
    .finally(() => {
      streamClientPromise = null;
      streamClientPromiseUserId = null;
    });

  return streamClientPromise;
}

export async function disconnectStreamVideoClient() {
  if (disconnectPromise) {
    return disconnectPromise;
  }

  streamLifecycleVersion += 1;

  const pendingClient = streamClientPromise;
  const liveClient = streamClient;

  streamClient = null;
  streamClientUserId = null;
  streamClientPromise = null;
  streamClientPromiseUserId = null;
  streamTokenRequestPromise = null;

  disconnectPromise = (async () => {
    const clientToDisconnect =
      liveClient ?? (pendingClient ? await pendingClient.catch(() => null) : null);

    if (!clientToDisconnect) {
      return;
    }

    try {
      await clientToDisconnect.disconnectUser();
    } catch (error) {
      console.warn('Failed to disconnect the Stream client cleanly.', getErrorMessage(error));
    }
    await clearPersistedStreamUser().catch(() => undefined);
  })().finally(() => {
    disconnectPromise = null;
  });

  return disconnectPromise;
}
