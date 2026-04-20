import { StreamVideo, type StreamVideoClient } from '@stream-io/video-react-native-sdk';
import * as Notifications from 'expo-notifications';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { StreamContext } from '@/hooks/use-stream';
import {
    buildStreamVideoUser,
    disconnectStreamVideoClient,
    getOrCreateStreamVideoClient,
    isStreamConfigured,
    streamConfigError,
} from '@/lib/stream';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while connecting to Stream.';
}

export default function StreamProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isProfileComplete, profile } = useAuth();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [streamError, setStreamError] = useState<string | null>(streamConfigError);
  const [isStreamLoading, setIsStreamLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const streamProfile = profile;

    // Intentionally NOT depending on `isLoading` from `useAuth` — that flag
    // includes transient `isProfileLoading` flickers (e.g. when
    // `refreshProfile` runs) which would otherwise tear down the Stream
    // WebSocket mid-call and drop the user from the active room.
    const shouldConnect = Boolean(
      isAuthenticated &&
        isProfileComplete &&
        streamProfile &&
        isStreamConfigured
    );

    if (!shouldConnect) {
      setClient(null);
      setIsStreamLoading(false);
      setStreamError(isStreamConfigured ? null : streamConfigError);
      void disconnectStreamVideoClient();

      return () => {
        isCancelled = true;
      };
    }

    const connectStreamClient = async () => {
      try {
        setIsStreamLoading(true);
        setStreamError(null);

        if (!streamProfile) {
          return;
        }

        const nextClient = await getOrCreateStreamVideoClient(buildStreamVideoUser(streamProfile));

        if (!isCancelled) {
          setClient(nextClient);
        }
      } catch (error) {
        if (!isCancelled) {
          setClient(null);
          setStreamError(getErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsStreamLoading(false);
        }
      }
    };

    void connectStreamClient();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isProfileComplete, profile]);

  useEffect(() => {
    if (!isAuthenticated || !isProfileComplete) {
      return;
    }

    void Notifications.requestPermissionsAsync();
  }, [isAuthenticated, isProfileComplete]);

  useEffect(() => {
    return () => {
      void disconnectStreamVideoClient();
    };
  }, []);

  const value = useMemo(
    () => ({
      client,
      error: streamError,
      isLoading: isStreamLoading,
      isReady: Boolean(client),
    }),
    [client, isStreamLoading, streamError]
  );

  const content = client ? <StreamVideo client={client}>{children}</StreamVideo> : children;

  return <StreamContext.Provider value={value}>{content}</StreamContext.Provider>;
}
