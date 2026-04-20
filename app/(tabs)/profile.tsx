import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import {
  getDefaultProfileValues,
  normalizeUsername,
  uploadProfileAvatar,
  usernamePattern,
} from '@/lib/profile';

const YELLOW = '#FDE047';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';
const RED = '#F87171';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to update your profile right now.';
}

export default function ProfileScreen() {
  const { completeProfile, profile, signOut, user } = useAuth();
  const defaults = useMemo(() => getDefaultProfileValues(user, profile), [profile, user]);
  const [fullName, setFullName] = useState(defaults.fullName);
  const [username, setUsername] = useState(defaults.username);
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const validationMessage = useMemo(() => {
    if (!fullName.trim()) {
      return 'Full name is required.';
    }

    if (!usernamePattern.test(normalizeUsername(username))) {
      return 'Username must be 3-24 lowercase letters, numbers, or underscores.';
    }

    return null;
  }, [fullName, username]);

  const handlePickAvatar = async () => {
    if (!user) {
      setMessage('You must be signed in to upload a profile picture.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setMessage(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo library access to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      const uploadedAvatarUrl = await uploadProfileAvatar(user.id, result.assets[0].uri);
      setAvatarUrl(uploadedAvatarUrl);
      setMessage('Profile photo uploaded. Save profile to apply it everywhere.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      await completeProfile({
        avatarUrl: avatarUrl.trim() || undefined,
        fullName: fullName.trim(),
        username: normalizeUsername(username),
      });
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(getErrorMessage(error));
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
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.heroCard}>
          <ThemedText style={styles.screenTitle}>Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Keep your identity polished for calls, invites, and notifications.
          </ThemedText>

          <ThemedView style={styles.avatarSection}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <ThemedView style={styles.avatarFallback}>
                <ThemedText style={styles.avatarFallbackText}>
                  {(fullName.trim()[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
                </ThemedText>
              </ThemedView>
            )}
            <Pressable
              onPress={() => void handlePickAvatar()}
              disabled={isUploadingAvatar}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed ? styles.buttonPressed : null,
                isUploadingAvatar ? styles.buttonDisabled : null,
              ]}>
              {isUploadingAvatar ? (
                <ActivityIndicator color={BLACK} />
              ) : (
                <ThemedText style={styles.avatarButtonText}>Upload Photo</ThemedText>
              )}
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.formCard}>
          <ThemedText style={styles.fieldLabel}>EMAIL</ThemedText>
          <ThemedView style={styles.readOnlyField}>
            <ThemedText style={styles.readOnlyText}>{defaults.email || 'Unknown email'}</ThemedText>
          </ThemedView>

          <ThemedText style={styles.fieldLabel}>FULL NAME</ThemedText>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jane Doe"
            placeholderTextColor={MUTED}
            style={styles.input}
          />

          <ThemedText style={styles.fieldLabel}>USERNAME</ThemedText>
          <TextInput
            value={username}
            onChangeText={(value) => setUsername(normalizeUsername(value))}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="janedoe"
            placeholderTextColor={MUTED}
            style={styles.input}
          />

          {message ? (
            <ThemedText style={[styles.message, { color: validationMessage ? RED : MUTED }]}>{message}</ThemedText>
          ) : null}

          <Pressable
            onPress={() => void handleSaveProfile()}
            disabled={Boolean(validationMessage) || isSaving}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.buttonPressed : null,
              (validationMessage || isSaving) ? styles.buttonDisabled : null,
            ]}>
            {isSaving ? (
              <ActivityIndicator color={BLACK} />
            ) : (
              <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => void handleSignOut()}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed ? styles.buttonPressed : null,
              isSigningOut ? styles.buttonDisabled : null,
            ]}>
            {isSigningOut ? <ActivityIndicator color={MUTED} /> : <ThemedText style={styles.secondaryButtonText}>Sign Out</ThemedText>}
          </Pressable>
        </ThemedView>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BLACK,
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  screenTitle: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  avatar: {
    borderRadius: 48,
    height: 96,
    width: 96,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarFallbackText: {
    color: '#111111',
    fontSize: 32,
    fontWeight: '800',
  },
  avatarButton: {
    backgroundColor: YELLOW,
    borderRadius: 999,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  avatarButtonText: {
    color: '#111111',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 18,
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
    borderRadius: 14,
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
    borderRadius: 14,
    borderWidth: 1,
    color: '#E5E5E5',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  primaryButtonText: {
    color: '#111111',
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
