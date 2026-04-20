# Livestreaming

Watch livestreams using Stream Video's React Native SDK. Implement features like viewer counts, backstage waiting, and state handling.

<admonition type="info">

For mobile broadcasting, see our [Mobile Livestreaming Broadcasting Guide](/video/docs/api/streaming/mobile-livestreaming/) covering performance, battery, thermal considerations, and best practices.

</admonition>

## Best Practices

- **Handle all states** - Implement UI for backstage, live, and ended states
- **Join automatically** - Auto-join when call goes live using `useIsCallLive` hook
- **Show recordings** - Display available recordings when stream ends
- **Handle errors** - Show reconnection states and network error messages
- **Use built-in components** - `LivestreamPlayer` provides ready-made UI

[Sample project](https://github.com/GetStream/stream-video-js/tree/main/sample-apps/react-native/dogfood/src/components/LiveStream)

## Watching a livestream

WebRTC livestream viewing guide. Also supports HLS and RTMP-out.

**Technology overview:**

- **WebRTC** is ideal for real-time, low-latency streaming such as video calls or live auctions.
- **HLS (HTTP Live Streaming)** is great for large-scale distribution, offering broad compatibility and adaptive bitrate streaming. However, it typically has higher latency (5–30 seconds), making it less suitable for interactive use cases.
- **RTMP (Real-Time Messaging Protocol)** was once the standard for low-latency streaming to platforms like YouTube or Twitch. While it’s being phased out in favor of newer protocols, it’s still commonly used for ingesting streams due to its reliability and low latency (~2–5 seconds).

Use `LivestreamPlayer` for predefined UI, or build custom views.

Quick integration with `LivestreamPlayer`:

```tsx
import { LivestreamPlayer } from "@stream-io/video-react-native-sdk";

// Use the component in your app
<LivestreamPlayer callType="livestream" callId="your_call_id" />;
```

You can find more details about the built-in `LivestreamPlayer` in the following [page](/video/docs/react-native/ui-components/livestream/livestream-player/).

The rest of the guide will be focused on building your own livestream player view.

## Livestream states

Handle these livestream states in your UI:

- **Backstage** - Created but not started
- **Live** - Active, viewers can watch
- **Ended** - Finished

Detect states with SDK hooks:

```jsx
import React from "react";
import { useEffect } from "react";
import { View } from "react-native";
import {
  useCallStateHooks,
  useCall,
  CallingState,
} from "@stream-io/video-react-native-sdk";

export const LivestreamContent = () => {
  const { useCallEndedAt, useIsCallLive, useCallCallingState } =
    useCallStateHooks();
  const endedAt = useCallEndedAt();
  const isLive = useIsCallLive();
  const callingState = useCallCallingState();
  const call = useCall();

  // to immediately join the call as soon as it is possible
  useEffect(() => {
    const handleJoinCall = async () => {
      try {
        await call?.join();
      } catch (error) {
        console.error("Failed to join call", error);
      }
    };

    if (call && isLive && callingState === CallingState.IDLE) {
      handleJoinCall();
    }
  }, [call, callingState, isLive]);

  return (
    <View>
      {!isLive && <Backstage />}
      {endedAt != null && <CallEnded />}
      {endedAt == null && <CallLiveContent />}
    </View>
  );
};
```

**State definitions:**

- **isLive false** - Backstage mode; only hosts with `join-backstage` capability can join (configure `joinAheadTimeSeconds` to allow early joins)
- **endedAt not null** - Livestream finished
- **Otherwise** - Live; show host video and data

## Backstage mode

Show countdown or start date. Use `useIsCallLive` to auto-render video when available.

Example showing start date and waiting participants:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

export const Backstage = () => {
  const { useCallSession, useCallStartsAt } = useCallStateHooks();
  const startsAt = useCallStartsAt();
  const session = useCallSession();

  // participants who are waiting
  const waitingCount = session?.participants_count_by_role["user"] || 0;

  const formattedStartsAt =
    startsAt &&
    new Date(startsAt).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <View style={styles.container}>
      {startsAt ? (
        <Text style={styles.title}>
          Livestream starting at {formattedStartsAt}
        </Text>
      ) : (
        <Text style={styles.title}>Livestream starting soon</Text>
      )}

      {waitingCount > 0 && (
        <Text style={styles.waitingCount}>
          {waitingCount} participants waiting
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  waitingCount: {
    fontSize: 16,
    paddingHorizontal: 16,
  },
});
```

## Call Ended

When a livestream ends, `endedAt` updates with the end timestamp. Show a message and available recordings:

```tsx
export const CallEnded = () => {
  const call = useCall();
  const [recordingsResponse, setRecordingsResponse] = useState<
    ListRecordingsResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (recordingsResponse == null) {
        try {
          const callRecordingsResponse = await call?.listRecordings();
          setRecordingsResponse(callRecordingsResponse);
        } catch (error) {
          console.log("Error fetching recordings:", error);
          setRecordingsResponse(undefined);
        }
      }
    };

    fetchRecordings();
  }, [call, recordingsResponse]);

  const openUrl = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Cannot open URL:", url);
      }
    });
  };

  const showRecordings =
    recordingsResponse && recordingsResponse.recordings.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The livestream has ended.</Text>

      {showRecordings && (
        <>
          <Text style={styles.subtitle}>Watch recordings:</Text>
          <View style={styles.recordingsContainer}>
            <FlatList
              data={recordingsResponse.recordings}
              keyExtractor={(item) => item.session_id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.recordingButton}
                  onPress={() => openUrl(item.url)}
                >
                  <Text style={styles.recordingText}>{item.url}</Text>
                </Pressable>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};
```

## Call Live View

Example `CallLiveContent` for active livestreams:

```jsx
import React, { useEffect, useState } from 'react';
import { useCallStateHooks, VideoRenderer } from '@stream-io/video-react-native-sdk';
import { View, Text, StyleSheet } from 'react-native';

export const CallLiveContent = () => {
  const { useParticipants, useCallSession, useParticipantCount } =
    useCallStateHooks();
  const participants = useParticipants();
  const hosts = participants.filter((p) => p.roles.includes('host'));

  const session = useCallSession();
  const [duration, setDuration] = useState(() => {
    if (!session || !session.live_started_at) {
      return 0;
    }
    const liveStartTime = new Date(session.live_started_at);
    const now = new Date();
    return Math.floor((now.getTime() - liveStartTime.getTime()) / 1000);
  });

  const totalParticipants = useParticipantCount();
  const viewers = Math.max(0, totalParticipants - 1);

  const formatDuration = (durationInMs: number) => {
    const days = Math.floor(durationInMs / 86400);
    const hours = Math.floor(durationInMs / 3600);
    const minutes = Math.floor((durationInMs % 3600) / 60);
    const seconds = durationInMs % 60;

    return `${days ? days + ' ' : ''}${hours ? hours + ':' : ''}${
      minutes < 10 ? '0' : ''
    }${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const handleLiveStarted = () => {
      intervalId = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    };

    handleLiveStarted();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {hosts.length > 0 && (
        <VideoRenderer participant={hosts[0]} trackType="videoTrack" />
      )}
      <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      <Text style={styles.viewersText}>Viewers: {viewers}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  videoRenderer: {
    flex: 1,
  },
  durationText: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    color: 'red',
  },
  viewersText: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    color: 'red',
  },
});
```

**Implementation details:**

**Rendering the livestream track** - Find and render participant video based on your use case (single streamer, role-based, etc.). Uses `VideoRenderer` for low-level rendering; alternatively use `ParticipantView` (includes label, quality indicator, fallback). See [ParticipantView docs](/video/docs/react-native/ui-components/participants/participant-view/).

**Livestream Information** - Show duration and participant count:

Total participant count (including anonymous):

```tsx
const { useParticipants, useAnonymousParticipantCount } = useCallStateHooks();
const participants = useParticipants();
const anonymousParticipantCount = useAnonymousParticipantCount();
const totalParticipantCount = participants.length + anonymousParticipantCount;
```

- Frequently, the call duration is also presented in a livestream. This information can be calculated from the call session using the `useCallSession()`, as you can see in the `CallLiveContent` snippet above.

You can also watch queried calls, as explained [here](/video/docs/react-native/guides/querying-calls/). This allows you to present participant count (and other call data), even without joining a call.

### Error states

Livestreaming depends on many factors, such as the network conditions on both the user publishing the stream, as well as the viewers.

A proper error handling is needed, to be transparent to the potential issues the user might be facing.

When the network drops, the SDK tries to reconnect the user to the call. However, if it fails to do that, the `callingState` in the `CallState` becomes `RECONNECTING_FAILED`. This gives you the chance to show an alert to the user and provide some custom handling (e.g. a message to check the network connection and try again).

Here’s an example how to do that:

```tsx
const ConnectionStatus = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  let statusMessage;

  switch (callingState) {
    case CallingState.RECONNECTING:
      statusMessage = "Reconnecting, please wait";
      break;
    case CallingState.RECONNECTING_FAILED:
      statusMessage = "Cannot join livestream. Try again later";
      break;
    case CallingState.OFFLINE:
      statusMessage = "You are disconnected";
      break;
    default:
      statusMessage = "A connection error occurred";
  }

  return <Text>{statusMessage}</Text>;
};
```

### Handling Volume

The SDK respects the volume controls on the device. One note - if you are either sharing video or audio, you can’t fully disable the audio, because of the audio session mode of video chat.

We do not support control of the volume of specific audio elements or individual participants through our React Native SDK as React Native WebRTC doesn’t support the `setVolume` and `setParticipantVolume` methods from our `SpeakerManager`.

For more info on this you can check [here](/video/docs/react-native/guides/camera-and-microphone/#speaker-management).

On the other hand, you can mute yourself with the following code below, with more info [here](/video/docs/react-native/ui-cookbook/replacing-call-controls/#button-to-toggle-audio):

```tsx
const { useMicrophoneState } = useCallStateHooks();
const { optimisticIsMute, microphone } = useMicrophoneState();

const onPress = async () => {
  await microphone.toggle();
};

return (
  <CallControlsButton
    onPress={onPress}
    color={!optimisticIsMute ? colors.buttonSecondary : colors.buttonWarning}
    style={toggleAudioPublishingButton}
  >
    <IconWrapper>
      {!optimisticIsMute ? (
        <Mic color={colors.iconPrimary} size={defaults.iconSize} />
      ) : (
        <MicOff color={colors.iconPrimary} size={defaults.iconSize} />
      )}
    </IconWrapper>
  </CallControlsButton>
);
```


---

This page was last updated at 2026-04-17T17:34:00.904Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/livestreaming/](https://getstream.io/video/docs/react-native/guides/livestreaming/).