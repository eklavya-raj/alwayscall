import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { listIncomingRoomInvites, respondToRoomInvite, type RoomInvite } from '@/lib/invites';
import { buildRoomRoute } from '@/lib/rooms';

const YELLOW = '#FDE047';
const YELLOW_DIM = '#FDE68A';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';
const RED = '#F87171';

export default function InvitesScreen() {
  const router = useRouter();
  const [invites, setInvites] = useState<RoomInvite[]>([]);
  const [activeInviteId, setActiveInviteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      setInvites(await listIncomingRoomInvites());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load invites right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvites();
    }, [loadInvites])
  );

  const handleInviteAction = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      setActiveInviteId(inviteId);
      setMessage(null);
      const room = await respondToRoomInvite(inviteId, action);
      setInvites((currentInvites) => currentInvites.filter((invite) => invite.id !== inviteId));

      if (room) {
        router.push(buildRoomRoute(room.room_code));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update invite right now.');
    } finally {
      setActiveInviteId(null);
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.screenTitle}>Invites</ThemedText>
          <ThemedText style={styles.screenSubtitle}>
            Review incoming room invites and jump straight into calls.
          </ThemedText>
        </View>

        {message ? <ThemedText style={styles.errorMessage}>{message}</ThemedText> : null}

        {isLoading ? (
          <ActivityIndicator color={YELLOW} />
        ) : invites.length === 0 ? (
          <View style={styles.emptyCard}>
            <ThemedText style={styles.emptyTitle}>No pending invites</ThemedText>
            <ThemedText style={styles.emptyText}>When someone rings you, it will show up here.</ThemedText>
          </View>
        ) : (
          invites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <View style={styles.inviteTopRow}>
                <ThemedText style={styles.inviteTitle}>{invite.room_display_name}</ThemedText>
                <View style={styles.pendingBadge}>
                  <ThemedText style={styles.pendingBadgeText}>Pending</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.inviteMeta}>
                {invite.inviter_full_name} invited you to room code {invite.room_code.toUpperCase()}
              </ThemedText>
              {invite.password_required ? (
                <ThemedText style={styles.inviteHint}>
                  Protected room. Accepting this invite lets you join without entering the password.
                </ThemedText>
              ) : (
                <ThemedText style={styles.inviteHint}>Open room. Accept to join immediately.</ThemedText>
              )}

              <View style={styles.actions}>
                <Pressable
                  onPress={() => void handleInviteAction(invite.id, 'accept')}
                  disabled={activeInviteId === invite.id}
                  style={({ pressed }) => [
                    styles.acceptButton,
                    pressed ? styles.buttonPressed : null,
                    activeInviteId === invite.id ? styles.buttonDisabled : null,
                  ]}>
                  {activeInviteId === invite.id ? (
                    <ActivityIndicator color={BLACK} />
                  ) : (
                    <ThemedText style={styles.acceptLabel}>Accept</ThemedText>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => void handleInviteAction(invite.id, 'decline')}
                  disabled={activeInviteId === invite.id}
                  style={({ pressed }) => [
                    styles.declineButton,
                    pressed ? styles.buttonPressed : null,
                    activeInviteId === invite.id ? styles.buttonDisabled : null,
                  ]}>
                  <ThemedText style={styles.declineLabel}>Decline</ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
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
  header: {
    gap: 4,
    marginBottom: 4,
  },
  screenTitle: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    color: MUTED,
    fontSize: 13,
  },
  errorMessage: {
    color: RED,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  emptyTitle: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  inviteCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  inviteTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  inviteTitle: {
    color: '#FAFAFA',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  inviteMeta: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  inviteHint: {
    color: YELLOW_DIM,
    fontSize: 12,
    lineHeight: 17,
  },
  pendingBadge: {
    backgroundColor: '#1A1500',
    borderColor: '#3D3000',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    color: YELLOW_DIM,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  acceptLabel: {
    color: BLACK,
    fontWeight: '800',
  },
  declineLabel: {
    color: '#E5E5E5',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
