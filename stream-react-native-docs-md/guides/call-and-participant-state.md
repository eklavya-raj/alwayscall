# Call & Participant State

Access call, participant, and client state using reactive hooks that update on WebSocket events and API calls.

## Best Practices

- **Load calls first** - Ensure `call.get()` or `call.join()` completes before accessing state hooks
- **Use StreamCall provider** - Wrap components with `StreamCall` to access call state hooks
- **Handle truncation** - `useParticipants()` returns max 250 participants; publishing participants have priority
- **Prefer utility functions** - Use `hasAudio()`, `hasVideo()` instead of checking streams directly
- **Check participant source** - Handle different participant sources (WebRTC, RTMP, WHIP, SIP) appropriately

## Call state

Observe call state by providing a `Call` instance to [`StreamCall`](/video/docs/react-native/ui-components/core/stream-call/).

<admonition type="note">

For the best experience, please make sure that the provided `Call` instance is loaded
and connected to our backend: [Load Call](/video/docs/react-native/guides/joining-and-creating-calls/#load-call/).

Otherwise, `call.state` and the call state hooks will provide empty values.

</admonition>

Example using `useCall`, `useCallCallingState`, and `useParticipants` hooks:

```tsx
import {
  Call,
  StreamCall,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

export default function MyApp() {
  let call: Call;

  return (
    <StreamCall call={call}>
      <MyCallUI />
    </StreamCall>
  );
}

const MyCallUI = () => {
  const call = useCall();

  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  return (
    <View>
      <Text>Call: {call?.cid}</Text>
      <Text>State: {callingState}</Text>
      <Text>Participants: {participants.length}</Text>
    </View>
  );
};
```

Access call state and receive change notifications anywhere in your app without manual WebSocket subscriptions.

- **StreamCall** - Context provider making call state available to children
- **useCall** - Returns the `Call` instance for API calls

### Call State Hooks

Available call state hooks:

| Name                                                                                  | Description                                                                                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `useCall`                                                                             | The `Call` instance that is registered with `StreamCall`. You need the `Call` instance to initiate API calls. |
| `useCallBlockedUserIds`                                                               | The list of blocked user IDs.                                                                                 |
| [`useCallCallingState`](/video/docs/react-native/guides/calling-state-and-lifecycle/) | Provides information about the call state. For example, `RINGING`, `JOINED` or `RECONNECTING`.                |
| [`useCallClosedCaptions`](/video/docs/react-native/ui-cookbook/closed-captions/)      | The closed captions of the call.                                                                              |
| `useCallCreatedAt`                                                                    | The time the call was created.                                                                                |
| `useCallCreatedBy`                                                                    | The user that created the call.                                                                               |
| `useCallCustomData`                                                                   | The custom data attached to the call.                                                                         |
| `useCallEgress`                                                                       | The egress information of the call.                                                                           |
| `useCallEndedAt`                                                                      | The time the call was ended.                                                                                  |
| `useCallEndedBy`                                                                      | The user that ended the call.                                                                                 |
| `useCallIngress`                                                                      | The ingress information of the call.                                                                          |
| `useCallMembers`                                                                      | The list of call members                                                                                      |
| `useCallSession`                                                                      | The information for the current call session.                                                                 |
| `useCallSettings`                                                                     | The settings of the call.                                                                                     |
| `useCallStartedAt`                                                                    | The actual start time of the current call session.                                                            |
| `useCallStartsAt`                                                                     | The scheduled start time of the call.                                                                         |
| [`useCallStatsReport`](/video/docs/react-native/advanced/stats/)                      | When stats gathering is enabled, this observable will emit a new value at a regular (configurable) interval.  |
| `useCallThumbnail`                                                                    | The thumbnail of the call.                                                                                    |
| `useCallUpdatedAt`                                                                    | The time the call was last updated.                                                                           |
| `useCameraState`                                                                      | The camera state of the local participant.                                                                    |
| `useDominantSpeaker`                                                                  | The participant that is the current dominant speaker of the call.                                             |
| `useHasOngoingScreenShare`                                                            | It will return `true` if at least one participant is sharing their screen.                                    |
| `useHasPermissions`                                                                   | Returns `true` if the local participant has all the given permissions.                                        |
| `useIncomingVideoSettings`                                                            | The state of manual overrides to incoming video quality.                                                      |
| `useIsCallCaptioningInProgress`                                                       | `true` if the call is being close-captioned.                                                                  |
| `useIsCallHLSBroadcastingInProgress`                                                  | `true` if the call is being broadcasted in HLS mode.                                                          |
| `useIsCallIndividualRecordingInProgress`                                              | `true` if the indivudal track recording is running.                                                           |
| `useIsCallLive`                                                                       | `true` if the call is currently live.                                                                         |
| `useIsCallRawRecordingInProgress`                                                     | `true` if the raw recording is currently running.                                                             |
| `useIsCallRecordingInProgress`                                                        | `true` if the call is being recorded.                                                                         |
| `useIsCallTranscribingInProgress`                                                     | `true` if the call is being transcribed.                                                                      |
| `useMicrophoneState`                                                                  | The microphone state of the local participant.                                                                |
| `useOwnCapabilities`                                                                  | The capabilities of the local participant.                                                                    |
| `useScreenShareState`                                                                 | The screen share state of the local participant.                                                              |
| `useSpeakerState`                                                                     | Not supported in React Native                                                                                 |

View the full list by destructuring `useCallStateHooks`:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const {
  useCallMembers,
  useDominantSpeaker,
  useParticipants,
  useLocalParticipant,
  useIsCallRecordingInProgress,
  // ...
} = useCallStateHooks();
```

## Participant state

Display participant information using these hooks. They return `StreamVideoParticipant` objects with participant details.

### Participant State Hooks

| Name                           | Description                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAnonymousParticipantCount` | The approximate participant count of anonymous users in the active call.                                                                                                                             |
| `useLocalParticipant`          | The local participant is the logged-in user.                                                                                                                                                         |
| `useParticipantCount`          | The approximate participant count of the active call. This includes the [anonymous users](/video/docs/react-native/guides/client-auth/#anonymous-users/) as well, it is computed on the server-side. |
| `useParticipants`              | All participants, including local and remote participants.                                                                                                                                           |
| `usePinnedParticipants`        | The participants that are currently pinned.                                                                                                                                                          |
| `useRawParticipants`           | A version of `useParticipants` that is not affected by participant sort settings and thus causes less component updates.                                                                             |
| `useRemoteParticipants`        | All participants except the local participant.                                                                                                                                                       |

<admonition type="warning">

Warning: In a call with many participants, the value of the `useParticipants()` is truncated to 250 participants.

The participants who are publishing video, audio, or screen sharing have priority over the other participants in the list.
This means, for example, that in a livestream with one host and many viewers, the host is guaranteed to be in the list.

</admonition>

```tsx
import {
  Call,
  useCallStateHooks,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

export default function App() {
  let call: Call;

  return (
    <StreamCall call={call}>
      <MyCallUI />
    </StreamCall>
  );
}

const MyCallUI = () => {
  const { useLocalParticipant, useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const localParticipant = useLocalParticipant();

  return (
    <View>
      <Text>Number of participants: {participantCount}</Text>
      <Text>Session ID: {localParticipant.sessionId}</Text>
    </View>
  );
};
```

### Participant data

`StreamVideoParticipant` properties:

| Name                      | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `audioLevel`              | The audio level of the participant (determined on the server).                   |
| `audioStream`             | The audio `MediaStream`.                                                         |
| `audioVolume`             | The audio volume level of the participant (overridable local audioVolume level). |
| `connectionQuality`       | The participant's connection quality.                                            |
| `custom`                  | The participant's custom data. Comes from the `custom` field of the user object. |
| `image`                   | The image of the participant.                                                    |
| `isDominantSpeaker`       | It's `true` if the participant is the current dominant speaker in the call.      |
| `isLocalParticipant`      | It's `true` if the participant is the local participant.                         |
| `isSpeaking`              | It's `true` if the participant is currently speaking.                            |
| `joinedAt`                | The time the participant joined the call.                                        |
| `name`                    | The name of the participant.                                                     |
| `pausedTracks`            | The tracks that are currently server-side paused for the local participant.      |
| `pin`                     | Holds pinning information.                                                       |
| `publishedTracks`         | The track types the participant is currently publishing                          |
| `reaction`                | The last reaction this user has sent to this call.                               |
| `roles`                   | The roles of the participant in this call.                                       |
| `screenShareAudioStream`  | The screen share audio `MediaStream`.                                            |
| `screenShareStream`       | The screen share `MediaStream`.                                                  |
| `sessionId`               | The identifier of the participant within the existing call session               |
| `source`                  | The participant source: WebRTC (default), RTMP (OBS), WHIP, SIP, RTSP, SRT...    |
| `userId`                  | The user ID of the participant.                                                  |
| `videoStream`             | The video `MediaStream`.                                                         |
| `viewportVisibilityState` | The viewport visibility state of the participant.                                |

### Utility functions

SDK utility functions for working with participants:

```ts
import {
  hasAudio,
  hasVideo,
  hasScreenShare,
  hasScreenShareAudio,
  hasPausedTrack,
  isPinned,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

// example usage
const { useParticipants } = useCallStateHooks();
const participants = useParticipants();

// check if the participant has audio, video, screen share or screen share audio
const [participant] = participants;
const hasAudioOn = hasAudio(participant);
const hasVideoOn = hasVideo(participant);
const hasScreenShareOn = hasScreenShare(participant);
const hasScreenShareAudioOn = hasScreenShareAudio(participant);
const isPinnedOn = isPinned(participant);
const isVideoPaused = hasPausedTrack(participant, "videoTrack");

// participants with a specific role
const hosts = participants.filter((p) => p.roles.includes("host"));

// participants that publish video and audio
const videoParticipants = participants.filter(
  (p) => hasVideo(p) && hasAudio(p),
);
```

### Detecting participant source

Participants join from different sources: **WebRTC**, **RTMP/OBS**, **WHIP**, **SIP**, etc. Check the `source` property:

```ts
import { SfuModels } from "@stream-io/video-react-native-sdk";

const { useParticipants } = useCallStateHooks();
const participants = useParticipants();

// participants joining through OBS have RTMP source
const rtmpParticipants = participants.filter(
  (p) => p.source === SfuModels.ParticipantSource.RTMP,
);
```

## Client state

Observe client state by providing a `StreamVideoClient` instance to `StreamVideo`. Use `useConnectedUser` to observe the connected user.

Example:

```tsx
import {
  useConnectedUser,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

export default function App() {
  let client: StreamVideoClient;

  return (
    <StreamVideo client={client}>
      <MyHeader />
    </StreamVideo>
  );
}

const MyHeader = () => {
  const user = useConnectedUser();
  return <Text>{user ? `Logged in: ${user.name}` : "Logged out"}</Text>;
};
```

Access client state and receive notifications without manual WebSocket subscriptions.

### Client state hooks

| Name                   | Description                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useStreamVideoClient` | The `StreamVideoClient` instance.                                                                                                                                               |
| `useConnectedUser`     | Returns the connected user. Holds the server-side data of the connected user.                                                                                                   |
| `useCalls`             | A list of all tracked calls. These calls can be outgoing (I have called somebody) or incoming (somebody has called me). Loaded calls (`call.get()`) are also part of this list. |

`connectedUser` properties:

| Name         | Description                                           |
| ------------ | ----------------------------------------------------- |
| `created_at` | The time the user was created.                        |
| `custom`     | Custom user data.                                     |
| `deleted_at` | The time the user was deleted.                        |
| `devices`    | The registered push notification devices of the user. |
| `id`         | The id of the user.                                   |
| `image`      | The profile image of the user.                        |
| `name`       | The name of the user.                                 |
| `role`       | The role of the user.                                 |
| `teams`      | The teams the user belongs to.                        |
| `updated_at` | The time when the user was updated.                   |


---

This page was last updated at 2026-04-17T17:34:00.721Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/call-and-participant-state/](https://getstream.io/video/docs/react-native/guides/call-and-participant-state/).