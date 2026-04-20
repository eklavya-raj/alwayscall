import type { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { createContext, useContext } from 'react';

export type StreamContextValue = {
  client: StreamVideoClient | null;
  error: string | null;
  isReady: boolean;
  isLoading: boolean;
};

export const StreamContext = createContext<StreamContextValue | null>(null);

export function useStream() {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error('useStream must be used within a StreamProvider.');
  }

  return context;
}
