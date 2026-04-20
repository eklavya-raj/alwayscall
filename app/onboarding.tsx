import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { getDefaultProfileValues, normalizeUsername, usernamePattern } from '@/lib/profile';

const YELLOW = '#FDE047';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('duplicate key')) {
      return 'That username is already taken. Choose a different one.';
    }

    return error.message;
  }

  return 'Unable to save your account right now.';
}

export default function OnboardingScreen() {
  const { authError, clearAuthError, completeProfile, profile, signOut, user } = useAuth();
  const defaults = useMemo(() => getDefaultProfileValues(user, profile), [profile, user]);
  const [fullName, setFullName] = useState(defaults.fullName);
  const [username, setUsername] = useState(defaults.username);
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setFullName(defaults.fullName);
    setUsername(defaults.username);
    setAvatarUrl(defaults.avatarUrl);
  }, [defaults.avatarUrl, defaults.fullName, defaults.username]);

  const trimmedFullName = fullName.trim();
  const normalizedUsername = normalizeUsername(username);
  const trimmedAvatarUrl = avatarUrl.trim();
  const statusMessage = useMemo(() => authError ?? localMessage, [authError, localMessage]);

  const validationMessage = useMemo(() => {
    if (!trimmedFullName) {
      return 'Enter the name you want other callers to see.';
    }

    if (!usernamePattern.test(normalizedUsername)) {
      return 'Username must be 3 to 24 characters using lowercase letters, numbers, or underscores.';
    }

    if (trimmedAvatarUrl) {
      try {
        const parsedUrl = new URL(trimmedAvatarUrl);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return 'Avatar URL must start with http:// or https://.';
        }
      } catch {
        return 'Avatar URL must be a valid web address.';
      }
    }

    return null;
  }, [normalizedUsername, trimmedAvatarUrl, trimmedFullName]);

  const handleSaveProfile = async () => {
    clearAuthError();
    setLocalMessage(null);

    if (validationMessage) {
      setLocalMessage(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      await completeProfile({
        fullName: trimmedFullName,
        username: normalizedUsername,
        avatarUrl: trimmedAvatarUrl || undefined,
      });
      setLocalMessage('Account saved. Redirecting to the app...');
    } catch (error) {
      setLocalMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Complete Account', headerShown: false }} />
      <AppScreen>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', default: undefined })}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Pressable style={styles.card}>
              <ThemedText style={styles.screenTitle}>Complete Profile</ThemedText>
              <ThemedText style={styles.description}>
                Finish your profile once so other callers can identify you instantly.
              </ThemedText>

              <ThemedText style={styles.fieldLabel}>EMAIL</ThemedText>
              <Pressable style={styles.readOnlyField}>
                <ThemedText style={styles.readOnlyText}>{defaults.email || 'Unknown email'}</ThemedText>
              </Pressable>

              <ThemedText style={styles.fieldLabel}>FULL NAME</ThemedText>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={(nextValue) => {
                  setFullName(nextValue);
                  clearAuthError();
                }}
                placeholder="Jane Doe"
                placeholderTextColor={MUTED}
                style={styles.input}
                value={fullName}
              />

              <ThemedText style={styles.fieldLabel}>USERNAME</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(nextValue) => {
                  setUsername(normalizeUsername(nextValue));
                  clearAuthError();
                }}
                placeholder="janedoe"
                placeholderTextColor={MUTED}
                style={styles.input}
                value={username}
              />
              <ThemedText style={styles.helpText}>Lowercase letters, numbers, and underscores only.</ThemedText>

              <ThemedText style={styles.fieldLabel}>AVATAR URL (OPTIONAL)</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onChangeText={(nextValue) => {
                  setAvatarUrl(nextValue);
                  clearAuthError();
                }}
                placeholder="https://example.com/avatar.png"
                placeholderTextColor={MUTED}
                style={styles.input}
                value={avatarUrl}
              />

              {statusMessage ? <ThemedText style={styles.statusMessage}>{statusMessage}</ThemedText> : null}

              <Pressable
                disabled={Boolean(validationMessage) || isSaving}
                onPress={handleSaveProfile}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (validationMessage || isSaving) && styles.buttonDisabled,
                  pressed && !validationMessage && !isSaving ? styles.buttonPressed : null,
                ]}>
                {isSaving ? (
                  <ActivityIndicator color={BLACK} />
                ) : (
                  <ThemedText style={styles.primaryButtonLabel}>Save Profile</ThemedText>
                )}
              </Pressable>

              <Pressable
                disabled={isSigningOut}
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  isSigningOut ? styles.buttonDisabled : null,
                  pressed && !isSigningOut ? styles.buttonPressed : null,
                ]}>
                {isSigningOut ? (
                  <ActivityIndicator color={MUTED} />
                ) : (
                  <ThemedText style={styles.secondaryButtonLabel}>Use a Different Email</ThemedText>
                )}
              </Pressable>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </AppScreen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: BLACK,
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  screenTitle: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
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
  readOnlyField: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnlyText: {
    color: '#E5E5E5',
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
  helpText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
  statusMessage: {
    color: YELLOW,
    minHeight: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButtonLabel: {
    color: BLACK,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    color: '#E5E5E5',
    fontWeight: '600',
  },
});
