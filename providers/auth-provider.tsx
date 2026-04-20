import { StreamVideoRN } from '@stream-io/video-react-native-sdk';
import type { Session, User } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AuthContext } from '@/hooks/use-auth';
import { fetchProfile, isProfileComplete, upsertProfile, type AppProfile, type CompleteProfileInput } from '@/lib/profile';
import { disconnectStreamVideoClient } from '@/lib/stream';
import {
    isSupabaseConfigured,
    supabase,
    supabaseConfigError,
} from '@/lib/supabase';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while processing authentication.';
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(supabaseConfigError);
  const profileRequestRef = useRef(0);

  const syncProfile = useCallback(async (user: User | null) => {
    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;

    if (!user || !isSupabaseConfigured) {
      setProfile(null);
      setIsProfileLoading(false);
      return null;
    }

    setIsProfileLoading(true);

    try {
      const nextProfile = await fetchProfile(user.id);

      if (profileRequestRef.current === requestId) {
        setProfile(nextProfile);
      }

      return nextProfile;
    } catch (error) {
      if (profileRequestRef.current === requestId) {
        setProfile(null);
        setAuthError(getErrorMessage(error));
      }

      return null;
    } finally {
      if (profileRequestRef.current === requestId) {
        setIsProfileLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        const resolvedSession = data.session;
        setSession(resolvedSession);

        if (!isMounted) {
          return;
        }

        await syncProfile(resolvedSession?.user ?? null);
      } catch (error) {
        if (isMounted) {
          setAuthError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrapSession();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void syncProfile(nextSession?.user ?? null);

      if (nextSession) {
        setAuthError(null);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
  }, [syncProfile]);

  const requestEmailOtp = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError ?? 'Supabase is not configured.');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }

    setAuthError(null);
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, token: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError ?? 'Supabase is not configured.');
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw error;
    }

    setAuthError(null);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    await disconnectStreamVideoClient();
    await StreamVideoRN.onPushLogout().catch(() => undefined);

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setProfile(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await syncProfile(session?.user ?? null);
  }, [session?.user, syncProfile]);

  const completeProfile = useCallback(
    async (input: CompleteProfileInput) => {
      if (!session?.user) {
        throw new Error('You must be signed in to complete your account.');
      }

      const nextProfile = await upsertProfile(session.user, input);
      setProfile(nextProfile);
      setAuthError(null);

      return nextProfile;
    },
    [session]
  );

  const isLoading = isAuthLoading || isProfileLoading;
  const hasCompletedProfile = isProfileComplete(profile);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      // Only true during the very first auth bootstrap. Does NOT flip back to
      // true on subsequent profile refetches, so navigation guards won't
      // unmount the active room screen mid-call when the profile reloads.
      isAuthBootstrapping: isAuthLoading,
      isAuthenticated: Boolean(session?.user),
      isProfileComplete: hasCompletedProfile,
      isSupabaseConfigured,
      authError,
      clearAuthError,
      completeProfile,
      refreshProfile,
      requestEmailOtp,
      verifyEmailOtp,
      signOut,
    }),
    [
      authError,
      clearAuthError,
      completeProfile,
      hasCompletedProfile,
      isAuthLoading,
      isLoading,
      profile,
      requestEmailOtp,
      refreshProfile,
      session,
      signOut,
      verifyEmailOtp,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
