# Integration Best Practices

Review these best practices before deploying your Stream Video React Native SDK integration.

## Client and Call initialization

`client` and `call` are stateful objects requiring careful management. Poor handling causes memory leaks, performance issues, or unexpected behavior (e.g., undisposed calls continue publishing audio/video).

Create instances in `useEffect` and dispose on unmount.

### StreamVideoClient

Create one `StreamVideoClient` instance per app. Multiple instances break push notifications and state management. Use `getOrCreateInstance()` for singleton pattern.

```ts
const [client, setClient] = useState<StreamVideoClient>();
useEffect(() => {
  const tokenProvider = async () => api.fetchToken(user.id);
  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user,
    tokenProvider,
  });
  setClient(client);
  return () => {
    client.disconnectUser().catch((err) => console.error(err));
    setClient(undefined);
  };
}, [apiKey, user.id]);
```

**Token and Token Providers** - Use `tokenProvider` with ~4 hour tokens. See [Client & Authentication](/video/docs/react-native/guides/client-auth/).

**Client behavior consistency** - For [incoming calls](/video/docs/react-native/incoming-calls/overview/), use identical options in your app flow and `StreamVideoRN.setPushConfig` since `getOrCreateInstance` reuses cached instances.

### Call

Create `call` only after `StreamVideoClient` initializes.

```ts
import { useStreamVideoClient } from "@stream-io/video-react-native-sdk";

const client = useStreamVideoClient();
const [call, setCall] = useState<Call>();

useEffect(() => {
  if (!client) return;
  const call = client.call(type, id);
  setCall(call);
  call.join().catch((err) => console.error(err));
  return () => {
    // dispose the call once you don't need it anymore
    call.leave().catch((err) => console.error(err));
    setCall(undefined);
  };
}, [client, type, id]);
```

Access `call` via `useCall()` hook within `<StreamCall call={call} />` provider:

```tsx
import { useCall } from "@stream-io/video-react-native-sdk";

export const MyComponent = () => {
  const call = useCall();
  useEffect(() => {
    if (!call) return;
    call.getOrCreate().catch((err) => console.error(err));
  }, [call]);
};
```

Call initializes after:

- `await call.get()`
- `await call.create()`
- `await call.getOrCreate()`
- `await call.join()`

<admonition type="warning">

Always dispose of the `call` instance by calling `call.leave()` when you no longer need it.
Dangling `call` instances cause memory leaks and unexpected behavior.

</admonition>

More: [Joining & Creating Calls](/video/docs/react-native/guides/joining-and-creating-calls/).

### Audio routing lifecycle

`callManager` handles audio routing. Start when joining, stop when leaving.

```tsx
import { callManager } from "@stream-io/video-react-native-sdk";

// Before joining a call (or immediately after joining)
callManager.start({
  audioRole: "communicator",
  deviceEndpointType: "speaker",
});

// When leaving a call
callManager.stop();
```

More: [Camera & Microphone](/video/docs/react-native/guides/camera-and-microphone/#speaker-management).

### Calling State

Handle all call states with appropriate UI:

```tsx
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallCallingState } = useCallStateHooks();
const callingState = useCallCallingState();
```

More: [Calling State and Lifecycle](/video/docs/react-native/guides/calling-state-and-lifecycle/).

## Device management

### Native permission prompt

Mobile platforms require camera, microphone, Bluetooth, and notification permissions.

- Declare permissions in AndroidManifest.xml/Info.plist (CLI) or app config plugins (Expo)
- Request at appropriate points to avoid surprising users

See [Manage Native Permissions](/video/docs/react-native/guides/native-permissions/).

### Camera and audio route switching

Flip cameras:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCameraState } = useCallStateHooks();
const { camera } = useCameraState();

camera.flip();
```

For audio routes, see [Camera & Microphone](/video/docs/react-native/guides/camera-and-microphone/#switching-audio-output-device).

### Lobby

Provide a lobby for device checks before joining. See [Lobby Preview](/video/docs/react-native/ui-cookbook/lobby-preview/).

### Speaking while muted detection

Detect and notify when users speak while muted:

```tsx
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useMicrophoneState } = useCallStateHooks();
const { isSpeakingWhileMuted, microphone } = useMicrophoneState();

if (isSpeakingWhileMuted) {
  console.log("You are speaking while muted!");
}

await microphone.disableSpeakingWhileMutedNotification();
```

### Background/foreground behavior

Android requires a foreground service for background calls. Declare permissions and request notifications on Android 13+.

See [Keeping a Call Alive](/video/docs/react-native/guides/keeping-call-alive/).

### Incoming calls and push notifications

Complete push setup for ringing calls when app is backgrounded/terminated.

See [Incoming Calls Overview](/video/docs/react-native/incoming-calls/overview/) and [Ringing](/video/docs/react-native/incoming-calls/ringing/).

## Audio and Video filters

Noise cancellation and background filters add CPU overhead. SDK auto-disables under pressure, but provide manual toggle for low-end devices.

See [Noise Cancellation](/video/docs/react-native/guides/noise-cancellation/) and [Video Filters](/video/docs/react-native/advanced/video-filters/usage/).

## Error handling

Handle promise rejections and surface meaningful errors.

### Device errors

```ts
try {
  await call.camera.enable();
  await call.microphone.enable();
} catch (err) {
  console.error("Failed to enable a device", err);
}
```

### Join errors

```ts
try {
  await call.join();
} catch (err) {
  console.error("Failed to join the call", err);
}
```

More: [Troubleshooting](/video/docs/react-native/advanced/troubleshooting/).

### Join retries

`call.join()` retries with exponential backoff. Adjust `maxJoinRetries` for custom behavior:

```ts
try {
  await call.join({ maxJoinRetries: 1 });
} catch (err) {
  console.error("Join failed", err);
}
```

More: [Troubleshooting](/video/docs/react-native/advanced/troubleshooting/).

### Connect user issues

```ts
const client = new StreamVideoClient({ apiKey });
try {
  await client.connectUser(user, token);
} catch (err) {
  console.error("Failed to connect user", err);
}
```

More: [Client & Authentication](/video/docs/react-native/guides/client-auth/).

## Network

### Firewall and proxy setup

Restrictive networks may block WebRTC. Apply [Networking and Firewall](/video/docs/api/misc/networking/) settings or advise users to switch networks.

### Reconnections

SDK auto-reconnects on network changes. Use calling state and disconnection timeouts instead of ending calls on temporary disconnects.

See [Network Disruptions](/video/docs/react-native/ui-cookbook/network-disruption/).

### Disconnection timeout

Define reconnection window before removal:

```ts
call.setDisconnectionTimeout(30); // Try to reconnect for 30 seconds
```

More: [Network Disruptions](/video/docs/react-native/ui-cookbook/network-disruption/).

### Low bandwidth

SDK pauses video on low bandwidth. Show indicators. See [Low Bandwidth](/video/docs/react-native/ui-cookbook/low-bandwidth/).

## Single-call concurrency

Prevent multiple concurrent calls. Enable auto-reject for busy users:

```ts
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  tokenProvider,
  user,
  options: { rejectCallWhenBusy: true },
});
```

For preventing incoming calls to be registered in CallKit/Telecom additional step required:

```ts
StreamVideoRN.setPushConfig({
  shouldRejectCallWhenBusy: true,
});
```

More: [Reject Call When Busy](/video/docs/react-native/ui-cookbook/reject-call-when-busy/).

## User permissions

Configure role permissions in dashboard - hiding UI alone is insufficient. See [Permissions & Moderation](/video/docs/react-native/guides/permissions-and-moderation/).

## Gather feedback

Collect feedback to improve quality. See [User Ratings](/video/docs/react-native/ui-cookbook/user-ratings/).

## Supported platforms and testing

Test on real devices - iOS simulators lack camera/microphone support.

See [React Native Installation](/video/docs/react-native/setup/installation/react-native/) and [Expo Installation](/video/docs/react-native/setup/installation/expo/).

## Keep dependencies up-to-date

Update SDK regularly. See [GitHub Releases](https://github.com/GetStream/stream-video-js/releases) for changelogs.


---

This page was last updated at 2026-04-17T17:34:01.523Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/integration-best-practices/](https://getstream.io/video/docs/react-native/advanced/integration-best-practices/).