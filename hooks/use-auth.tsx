import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

import type { AppProfile, CompleteProfileInput } from '@/lib/profile';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  isLoading: boolean;
  isAuthBootstrapping: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isSupabaseConfigured: boolean;
  authError: string | null;
  clearAuthError: () => void;
  completeProfile: (input: CompleteProfileInput) => Promise<AppProfile>;
  refreshProfile: () => Promise<void>;
  requestEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
