import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import {
  buildRoomRoute,
  joinRoom,
  listOpenRooms,
  normalizeRoomCode,
  validateRoomPassword,
  type AppRoom,
} from '@/lib/rooms';

const YELLOW = '#FDE047';
const YELLOW_DIM = '#FDE68A';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';

function FieldLabel({ label }: { label: string }) {
  return <ThemedText style={styles.fieldLabel}>{label}</ThemedText>;
}

function StatusMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return <ThemedText style={styles.statusMessage}>{message}</ThemedText>;
}

function StyledInput({
  autoCapitalize = 'none',
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={MUTED}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      value={value}
    />
  );
}

export default function JoinScreen() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [openRooms, setOpenRooms] = useState<AppRoom[]>([]);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingOpenRooms, setLoadingOpenRooms] = useState(true);

  const normalizedJoinCode = useMemo(() => normalizeRoomCode(joinCode), [joinCode]);
  const joinPasswordValidationMessage = useMemo(
    () => validateRoomPassword(joinPassword),
    [joinPassword]
  );

  const loadOpenRooms = useCallback(async () => {
    try {
      setJoinMessage(null);
      setOpenRooms(await listOpenRooms());
    } catch (error) {
      setJoinMessage(error instanceof Error ? error.message : 'Unable to load open rooms.');
    } finally {
      setLoadingOpenRooms(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoadingOpenRooms(true);
      void loadOpenRooms();
    }, [loadOpenRooms])
  );

  const handleJoinRoom = async (roomCodeOverride?: string) => {
    const targetRoomCode = normalizeRoomCode(roomCodeOverride ?? joinCode);
    setJoinMessage(null);

    if (!targetRoomCode) {
      setJoinMessage('Enter a room code.');
      return;
    }

    if (targetRoomCode.length < 6 || targetRoomCode.length > 12) {
      setJoinMessage('Room code must be 6 to 12 lowercase letters or numbers.');
      return;
    }

    if (joinPasswordValidationMessage) {
      setJoinMessage(joinPasswordValidationMessage);
      return;
    }

    try {
      setIsJoiningRoom(true);
      const room = await joinRoom({
        roomCode: targetRoomCode,
        password: roomCodeOverride ? undefined : joinPassword,
      });
      setJoinPassword('');
      setJoinCode(room.room_code);
      router.push(buildRoomRoute(room.room_code));
    } catch (error) {
      setJoinMessage(error instanceof Error ? error.message : 'Unable to join that room.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOpenRooms().finally(() => setIsRefreshing(false));
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} tintColor={YELLOW} />}>
          <View style={styles.header}>
            <ThemedText style={styles.screenTitle}>Join Room</ThemedText>
            <ThemedText style={styles.screenSubtitle}>
              Join with a room code or choose from the open rooms below.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <FieldLabel label="Room Code" />
            <StyledInput
              value={joinCode}
              onChangeText={(value) => setJoinCode(normalizeRoomCode(value))}
              placeholder="team1234"
            />

            <FieldLabel label="Password (Optional)" />
            <StyledInput
              value={joinPassword}
              onChangeText={setJoinPassword}
              placeholder="Only needed for protected rooms"
              secureTextEntry
            />

            <StatusMessage message={joinMessage} />
            <Pressable
              disabled={!normalizedJoinCode || Boolean(joinPasswordValidationMessage) || isJoiningRoom}
              onPress={() => void handleJoinRoom()}
              style={({ pressed }) => [
                styles.primaryButton,
                (!normalizedJoinCode || joinPasswordValidationMessage || isJoiningRoom) && styles.buttonDisabled,
                pressed && normalizedJoinCode && !joinPasswordValidationMessage && !isJoiningRoom
                  ? styles.buttonPressed
                  : null,
              ]}>
              {isJoiningRoom ? (
                <ActivityIndicator color={BLACK} />
              ) : (
                <ThemedText style={styles.primaryButtonLabel}>Join Room</ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <FieldLabel label="Open Rooms" />
            <ThemedText style={styles.sectionHint}>
              Passwordless rooms can be joined instantly from here.
            </ThemedText>
            {loadingOpenRooms ? (
              <ActivityIndicator color={YELLOW} />
            ) : openRooms.length === 0 ? (
              <ThemedText style={styles.emptyState}>No passwordless rooms are available right now.</ThemedText>
            ) : (
              openRooms.map((room) => (
                <View key={room.id} style={styles.openRoomCard}>
                  <View style={styles.previewRow}>
                    <View style={styles.openRoomText}>
                      <ThemedText style={styles.previewName}>{room.display_name}</ThemedText>
                      <ThemedText style={styles.previewCode}>{room.room_code}</ThemedText>
                    </View>
                    <View style={styles.previewBadge}>
                      <ThemedText style={styles.previewBadgeText}>Open</ThemedText>
                    </View>
                  </View>
                  <Pressable
                    disabled={isJoiningRoom}
                    onPress={() => void handleJoinRoom(room.room_code)}
                    style={({ pressed }) => [
                      styles.openRoomButton,
                      isJoiningRoom && styles.buttonDisabled,
                      pressed && !isJoiningRoom ? styles.buttonPressed : null,
                    ]}>
                    <ThemedText style={styles.openRoomButtonLabel}>Join Now</ThemedText>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    backgroundColor: BLACK,
    flexGrow: 1,
    gap: 14,
    padding: 20,
    paddingBottom: 48,
  },
  header: {
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
    marginTop: 2,
  },
  card: {
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
  input: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: '#E5E5E5',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  sectionHint: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  openRoomCard: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  previewName: {
    color: '#FAFAFA',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  openRoomText: {
    flex: 1,
    gap: 4,
  },
  previewCode: {
    color: MUTED,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
  },
  previewBadge: {
    backgroundColor: '#1A2800',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  previewBadgeText: {
    color: '#86EFAC',
    fontSize: 11,
    fontWeight: '700',
  },
  openRoomButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
  },
  openRoomButtonLabel: {
    color: BLACK,
    fontSize: 14,
    fontWeight: '800',
  },
  statusMessage: {
    color: YELLOW_DIM,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
