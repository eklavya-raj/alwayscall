import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createRoomInvite, listRoomInvites, type RoomInvite } from '@/lib/invites';
import { searchProfiles, type SearchableProfile } from '@/lib/profile';
import type { AppRoom } from '@/lib/rooms';

const YELLOW = '#FDE047';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function formatInviteTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

type RoomInviteManagerModalProps = {
  onClose: () => void;
  onInviteCreated: (invite: RoomInvite, invitee: SearchableProfile) => Promise<void> | void;
  room: AppRoom;
  visible: boolean;
};

export function RoomInviteManagerModal({
  onClose,
  onInviteCreated,
  room,
  visible,
}: RoomInviteManagerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableProfile[]>([]);
  const [sentInvites, setSentInvites] = useState<RoomInvite[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [pendingInviteeId, setPendingInviteeId] = useState<string | null>(null);

  const loadSentInvites = useCallback(async () => {
    try {
      setIsLoadingInvites(true);
      const nextInvites = await listRoomInvites(room.id);
      setSentInvites(nextInvites);
    } catch (error) {
      setInviteMessage(getErrorMessage(error, 'Unable to load room invites.'));
    } finally {
      setIsLoadingInvites(false);
    }
  }, [room.id]);

  const runSearch = useCallback(async (query: string) => {
    try {
      setIsLoadingSearch(true);
      setSearchMessage(null);
      const nextResults = await searchProfiles(query, 12);
      setSearchResults(nextResults);

      if (nextResults.length === 0) {
        setSearchMessage(query.trim() ? 'No users matched that search.' : 'No inviteable users found.');
      }
    } catch (error) {
      setSearchResults([]);
      setSearchMessage(getErrorMessage(error, 'Unable to search for users.'));
    } finally {
      setIsLoadingSearch(false);
    }
  }, []);

  // Debounce the user search so every keystroke doesn't hit the backend.
  // When the modal opens we also want an immediate first load, so run once
  // synchronously on visibility change with the current query.
  useEffect(() => {
    if (!visible) {
      return;
    }

    setInviteMessage(null);
    void loadSentInvites();
  }, [loadSentInvites, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handle = setTimeout(() => {
      void runSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handle);
  }, [runSearch, searchQuery, visible]);

  const pendingInvitesByInviteeId = useMemo(() => {
    return new Map(
      sentInvites
        .filter((invite) => invite.status === 'pending')
        .map((invite) => [invite.invitee_id, invite])
    );
  }, [sentInvites]);

  const handleInvite = useCallback(
    async (profile: SearchableProfile) => {
      try {
        setPendingInviteeId(profile.id);
        setInviteMessage(null);
        const invite = await createRoomInvite(room.id, profile.id);
        setSentInvites((currentInvites) => [
          invite,
          ...currentInvites.filter((currentInvite) => currentInvite.id !== invite.id),
        ]);
        await onInviteCreated(invite, profile);
        setInviteMessage(`Ringing ${profile.full_name} for ${room.display_name}.`);
      } catch (error) {
        setInviteMessage(getErrorMessage(error, 'Unable to invite that user.'));
      } finally {
        setPendingInviteeId(null);
      }
    },
    [onInviteCreated, room.display_name, room.id]
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      statusBarTranslucent={Platform.OS === 'android'}
      visible={visible}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', default: undefined })}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.headerCard}>
            <ThemedText style={styles.title}>Invite to {room.display_name}</ThemedText>
            <ThemedText style={styles.description}>
              Search any onboarded user, send a persistent room invite, and ring them directly into
              this room.
            </ThemedText>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.secondaryButtonLabel}>Close</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Find User</ThemedText>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => void runSearch(searchQuery)}
              placeholder="Search by name, username, or email"
              placeholderTextColor={MUTED}
              style={styles.input}
              value={searchQuery}
            />
            <Pressable
              onPress={() => void runSearch(searchQuery)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.primaryButtonLabel}>Search Users</ThemedText>
            </Pressable>
            {isLoadingSearch ? <ActivityIndicator /> : null}
            {searchMessage ? <ThemedText>{searchMessage}</ThemedText> : null}

            {searchResults.map((profile) => {
              const existingPendingInvite = pendingInvitesByInviteeId.get(profile.id);
              const isInvitingThisUser = pendingInviteeId === profile.id;

              return (
                <View key={profile.id} style={styles.resultRow}>
                  <View style={styles.resultTextGroup}>
                    <ThemedText style={styles.resultName}>{profile.full_name}</ThemedText>
                    <ThemedText style={styles.resultMeta}>
                      @{profile.username} • {profile.email}
                    </ThemedText>
                    {existingPendingInvite ? (
                      <ThemedText style={styles.resultMeta}>
                        Pending invite sent {formatInviteTimestamp(existingPendingInvite.updated_at)}
                      </ThemedText>
                    ) : null}
                  </View>
                  <Pressable
                    disabled={Boolean(existingPendingInvite) || isInvitingThisUser}
                    onPress={() => void handleInvite(profile)}
                    style={({ pressed }) => [
                      styles.inlineButton,
                      (existingPendingInvite || isInvitingThisUser) && styles.buttonDisabled,
                      pressed && !existingPendingInvite && !isInvitingThisUser ? styles.buttonPressed : null,
                    ]}>
                    <ThemedText style={styles.inlineButtonLabel}>
                      {existingPendingInvite ? 'Invited' : isInvitingThisUser ? 'Sending...' : 'Invite'}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            })}
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Invite Activity</ThemedText>
            <ThemedText style={styles.description}>
              Pending invites remain visible until the recipient accepts or declines them.
            </ThemedText>
            {inviteMessage ? <ThemedText>{inviteMessage}</ThemedText> : null}
            {isLoadingInvites ? <ActivityIndicator /> : null}
            {sentInvites.length === 0 && !isLoadingInvites ? (
              <ThemedText style={styles.resultMeta}>No invites sent from this room yet.</ThemedText>
            ) : (
              sentInvites.map((invite) => (
                <ThemedView key={invite.id} style={styles.inviteCard}>
                  <ThemedText style={styles.resultName}>{invite.invitee_full_name}</ThemedText>
                  <ThemedText style={styles.resultMeta}>
                    @{invite.invitee_username} • {invite.status}
                  </ThemedText>
                  <ThemedText style={styles.resultMeta}>Updated {formatInviteTimestamp(invite.updated_at)}</ThemedText>
                </ThemedView>
              ))
            )}
          </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  card: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  content: {
    backgroundColor: BLACK,
    gap: 16,
    minHeight: '100%',
    padding: 20,
    paddingBottom: 32,
  },
  description: {
    color: MUTED,
    lineHeight: 20,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: BLACK,
    flex: 1,
  },
  headerCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sectionTitle: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '800',
  },
  inlineButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 84,
    paddingHorizontal: 16,
  },
  inlineButtonLabel: {
    color: BLACK,
    fontWeight: '600',
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
  inviteCard: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    color: BLACK,
    fontWeight: '600',
  },
  resultName: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  resultMeta: {
    color: MUTED,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  resultTextGroup: {
    flex: 1,
    gap: 4,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: '#E5E5E5',
    fontWeight: '700',
  },
});
