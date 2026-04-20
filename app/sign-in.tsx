import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

const YELLOW = '#FDE047';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to continue passwordless sign in right now.';
}

export default function SignInScreen() {
  const { authError, clearAuthError, isSupabaseConfigured, requestEmailOtp, verifyEmailOtp } =
    useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusMessage = useMemo(() => authError ?? localMessage, [authError, localMessage]);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    clearAuthError();
    setLocalMessage(null);

    if (!isValidEmail(trimmedEmail)) {
      setLocalMessage('Enter a valid email address to receive your OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      await requestEmailOtp(trimmedEmail);
      setEmail(trimmedEmail);
      setIsOtpSent(true);
      setLocalMessage(`OTP sent to ${trimmedEmail}. Enter the 6-digit code to continue.`);
    } catch (error) {
      setLocalMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    clearAuthError();
    setLocalMessage(null);

    if (!isValidEmail(trimmedEmail)) {
      setLocalMessage('Enter a valid email address first.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setLocalMessage('Enter the 6-digit OTP sent to your email.');
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyEmailOtp(trimmedEmail, trimmedOtp);
      setLocalMessage('OTP verified. Finishing sign in now.');
    } catch (error) {
      setLocalMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFlow = () => {
    clearAuthError();
    setIsOtpSent(false);
    setOtp('');
    setLocalMessage(null);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
      <AppScreen>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', default: undefined })}
          style={styles.flex}>
          <Pressable style={styles.container}>
            <Pressable style={styles.card}>
              <ThemedText style={styles.brand}>AlwaysCall</ThemedText>
              <ThemedText style={styles.description}>
                One passwordless flow. Enter your email, receive the code, and verify to continue.
              </ThemedText>

              <ThemedText style={styles.fieldLabel}>EMAIL</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={(nextValue) => {
                  setEmail(nextValue);
                  clearAuthError();
                }}
                placeholder="you@example.com"
                placeholderTextColor={MUTED}
                style={styles.input}
                value={email}
              />

              {isOtpSent ? (
                <>
                  <ThemedText style={styles.fieldLabel}>OTP</ThemedText>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={(nextValue) => {
                      setOtp(nextValue.replace(/\D/g, ''));
                      clearAuthError();
                    }}
                    placeholder="123456"
                    placeholderTextColor={MUTED}
                    style={[styles.input, styles.otpInput]}
                    value={otp}
                  />
                </>
              ) : null}

              {statusMessage ? <ThemedText style={styles.statusMessage}>{statusMessage}</ThemedText> : null}

              <Pressable
                disabled={!isSupabaseConfigured || isSubmitting}
                onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                style={({ pressed }) => [
                  styles.button,
                  (!isSupabaseConfigured || isSubmitting) && styles.buttonDisabled,
                  pressed && isSupabaseConfigured && !isSubmitting ? styles.buttonPressed : null,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={BLACK} />
                ) : (
                  <ThemedText style={styles.buttonLabel}>{isOtpSent ? 'Verify OTP' : 'Send OTP'}</ThemedText>
                )}
              </Pressable>

              {isOtpSent ? (
                <Pressable
                  disabled={isSubmitting}
                  onPress={handleResetFlow}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    isSubmitting && styles.buttonDisabled,
                    pressed && !isSubmitting ? styles.buttonPressed : null,
                  ]}>
                  <ThemedText style={styles.secondaryButtonLabel}>Change Email</ThemedText>
                </Pressable>
              ) : null}

              <ThemedText style={styles.helpText}>
                {!isSupabaseConfigured
                  ? 'Add your Supabase project URL and publishable key to Expo env vars before testing.'
                  : 'This app uses one passwordless OTP flow. There is no separate signup screen.'}
              </ThemedText>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </AppScreen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 24,
  },
  brand: {
    color: '#FAFAFA',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  description: {
    color: MUTED,
    lineHeight: 20,
  },
  fieldLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: '#E5E5E5',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusMessage: {
    minHeight: 24,
  },
  otpInput: {
    letterSpacing: 6,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: BLACK,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    color: '#E5E5E5',
    fontWeight: '600',
  },
  helpText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
});
