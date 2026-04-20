import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useStream } from '@/hooks/use-stream';
import {
    buildRoomRoute,
    createRoom,
    deleteRoom,
    joinRoom,
    listMyRooms,
    normalizeRoomCode,
    roomCallModes,
    roomVideoQualities,
    validateRoomCode,
    validateRoomDisplayName,
    validateRoomPassword,
    type AppRoom,
    type RoomCallMode,
    type RoomVideoQuality,
} from '@/lib/rooms';

// ─── Constants ───────────────────────────────────────────────────────────────
const YELLOW = '#FDE047';
const YELLOW_DIM = '#FDE68A';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';
const RED_BORDER = '#991B1B';

function formatRoomTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={sharedStyles.sectionHeader}>
      <View style={sharedStyles.sectionLine} />
      <ThemedText style={sharedStyles.sectionHeaderText}>{label}</ThemedText>
      <View style={sharedStyles.sectionLine} />
    </View>
  );
}

function StyledInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
}: {
  value: string;
  onChangeText: (v: string) => void;
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
      style={sharedStyles.input}
      value={value}
    />
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        sharedStyles.primaryButton,
        (disabled || loading) && sharedStyles.buttonDisabled,
        pressed && !disabled && !loading ? sharedStyles.buttonPressed : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={BLACK} />
      ) : (
        <ThemedText style={sharedStyles.primaryButtonLabel}>{label}</ThemedText>
      )}
    </Pressable>
  );
}

function StatusMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return <ThemedText style={sharedStyles.statusMessage}>{message}</ThemedText>;
}

function FieldLabel({ label }: { label: string }) {
  return <ThemedText style={sharedStyles.fieldLabel}>{label}</ThemedText>;
}

function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  formatLabel,
  disabled,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  formatLabel?: (option: T) => string;
  disabled?: boolean;
}) {
  return (
    <View style={sharedStyles.segmentedContainer}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            disabled={disabled}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              sharedStyles.segmentedOption,
              selected ? sharedStyles.segmentedOptionSelected : null,
              disabled ? sharedStyles.buttonDisabled : null,
              pressed && !disabled && !selected ? sharedStyles.buttonPressed : null,
            ]}>
            <ThemedText
              style={[
                sharedStyles.segmentedOptionLabel,
                selected ? sharedStyles.segmentedOptionLabelSelected : null,
              ]}>
              {formatLabel ? formatLabel(option) : option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { isReady: isStreamReady } = useStream();

  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createCallMode, setCreateCallMode] = useState<RoomCallMode>('video');
  const [createVideoQuality, setCreateVideoQuality] = useState<RoomVideoQuality>('auto');
  const [rooms, setRooms] = useState<AppRoom[]>([]);

  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [roomsMessage, setRoomsMessage] = useState<string | null>(null);

  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isRefreshingRooms, setIsRefreshingRooms] = useState(false);

  const createValidationMessage = useMemo(() => (
    validateRoomDisplayName(createName) ||
    validateRoomCode(createCode) ||
    validateRoomPassword(createPassword)
  ), [createCode, createName, createPassword]);

  const loadRooms = useCallback(async () => {
    try {
      setRoomsMessage(null);
      setRooms(await listMyRooms());
    } catch (error) {
      setRoomsMessage(error instanceof Error ? error.message : 'Unable to load your rooms.');
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const handleRefreshRooms = useCallback(async () => {
    setIsRefreshingRooms(true);
    await loadRooms().finally(() => setIsRefreshingRooms(false));
  }, [loadRooms]);

  const handleCreateRoom = async () => {
    setCreateMessage(null);
    if (createValidationMessage) { setCreateMessage(createValidationMessage); return; }
    try {
      setIsCreatingRoom(true);
      const room = await createRoom({
        callMode: createCallMode,
        displayName: createName,
        password: createPassword,
        roomCode: createCode,
        videoQuality: createCallMode === 'audio' ? 'auto' : createVideoQuality,
      });
      setCreateCode(room.room_code);
      setCreatePassword('');
      setCreateMessage(room.password_required ? 'Protected room created.' : 'Room created.');
      await loadRooms();
      router.push(buildRoomRoute(room.room_code));
    } catch (error) {
      setCreateMessage(error instanceof Error ? error.message : 'Unable to create the room.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomCodeOverride?: string) => {
    try {
      setIsJoiningRoom(true);
      const room = await joinRoom({ roomCode: roomCodeOverride ?? '' });
      await loadRooms();
      router.push(buildRoomRoute(room.room_code));
    } catch (error) {
      setRoomsMessage(error instanceof Error ? error.message : 'Unable to join that room.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleDeleteRoom = useCallback((room: AppRoom) => {
    if (!room.is_owner) { setRoomsMessage('Only room owners can delete rooms.'); return; }
    Alert.alert(
      'Delete Room',
      `Delete "${room.display_name}"? This removes the room for all members.`,
      [
        { style: 'cancel', text: 'Cancel' },
        {
          style: 'destructive',
          text: 'Delete',
          onPress: () => void (async () => {
            try {
              setDeletingRoomId(room.id);
              setRoomsMessage(null);
              await deleteRoom(room.id);
              setRooms((prev) => prev.filter((r) => r.id !== room.id));
              await loadRooms();
            } catch (error) {
              setRoomsMessage(error instanceof Error ? error.message : 'Unable to delete that room.');
            } finally {
              setDeletingRoomId(null);
            }
          })(),
        },
      ]
    );
  }, [loadRooms]);

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingRooms}
              onRefresh={() => void handleRefreshRooms()}
              tintColor={YELLOW}
            />
          }
        >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.screenTitle}>Rooms</ThemedText>
              <ThemedText style={styles.screenSubtitle}>Create, manage, and reopen your rooms.</ThemedText>
            </View>
            <View style={[styles.streamBadge, { borderColor: isStreamReady ? '#3D3000' : BORDER }]}>
              <View style={[styles.streamDot, { backgroundColor: isStreamReady ? YELLOW : MUTED }]} />
              <ThemedText style={[styles.streamBadgeText, { color: isStreamReady ? YELLOW_DIM : MUTED }]}>
                {isStreamReady ? 'Live' : 'Offline'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* ── Create Room ── */}
        <SectionHeader label="CREATE ROOM" />
        <View style={styles.card}>
          <FieldLabel label="Room Name" />
          <StyledInput
            autoCapitalize="words"
            value={createName}
            onChangeText={setCreateName}
            placeholder="Daily standup"
          />
          <FieldLabel label="Room Code (optional)" />
          <StyledInput
            value={createCode}
            onChangeText={(v) => setCreateCode(normalizeRoomCode(v))}
            placeholder="Auto-generated if blank"
          />
          <FieldLabel label="Password (optional)" />
          <StyledInput
            value={createPassword}
            onChangeText={setCreatePassword}
            placeholder="Min 4 characters"
            secureTextEntry
          />

          <FieldLabel label="Room Type" />
          <SegmentedPicker
            options={roomCallModes}
            value={createCallMode}
            onChange={setCreateCallMode}
            formatLabel={(option) => (option === 'audio' ? 'Audio' : 'Video')}
            disabled={isCreatingRoom}
          />

          {createCallMode === 'video' ? (
            <>
              <FieldLabel label="Video Quality" />
              <SegmentedPicker
                options={roomVideoQualities}
                value={createVideoQuality}
                onChange={setCreateVideoQuality}
                formatLabel={(option) => (option === 'auto' ? 'Auto' : option)}
                disabled={isCreatingRoom}
              />
            </>
          ) : null}

          <StatusMessage message={createMessage} />
          <PrimaryButton
            label="Create Room"
            onPress={handleCreateRoom}
            disabled={Boolean(createValidationMessage)}
            loading={isCreatingRoom}
          />
        </View>

        {/* ── Your Rooms ── */}
        <SectionHeader label="YOUR ROOMS" />
        <View style={styles.card}>
          <StatusMessage message={roomsMessage} />
          {rooms.length === 0 ? (
            <ThemedText style={styles.emptyState}>No rooms yet — create one here or join one from the Join tab.</ThemedText>
          ) : (
            rooms.map((room) => (
              <View key={room.id} style={styles.roomItem}>
                <View style={styles.roomLeft}>
                  <View style={styles.roomTitleRow}>
                    <ThemedText style={styles.itemTitle}>{room.display_name}</ThemedText>
                    {room.is_owner ? (
                      <View style={styles.ownerBadge}>
                        <ThemedText style={styles.ownerBadgeText}>Owner</ThemedText>
                      </View>
                    ) : null}
                  </View>
                  <ThemedText style={styles.itemMeta}>
                    {room.room_code} · {room.password_required ? '🔒 Protected' : 'Open'} ·{' '}
                    {room.call_mode === 'audio'
                      ? 'Audio'
                      : `Video (${room.video_quality})`}
                  </ThemedText>
                  <ThemedText style={styles.itemTimestamp}>
                    {formatRoomTimestamp(room.updated_at)}
                  </ThemedText>
                </View>
                <View style={styles.roomCtas}>
                  <Pressable
                    disabled={isJoiningRoom}
                    onPress={() => void handleJoinRoom(room.room_code)}
                    style={({ pressed }) => [
                      styles.ctaJoin,
                      isJoiningRoom && sharedStyles.buttonDisabled,
                      pressed && !isJoiningRoom && sharedStyles.buttonPressed,
                    ]}>
                    <ThemedText style={styles.ctaJoinText}>↗</ThemedText>
                  </Pressable>
                  {room.is_owner ? (
                    <Pressable
                      disabled={deletingRoomId === room.id}
                      onPress={() => handleDeleteRoom(room)}
                      style={({ pressed }) => [
                        styles.ctaDelete,
                        deletingRoomId === room.id && sharedStyles.buttonDisabled,
                        pressed && deletingRoomId !== room.id && sharedStyles.buttonPressed,
                      ]}>
                      <ThemedText style={styles.ctaDeleteText}>
                        {deletingRoomId === room.id ? '…' : '✕'}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const sharedStyles = StyleSheet.create({
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
  fieldLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
  statusMessage: {
    color: YELLOW_DIM,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.75 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: -4,
  },
  sectionLine: {
    backgroundColor: BORDER,
    flex: 1,
    height: 1,
  },
  sectionHeaderText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  segmentedContainer: {
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentedOption: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
  },
  segmentedOptionSelected: {
    backgroundColor: YELLOW,
  },
  segmentedOptionLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  segmentedOptionLabelSelected: {
    color: BLACK,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    backgroundColor: BLACK,
    flexGrow: 1,
    gap: 14,
    padding: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    marginBottom: 4,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  streamBadge: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streamDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  streamBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Card
  card: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },

  // Room item
  roomItem: {
    alignItems: 'center',
    backgroundColor: SURFACE_2,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  roomLeft: {
    flex: 1,
    gap: 3,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  roomCtas: {
    flexDirection: 'row',
    gap: 8,
  },

  // Item typography
  itemTitle: {
    color: '#E5E5E5',
    fontSize: 14,
    fontWeight: '700',
  },
  itemMeta: {
    color: MUTED,
    fontSize: 12,
  },
  itemTimestamp: {
    color: '#444',
    fontSize: 11,
  },

  // Badges
  ownerBadge: {
    backgroundColor: '#1A1500',
    borderColor: '#3D3000',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ownerBadgeText: {
    color: YELLOW_DIM,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // CTA icon buttons
  ctaJoin: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  ctaJoinText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: '900',
  },
  ctaDelete: {
    alignItems: 'center',
    backgroundColor: '#1F0A0A',
    borderColor: RED_BORDER,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  ctaDeleteText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '800',
  },

  // Empty state
  emptyState: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
