import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCall, useCalls } from '@stream-io/video-react-bindings';
import {
  CallContent,
  CallingState,
  StreamCall,
  callManager,
  useCallStateHooks as getCallStateHooks,
  type Call
} from '@stream-io/video-react-native-sdk';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomInviteManagerModal } from '@/components/room-invite-manager-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useStream } from '@/hooks/use-stream';
import {
  getCallPermissionMessage,
  openCallPermissionSettings,
  requestCallPermissions,
  type CallPermissionSummary,
} from '@/lib/call-permissions';
import type { RoomInvite } from '@/lib/invites';
import type { SearchableProfile } from '@/lib/profile';
import {
  fetchRoomByCode,
  getPreferredVideoResolution,
  getRoomCallDescriptor,
  normalizeRoomCode,
  type AppRoom,
} from '@/lib/rooms';

const { useCallCallingState, useParticipants } = getCallStateHooks();
const { useMicrophoneState, useCameraState } = getCallStateHooks();

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function getCallingStateLabel(callingState: CallingState) {
  switch (callingState) {
    case CallingState.UNKNOWN:
    case CallingState.IDLE:
      return 'Preparing the room...';
    case CallingState.RINGING:
      return 'Calling participants...';
    case CallingState.JOINING:
      return 'Joining the room...';
    case CallingState.JOINED:
      return 'Connected';
    case CallingState.LEFT:
      return 'Leaving the room...';
    case CallingState.RECONNECTING:
      return 'Reconnecting...';
    case CallingState.RECONNECTING_FAILED:
      return 'Reconnection failed.';
    case CallingState.MIGRATING:
      return 'Restoring the call...';
    case CallingState.OFFLINE:
      return 'You are offline.';
    default: {
      const exhaustiveCheck: never = callingState;
      throw new Error(`Unknown calling state: ${exhaustiveCheck}`);
    }
  }
}

function isBlockingCallState(callingState: CallingState) {
  return callingState !== CallingState.UNKNOWN && callingState !== CallingState.IDLE && callingState !== CallingState.LEFT;
}

type StatusScreenProps = {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  title: string;
};

function StatusScreen({
  actionLabel,
  description,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  title,
}: StatusScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statusScreen}>
        <ThemedView style={styles.statusCard}>
          <ThemedText type="title">{title}</ThemedText>
          <ThemedText style={styles.statusDescription}>{description}</ThemedText>
          {actionLabel && onAction ? (
            <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.primaryButtonLabel}>{actionLabel}</ThemedText>
            </Pressable>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable
              onPress={onSecondaryAction}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <ThemedText type="defaultSemiBold">{secondaryActionLabel}</ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>
      </View>
    </SafeAreaView>
  );
}

type ActiveCallViewProps = {
  onCallEnded: () => void;
  onLeaveRoom: () => void;
  onOpenInviteManager: () => void;
  onOpenSettings: () => void;
  permissionSummary: CallPermissionSummary | null;
  room: AppRoom;
};

type BottomCallControlsProps = {
  onLeaveRoom: () => void;
  onOpenInviteManager: () => void;
  onInteract: () => void;
  room: AppRoom;
};

function BottomCallControls({
  onLeaveRoom,
  onOpenInviteManager,
  onInteract,
  room,
}: BottomCallControlsProps) {
  const call = useCall();
  const { status: microphoneStatus } = useMicrophoneState();
  const { status: cameraStatus } = useCameraState();

  const micOn = microphoneStatus !== 'disabled';
  const camOn = cameraStatus !== 'disabled';

  const handle = (fn: () => void) => () => {
    onInteract();
    fn();
  };

  const isAudioRoom = room.call_mode === 'audio';

  return (
    <SafeAreaView edges={['bottom']} style={styles.controlsSafeArea} pointerEvents="box-none">
      <View style={styles.controlsDock}>
        <CircleButton
          accessibilityLabel={micOn ? 'Mute microphone' : 'Unmute microphone'}
          iconName={micOn ? 'mic' : 'mic-off'}
          muted={!micOn}
          onPress={handle(() => void call?.microphone.toggle())}
        />
        {isAudioRoom ? null : (
          <>
            <CircleButton
              accessibilityLabel={camOn ? 'Turn camera off' : 'Turn camera on'}
              iconName={camOn ? 'videocam' : 'videocam-off'}
              muted={!camOn}
              onPress={handle(() => void call?.camera.toggle())}
            />
            <CircleButton
              accessibilityLabel="Flip camera"
              iconName="camera-reverse-outline"
              onPress={handle(() => void call?.camera.flip())}
            />
          </>
        )}
        {room.is_owner ? (
          <CircleButton
            accessibilityLabel="Invite participant"
            iconName="person-add"
            onPress={handle(onOpenInviteManager)}
          />
        ) : null}
        <Pressable
          accessibilityLabel="Leave call"
          onPress={handle(onLeaveRoom)}
          style={({ pressed }) => [styles.hangupButton, pressed && styles.buttonPressed]}>
          <MaterialCommunityIcons color="#FFFFFF" name="phone-hangup" size={24} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CircleButton({
  accessibilityLabel,
  iconName,
  muted,
  onPress,
}: {
  accessibilityLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  muted?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circleButton,
        muted ? styles.circleButtonMuted : null,
        pressed && styles.buttonPressed,
      ]}>
      <Ionicons color={muted ? '#0A0A0A' : '#FFFFFF'} name={iconName} size={22} />
    </Pressable>
  );
}

function TopCallHeader({
  onOpenSettings,
  permissionMessage,
  permissionSummary,
  room,
}: {
  onOpenSettings: () => void;
  permissionMessage: string | null;
  permissionSummary: CallPermissionSummary | null;
  room: AppRoom;
}) {
  const participants = useParticipants();

  return (
    <SafeAreaView edges={['top']} style={styles.headerSafeArea} pointerEvents="box-none">
      <View style={styles.headerRow}>
        <View style={styles.headerPill}>
          <View style={styles.liveDot} />
          <Text numberOfLines={1} style={styles.headerTitle}>
            {room.display_name}
          </Text>
          <Text style={styles.headerMeta}>
            {participants.length}
          </Text>
        </View>
      </View>
      {permissionMessage ? (
        <View style={styles.permissionBannerRow}>
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionText}>{permissionMessage}</Text>
            {permissionSummary?.blockedPermissions.length ? (
              <Pressable
                accessibilityLabel="Open settings"
                onPress={onOpenSettings}
                style={({ pressed }) => [styles.permissionAction, pressed && styles.buttonPressed]}>
                <Text style={styles.permissionActionLabel}>Settings</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const CONTROLS_AUTO_HIDE_MS = 4000;

function ActiveCallView({
  onCallEnded,
  onLeaveRoom,
  onOpenInviteManager,
  onOpenSettings,
  permissionSummary,
  room,
}: ActiveCallViewProps) {
  // Keep the screen awake while in the call so the display does not dim /
  // lock during long conversations. Tied to the mount lifetime of the active
  // call view; expo-keep-awake releases the wake lock on unmount.
  useKeepAwake('alwayscall-active-call');
  const callingState = useCallCallingState();
  const permissionMessage = permissionSummary ? getCallPermissionMessage(permissionSummary) : null;
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_AUTO_HIDE_MS);
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const toggleControls = useCallback(() => {
    setControlsVisible((visible) => {
      if (visible) {
        clearHideTimer();
        return false;
      }
      scheduleHide();
      return true;
    });
  }, [clearHideTimer, scheduleHide]);

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      scheduleHide();
    }
    return clearHideTimer;
  }, [callingState, clearHideTimer, scheduleHide]);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onCallEnded();
    }
  }, [callingState, onCallEnded]);

  useEffect(() => {
    if (Platform.OS !== 'android' || callingState !== CallingState.JOINED) {
      return;
    }

    // Consume hardware back press while in an active call so the user does not
    // accidentally exit the app. Use the home button to minimize into PiP.
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => subscription.remove();
  }, [callingState]);

  if (callingState === CallingState.JOINED) {
    return (
      <View style={styles.flex}>
        <CallContent
          CallControls={() =>
            controlsVisible ? (
              <BottomCallControls
                onLeaveRoom={onLeaveRoom}
                onOpenInviteManager={onOpenInviteManager}
                onInteract={revealControls}
                room={room}
              />
            ) : null
          }
          iOSPiPIncludeLocalParticipantVideo
          onHangupCallHandler={(error) => {
            if (!error) {
              onCallEnded();
            }
          }}
        />
        <Pressable
          accessibilityLabel={controlsVisible ? 'Hide call controls' : 'Show call controls'}
          onPress={toggleControls}
          style={controlsVisible ? styles.tapLayerMid : StyleSheet.absoluteFill}
        />
        {controlsVisible ? (
          <View style={styles.headerOverlay}>
            <TopCallHeader
              onOpenSettings={onOpenSettings}
              permissionMessage={permissionMessage}
              permissionSummary={permissionSummary}
              room={room}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statusScreen}>
        <ThemedView style={styles.statusCard}>
          <ActivityIndicator size="large" />
          <ThemedText type="subtitle">{room.display_name}</ThemedText>
          <ThemedText>{getCallingStateLabel(callingState)}</ThemedText>
          {permissionMessage ? <ThemedText style={styles.statusDescription}>{permissionMessage}</ThemedText> : null}
          {permissionSummary?.blockedPermissions.length ? (
            <Pressable
              onPress={onOpenSettings}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <ThemedText type="defaultSemiBold">Open Settings</ThemedText>
            </Pressable>
          ) : null}
          <Pressable onPress={onLeaveRoom} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
            <ThemedText type="defaultSemiBold">Leave Room</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </SafeAreaView>
  );
}

export default function ActiveRoomScreen() {
  const params = useLocalSearchParams<{ roomCode?: string | string[] }>();
  const router = useRouter();
  const hasExitedRef = useRef(false);
  const { user } = useAuth();
  const { client, error: streamError, isLoading: isStreamLoading } = useStream();
  const calls = useCalls();
  const roomCode = useMemo(() => {
    const rawRoomCode = Array.isArray(params.roomCode) ? params.roomCode[0] : params.roomCode;
    return normalizeRoomCode(rawRoomCode ?? '');
  }, [params.roomCode]);
  const [call, setCall] = useState<Call | null>(null);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinAttemptCount, setJoinAttemptCount] = useState(0);
  const [isInviteManagerVisible, setIsInviteManagerVisible] = useState(false);
  const [permissionSummary, setPermissionSummary] = useState<CallPermissionSummary | null>(null);
  const [room, setRoom] = useState<AppRoom | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const preserveCallOnUnmountRef = useRef(false);
  const activeCallRef = useRef<Call | null>(null);
  const callsRef = useRef(calls);
  const roomRef = useRef<AppRoom | null>(room);
  useEffect(() => {
    callsRef.current = calls;
  }, [calls]);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const exitRoom = useCallback(() => {
    if (hasExitedRef.current) {
      return;
    }

    hasExitedRef.current = true;
    router.replace('/(tabs)' as never);
  }, [router]);

  const handleCallEnded = useCallback(() => {
    preserveCallOnUnmountRef.current = false;
    callManager.stop();
    exitRoom();
  }, [exitRoom]);

  const handleLeaveRoom = useCallback(async () => {
    preserveCallOnUnmountRef.current = false;
    callManager.stop();

    const activeCall = activeCallRef.current;
    if (activeCall && activeCall.state.callingState !== CallingState.LEFT) {
      await activeCall.leave().catch(() => undefined);
    }

    exitRoom();
  }, [exitRoom]);

  const handleRetryJoin = useCallback(() => {
    hasExitedRef.current = false;
    setJoinAttemptCount((count) => count + 1);
  }, []);

  const handleOpenSettings = useCallback(() => {
    void openCallPermissionSettings();
  }, []);

  const handleOpenInviteManager = useCallback(() => {
    setIsInviteManagerVisible(true);
  }, []);

  const handleCloseInviteManager = useCallback(() => {
    setIsInviteManagerVisible(false);
  }, []);

  const handleInviteCreated = useCallback(
    async (_invite: RoomInvite, invitee: SearchableProfile) => {
      if (!client) {
        throw new Error('Stream is not ready to place invite ringing calls.');
      }
      if (!room) {
        throw new Error('Room details are not ready yet.');
      }
      if (!user) {
        throw new Error('You must be signed in to invite users.');
      }

      const roomCallDescriptor = getRoomCallDescriptor(room);
      const roomCall =
        activeCallRef.current &&
        activeCallRef.current.type === roomCallDescriptor.callType &&
        activeCallRef.current.id === roomCallDescriptor.callId
          ? activeCallRef.current
          : client.call(roomCallDescriptor.callType, roomCallDescriptor.callId);

      // Avoid redundantly calling getOrCreate when we are already inside
      // this call; the server already has the state and a second round-trip
      // only risks overwriting custom data.
      if (roomCall.state.callingState !== CallingState.JOINED) {
        await roomCall.getOrCreate({
          video: room.call_mode !== 'audio',
          data: {
            custom: {
              room_code: room.room_code,
              room_display_name: room.display_name,
              room_id: room.id,
              call_mode: room.call_mode,
              video_quality: room.video_quality,
            },
          },
        });
      }

      await roomCall.updateCallMembers({
        update_members: [{ user_id: invitee.id }],
      });
      await roomCall.ring({
        members_ids: [invitee.id],
      });
    },
    [client, room, user]
  );

  useEffect(() => {
    hasExitedRef.current = false;
    preserveCallOnUnmountRef.current = false;
  }, [roomCode]);

  useEffect(() => {
    activeCallRef.current = call;
  }, [call]);

  useEffect(() => {
    let isCancelled = false;

    const loadRoom = async () => {
      if (!roomCode) {
        setRoom(null);
        setRoomError('Enter a valid room code.');
        setIsLoadingRoom(false);
        return;
      }

      try {
        setIsLoadingRoom(true);
        setRoomError(null);
        const nextRoom = await fetchRoomByCode(roomCode);

        if (!isCancelled) {
          setRoom(nextRoom);
        }
      } catch (error) {
        if (!isCancelled) {
          setRoom(null);
          setRoomError(getErrorMessage(error, 'Unable to load this room.'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoom(false);
        }
      }
    };

    void loadRoom();

    return () => {
      isCancelled = true;
    };
  }, [roomCode]);

  // Derive the dep signature once so the join effect only re-runs when the
  // descriptor or audio/video settings actually change, not on every room
  // object refetch (which previously would needlessly leave + rejoin).
  const roomJoinSignature = useMemo(() => {
    if (!room || !room.is_member) {
      return null;
    }

    return [
      room.id,
      room.stream_call_id,
      room.call_mode,
      room.video_quality,
    ].join('|');
  }, [room]);

  useEffect(() => {
    const currentRoom = roomRef.current;
    if (!client || !currentRoom || !currentRoom.is_member || !roomJoinSignature) {
      setCall(null);
      setIsJoiningCall(false);
      return;
    }

    let isCancelled = false;
    const activeRoom = currentRoom;
    const roomCallDescriptor = getRoomCallDescriptor(activeRoom);
    const currentCalls = callsRef.current;
    const conflictingCall =
      currentCalls.find(
        (candidateCall) => {
          if (
            candidateCall.type === roomCallDescriptor.callType &&
            candidateCall.id === roomCallDescriptor.callId
          ) {
            return false;
          }

          // Outgoing rings for OTHER rooms still count as real conflicts — do not
          // silence them — but an outgoing ring we initiated for THIS room (via
          // `call.ring()`) must not block us from entering our own room.
          if (
            candidateCall.isCreatedByMe &&
            candidateCall.state.callingState === CallingState.RINGING
          ) {
            return false;
          }

          return isBlockingCallState(candidateCall.state.callingState);
        }
      ) ?? null;

    if (conflictingCall) {
      setCall(null);
      setIsJoiningCall(false);
      setJoinError('Leave the current call before joining another room on this device.');

      return;
    }

    const existingCall =
      currentCalls.find(
        (candidateCall) =>
          candidateCall.type === roomCallDescriptor.callType &&
          candidateCall.id === roomCallDescriptor.callId &&
          candidateCall.state.callingState !== CallingState.LEFT
      ) ?? null;
    const nextCall = existingCall ?? client.call(roomCallDescriptor.callType, roomCallDescriptor.callId);

    setCall(nextCall);
    setJoinError(null);

    if (existingCall) {
      setIsJoiningCall(false);
      return () => {
        setCall((currentCall) => (currentCall === existingCall ? null : currentCall));
      };
    }

    setIsJoiningCall(true);

    const joinCall = async () => {
      try {
        const nextPermissionSummary = await requestCallPermissions();

        if (isCancelled) {
          return;
        }

        setPermissionSummary(nextPermissionSummary);
        const isAudioOnly = activeRoom.call_mode === 'audio';
        // Guard: only call getOrCreate if the call hasn't been joined yet.
        // For calls already fully joined (e.g. host received an invite ring
        // for a call they were already in), re-running getOrCreate would be
        // a redundant roundtrip and could overwrite custom data.
        if (nextCall.state.callingState !== CallingState.JOINED) {
          await nextCall.getOrCreate({
            data: {
              custom: {
                room_code: activeRoom.room_code,
                room_display_name: activeRoom.display_name,
                room_id: activeRoom.id,
                call_mode: activeRoom.call_mode,
                video_quality: activeRoom.video_quality,
              },
            },
          });
        }
        await nextCall.microphone.enable().catch(() => undefined);
        if (isAudioOnly) {
          await nextCall.camera.disable().catch(() => undefined);
          // Stop receiving remote video tracks too; saves bandwidth and CPU
          // and matches the "audio room" UX.
          nextCall.setIncomingVideoEnabled(false);
        } else {
          await nextCall.camera.enable().catch(() => undefined);
          const preferredResolution = getPreferredVideoResolution(activeRoom.video_quality);
          if (preferredResolution) {
            nextCall.setPreferredIncomingVideoResolution(preferredResolution);
          } else {
            // `auto`: make sure incoming video is enabled and no preferred
            // resolution is pinned so the SDK picks the best match.
            nextCall.setIncomingVideoEnabled(true);
          }
        }
        await nextCall.join();
        callManager.start({
          audioRole: 'communicator',
          deviceEndpointType: 'speaker',
        });
        // 0 = try to reconnect indefinitely (SDK default). Previously 30 s,
        // which on flaky mobile networks would boot the user from the room
        // after a short connectivity hiccup.
        nextCall.setDisconnectionTimeout(0);
      } catch (error) {
        if (!isCancelled) {
          setJoinError(getErrorMessage(error, 'Unable to join the call.'));
          setCall(null);
        }

        if (nextCall.state.callingState !== CallingState.LEFT) {
          await nextCall.leave().catch(() => undefined);
        }
      } finally {
        if (!isCancelled) {
          setIsJoiningCall(false);
        }
      }
    };

    void joinCall();

    return () => {
      isCancelled = true;
      setCall((currentCall) => (currentCall === nextCall ? null : currentCall));
      if (!preserveCallOnUnmountRef.current) {
        callManager.stop();
        void nextCall.leave().catch(() => undefined);
      }
    };
  }, [client, joinAttemptCount, roomJoinSignature]);

  if (!roomCode) {
    return (
      <StatusScreen
        actionLabel="Back to Rooms"
        description="The room link is missing a valid room code."
        onAction={exitRoom}
        title="Invalid Room"
      />
    );
  }

  if (isLoadingRoom) {
    return (
      <StatusScreen
        description="Checking room access and loading the latest room details."
        title="Loading Room"
      />
    );
  }

  if (roomError) {
    return (
      <StatusScreen
        actionLabel="Back to Rooms"
        description={roomError}
        onAction={exitRoom}
        title="Room Unavailable"
      />
    );
  }

  if (!room) {
    return (
      <StatusScreen
        actionLabel="Back to Rooms"
        description="This room could not be resolved."
        onAction={exitRoom}
        title="Room Unavailable"
      />
    );
  }

  if (!room.is_member) {
    return (
      <StatusScreen
        actionLabel="Back to Rooms"
        description="Join this room from the rooms screen first so access checks can complete."
        onAction={exitRoom}
        title="Membership Required"
      />
    );
  }

  if (!client) {
    return (
      <StatusScreen
        actionLabel={streamError ? 'Back to Rooms' : undefined}
        description={
          streamError ??
          (isStreamLoading
            ? 'Connecting your Stream session before entering the room.'
            : 'Stream is not ready yet.')
        }
        onAction={streamError ? exitRoom : undefined}
        title={streamError ? 'Stream Error' : 'Connecting Stream'}
      />
    );
  }

  if (joinError) {
    return (
      <StatusScreen
        actionLabel="Retry Join"
        description={joinError}
        onAction={handleRetryJoin}
        onSecondaryAction={exitRoom}
        secondaryActionLabel="Back to Rooms"
        title="Unable to Join"
      />
    );
  }

  if (!call || isJoiningCall) {
    return (
      <StatusScreen
        actionLabel="Back to Rooms"
        description="Requesting device permissions and joining the active Stream call."
        onAction={exitRoom}
        title="Joining Call"
      />
    );
  }

  return (
    <>
      <StreamCall call={call}>
        <ActiveCallView
          onCallEnded={handleCallEnded}
          onLeaveRoom={() => void handleLeaveRoom()}
          onOpenInviteManager={handleOpenInviteManager}
          onOpenSettings={handleOpenSettings}
          permissionSummary={permissionSummary}
          room={room}
        />
      </StreamCall>
      {room?.is_owner ? (
        <RoomInviteManagerModal
          onClose={handleCloseInviteManager}
          onInviteCreated={handleInviteCreated}
          room={room}
          visible={isInviteManagerVisible}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.78,
  },
  flex: {
    flex: 1,
  },
  controlsSafeArea: {
    backgroundColor: 'transparent',
  },
  controlsDock: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 40,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  circleButtonMuted: {
    backgroundColor: '#FDE047',
  },
  hangupButton: {
    alignItems: 'center',
    backgroundColor: '#E11D48',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 64,
  },
  headerOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tapLayerMid: {
    bottom: 120,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 80,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    maxWidth: '90%',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  liveDot: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  headerMeta: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '600',
  },
  permissionBannerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  permissionBanner: {
    alignItems: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.88)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  permissionText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  permissionAction: {
    alignItems: 'center',
    backgroundColor: '#FDE047',
    borderRadius: 999,
    minHeight: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  permissionActionLabel: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FDE047',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    color: '#0A0A0A',
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#2A2A2A',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  statusCard: {
    borderRadius: 24,
    gap: 14,
    padding: 24,
    width: '100%',
  },
  statusDescription: {
    opacity: 0.8,
  },
  statusScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
