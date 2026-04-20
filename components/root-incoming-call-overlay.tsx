import {
    CallingState,
    RingingCallContent,
    StreamCall,
    useCalls,
} from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStream } from '@/hooks/use-stream';
import {
    listIncomingRoomInvites,
    respondToRoomInvite,
    type RoomInvite,
} from '@/lib/invites';
import { buildRoomRoute } from '@/lib/rooms';

const YELLOW = '#FDE047';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const BORDER = '#2A2A2A';
const MUTED = '#A3A3A3';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to handle this incoming call.';
}

function RootIncomingCallOverlayContent() {
  const router = useRouter();
  const calls = useCalls();
  const incomingCall = useMemo(
    () =>
      calls.find((call) => {
        if (call.isCreatedByMe) {
          return false;
        }

        return (
          call.ringing ||
          call.state.callingState === CallingState.JOINING ||
          call.state.callingState === CallingState.JOINED
        );
      }) ?? null,
    [calls]
  );
  const outgoingCall = useMemo(
    () => calls.find((call) => call.isCreatedByMe && call.ringing) ?? null,
    [calls]
  );
  const handledAcceptedInvitesRef = useRef<Set<string>>(new Set());
  const [invite, setInvite] = useState<RoomInvite | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [isHandlingAction, setIsHandlingAction] = useState(false);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const [incomingCallingState, setIncomingCallingState] = useState<CallingState | null>(
    incomingCall?.state.callingState ?? null
  );

  // The Stream Call object mutates its `state.callingState` in place, so we
  // must subscribe to the observable explicitly. Otherwise dependant effects
  // (e.g. the accept-sync effect below) will not re-run when the state
  // transitions from RINGING -> JOINING -> JOINED, leaving the invitee
  // stuck on the "Opening room..." overlay.
  useEffect(() => {
    if (!incomingCall) {
      setIncomingCallingState(null);
      return;
    }

    setIncomingCallingState(incomingCall.state.callingState);
    const subscription = incomingCall.state.callingState$.subscribe((nextState) => {
      setIncomingCallingState(nextState);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [incomingCall]);

  const loadInvite = useCallback(async () => {
    if (!incomingCall) {
      setInvite(null);
      setOverlayError(null);
      setIsLoadingInvite(false);
      return;
    }

    try {
      setIsLoadingInvite(true);
      setOverlayError(null);
      const invites = await listIncomingRoomInvites();
      const matchingInvite =
        invites.find(
          (candidateInvite) =>
            candidateInvite.stream_call_id === incomingCall.id ||
            candidateInvite.ringing_call_id === incomingCall.id
        ) ?? null;

      setInvite(matchingInvite);

      if (!matchingInvite && incomingCall.ringing) {
        setOverlayError('The incoming room invite is still syncing. Please wait a moment.');
      }
    } catch (error) {
      setInvite(null);
      setOverlayError(getErrorMessage(error));
    } finally {
      setIsLoadingInvite(false);
    }
  }, [incomingCall]);

  useEffect(() => {
    void loadInvite();
  }, [loadInvite]);

  useEffect(() => {
    if (!incomingCall || !invite) {
      return;
    }

    if (
      incomingCallingState !== CallingState.JOINING &&
      incomingCallingState !== CallingState.JOINED
    ) {
      return;
    }

    if (handledAcceptedInvitesRef.current.has(invite.id)) {
      return;
    }

    handledAcceptedInvitesRef.current.add(invite.id);
    let isCancelled = false;

    const syncAcceptedInvite = async () => {
      try {
        const room = await respondToRoomInvite(invite.id, 'accept');

        if (!room) {
          throw new Error('Invite acceptance did not return the room to open.');
        }

        if (!isCancelled) {
          router.replace(buildRoomRoute(room.room_code));
        }
      } catch (error) {
        handledAcceptedInvitesRef.current.delete(invite.id);

        if (!isCancelled) {
          setOverlayError(getErrorMessage(error));
        }
      }
    };

    void syncAcceptedInvite();

    return () => {
      isCancelled = true;
    };
  }, [incomingCall, incomingCallingState, invite, router]);

  const handleDecline = useCallback(async () => {
    if (!incomingCall) {
      return;
    }

    try {
      setIsHandlingAction(true);
      setOverlayError(null);

      if (invite) {
        await respondToRoomInvite(invite.id, 'decline');
      }

      if (incomingCall.state.callingState !== CallingState.LEFT) {
        await incomingCall.leave({ reason: 'decline', reject: true });
      }
    } catch (error) {
      setOverlayError(getErrorMessage(error));
    } finally {
      setIsHandlingAction(false);
    }
  }, [incomingCall, invite]);

  const handleAccept = useCallback(async () => {
    if (!incomingCall) {
      return;
    }

    try {
      setIsHandlingAction(true);
      setOverlayError(null);
      await incomingCall.join();
    } catch (error) {
      setOverlayError(getErrorMessage(error));
    } finally {
      setIsHandlingAction(false);
    }
  }, [incomingCall]);

  if (outgoingCall) {
    return (
      <StreamCall call={outgoingCall}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.builtInOverlay}>
            <RingingCallContent />
          </View>
        </SafeAreaView>
      </StreamCall>
    );
  }

  if (!incomingCall) {
    return null;
  }

  // Once the call is joined, the sync effect adds membership and navigates
  // to the room screen. Keep the overlay mounted only while the call is
  // actually ringing or still in the joining handshake, otherwise it blocks
  // the underlying room UI with an endless "Opening room..." spinner.
  if (incomingCallingState === CallingState.JOINED) {
    return null;
  }

  const isSyncingAcceptedCall = incomingCallingState === CallingState.JOINING;

  return (
    <StreamCall call={incomingCall}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.kicker}>Incoming Room Call</Text>
            <Text style={styles.title}>
              {invite?.room_display_name ?? (isSyncingAcceptedCall ? 'Opening room...' : 'Connecting room invite...')}
            </Text>
            <Text style={styles.subtitle}>
              {invite
                ? `${invite.inviter_full_name} invited you to join ${invite.room_code}.`
                : isSyncingAcceptedCall
                  ? 'Finalizing your room access and opening the active call.'
                  : 'Looking up the room details for this ringing call.'}
            </Text>
            {isLoadingInvite ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
            {overlayError ? <Text style={styles.errorText}>{overlayError}</Text> : null}
            {isSyncingAcceptedCall ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.buttonRow}>
                <Pressable
                  disabled={isHandlingAction}
                  onPress={() => void handleDecline()}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    isHandlingAction && styles.buttonDisabled,
                    pressed && !isHandlingAction ? styles.buttonPressed : null,
                  ]}>
                  <Text style={styles.secondaryButtonLabel}>
                    {isHandlingAction ? 'Working...' : 'Decline'}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={isHandlingAction || isLoadingInvite}
                  onPress={() => void handleAccept()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (isHandlingAction || isLoadingInvite) && styles.buttonDisabled,
                    pressed && !isHandlingAction && !isLoadingInvite ? styles.buttonPressed : null,
                  ]}>
                  <Text style={styles.primaryButtonLabel}>
                    {isHandlingAction ? 'Joining...' : 'Accept'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </StreamCall>
  );
}

export function RootIncomingCallOverlay() {
  const { client, isReady } = useStream();

  // Stream hooks like useCalls() require the StreamVideo provider to be mounted.
  if (!client || !isReady) {
    return null;
  }

  return <RootIncomingCallOverlayContent />;
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.88)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  builtInOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.96)',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  errorText: {
    color: '#FCA5A5',
    lineHeight: 20,
  },
  kicker: {
    color: YELLOW,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: YELLOW,
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    color: BLACK,
    fontSize: 16,
    fontWeight: '700',
  },
  safeArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: BORDER,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: '#E5E5E5',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 24,
    fontWeight: '700',
  },
});
