# Camera & Microphone

The SDK simplifies working with `MediaStream`, `MediaDeviceInfo`, and WebRTC APIs through utility functions and state hooks.

## Best Practices

- **Await toggle calls** - Always await `enable()`, `disable()`, and `toggle()` methods
- **Use optimistic state** - Show `optimisticIsMute` for instant UI feedback while toggling
- **Call callManager.start before join** - Configure audio role and device before joining
- **Use listener role for livestreams** - Set `audioRole: "listener"` when users won't publish audio
- **Handle race conditions** - The SDK resolves race conditions; the last call always wins

## Camera management

Access the camera object on the call:

```ts
const call = useCall();
const camera = call.camera;
```

### Call settings

Default camera state comes from call settings:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallSettings } = useCallStateHooks();
const settings = useCallSettings();

console.log(settings?.video.camera_default_on);
```

<admonition type="note">

Make sure, `call.get()` is called at least once in the application, after the call is created.

</admonition>

### Start-Stop Camera

Control video stream publishing with `camera.enable()`, `camera.disable()`, or `camera.toggle()`.

```ts
import { useCall, useCallStateHooks } from "@stream-io/video-react-native-sdk";

const call = useCall();

const { useCameraState } = useCallStateHooks();
const { camera, isMute } = useCameraState();

console.log(`Camera is ${isMute ? "off" : "on"}`);
await camera.toggle();

// or, alternatively
await camera.enable();
await camera.disable();
```

Always await these calls. The SDK resolves race conditions (last call wins), making them safe in event handlers.

The `status` updates after the camera actually enables/disables. Use `optimisticIsMute` for immediate UI feedback.

### Manage Camera Facing Mode

Get camera facing mode:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCameraState } = useCallStateHooks();
const { direction } = useCameraState(); // direction returns 'front' or 'back'.
```

Toggle between front and back cameras with `camera.flip()`:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCameraState } = useCallStateHooks();
const { camera } = useCameraState();

camera.flip();
```

### Video mute status

Check video mute state via the `status` from `useCameraState`:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCameraState } = useCallStateHooks();
const { status } = useCameraState(); // status returns enabled, disabled or undefined
```

### Show Video Preview

Display camera preview using `RTCView` from `@stream-io/react-native-webrtc`:

```tsx
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";
import { RTCView } from "@stream-io/react-native-webrtc";

const { useCameraState } = useCallStateHooks();
const { camera } = useCameraState();

const localVideoStream = camera.state.mediaStream;

return <RTCView streamURL={localVideoStream?.toURL()} />;
```

### Access to the Camera's MediaStream

Access the `mediaStream` for custom needs (e.g., local recording):

```typescript
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCameraState } = useCallStateHooks();
const { mediaStream } = useCameraState();

const [videoTrack] = mediaStream.getVideoTracks();
```

## Microphone management

Access the microphone object on the call:

```ts
const call = useCall();
const microphone = call.microphone;
```

### Call settings

Default microphone state comes from call settings:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallSettings } = useCallStateHooks();
const settings = useCallSettings();

console.log(settings?.audio.mic_default_on);
```

<admonition type="note">

Make sure, `call.get()` is called at least once in the application, after the call is created.

</admonition>

### Start-Stop Microphone

Control audio stream publishing with `microphone.enable()`, `microphone.disable()`, or `microphone.toggle()`.

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useMicrophoneState } = useCallStateHooks();
const { microphone, isMute } = useMicrophoneState();

console.log(`Microphone is ${isMute ? "off" : "on"}`);
await microphone.toggle();

// or, alternatively
await microphone.enable();
await microphone.disable();
```

Always await these calls. The SDK resolves race conditions (last call wins), making them safe in event handlers.

The `status` updates after the microphone actually enables/disables. Use `optimisticIsMute` for immediate UI feedback.

### Audio mute status

Check audio mute state via the `status` from `useMicrophoneState`:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useMicrophoneState } = useCallStateHooks();
const { status } = useMicrophoneState(); // status returns enabled, disabled or undefined
```

### Speaking while muted detection

The SDK detects when users speak while muted, enabling notification display or custom logic.

Enabled by default unless the user lacks audio permission or explicitly disables it.

```tsx
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useMicrophoneState } = useCallStateHooks();
const { isSpeakingWhileMuted, microphone } = useMicrophoneState();

if (isSpeakingWhileMuted) {
  // your custom logic comes here
  console.log("You are speaking while muted!");
}

// to disable this feature completely:
await microphone.disableSpeakingWhileMutedNotification();

// to enable it back:
await microphone.enableSpeakingWhileMutedNotification();
```

### Access to the Microphone's MediaStream

Access the `mediaStream` for custom needs (e.g., local recording):

```typescript
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useMicrophoneState } = useCallStateHooks();
const { mediaStream } = useMicrophoneState();

const [audioTrack] = mediaStream.getAudioTracks();
```

## Speaker management

The SDK applies the `audio.default_device` call type [setting](/video/docs/react-native/guides/configuring-call-types/#call-type-settings) (`speaker` or `earpiece`) for the default audio output.

Device priority:

1. Bluetooth Headset or Wired Headset
2. Speakerphone or Earpiece.

Override `audio.default_device` using `callManager.start()` before `call.join()`. Useful for livestream scenarios.

```tsx
import { callManager } from "@stream-io/video-react-native-sdk";

const call = client.call(callType, callId);
// To be called before joining a call
callManager.start({
  audioRole: "communicator", // or "listener"
  deviceEndpointType: "speaker", // or "earpiece"
});
await call.join();
```

- **audioRole** - `communicator` (default) for publishing audio, `listener` for listen-only (livestream audience)
- **deviceEndpointType** - `speaker` or `earpiece` (only with `communicator` role). Use `earpiece` for phone-call scenarios

<admonition type="warning">

As platform-specific methods are necessary to handle audio output, we do not support the `useSpeakerState()` hook.

</admonition>

### Livestream or listener-only audio management

Default `communicator` role prioritizes low latency with manual device switching. For listen-only calls (livestreams), set `audioRole: "listener"` to prioritize high-quality audio. Enable stereo output for OBS streams:

```tsx
import { callManager } from "@stream-io/video-react-native-sdk";

const call = client.call("livestream", callId);
// To be called before joining a call
callManager.start({
  audioRole: "listener",
  enableStereoAudioOutput: true, // or false (default is false)
});
await call.join();
```

### Switching audio output device

Audio switching APIs differ between iOS and Android.

<tabs>

<tabs-item value="ios" label="iOS">

Open the system `AVRoutePickerView` popover to show available audio devices:

```ts
import { callManager } from "@stream-io/video-react-native-sdk";

callManager.ios.showDeviceSelector();
```

This displays a popover like:

![Preview of the iOS audio route picker](@video/react-native/_assets/core/camera-and-microphone/avroutepicker.png)

</tabs-item>

<tabs-item value="android" label="Android">

Android has no system audio picker. Use SDK APIs instead:

- **getAudioDeviceStatus()** - Returns current audio status
- **selectAudioDevice(endpointName: string)** - Switch to a specific device
- **addAudioDeviceChangeListener()** - Listen for audio status changes

Example:

```ts
import { useEffect, useState } from "react";
import {
  AudioDeviceStatus,
  callManager,
} from "@stream-io/video-react-native-sdk";

const [audioDeviceStatus, setAudioDeviceStatus] = useState<AudioDeviceStatus>();
useEffect(() => {
  // set the initial value and listen for changes
  callManager.android.getAudioDeviceStatus().then(setAudioDeviceStatus);
  return callManager.android.addAudioDeviceChangeListener(setAudioDeviceStatus);
}, []);

const {
  devices, // ["Pixel Buds Pro 2", "Wired Headset", "Speaker", "Earpiece"]
  selectedDevice, // "Wired Headset"
  currentEndpointType, // "speaker" or "earpiece"
} = audioDeviceStatus ?? {};

// switch to a specific audio device
callManager.android.selectAudioDevice(devices[0]);
```

<admonition type="info">

When `callManager.android.selectAudioDevice()` is used. The SDK will persist the selection even if a new external device is connected.
The selection is dropped automatically only when the selected device is disconnected.

</admonition>

Custom [modal](https://reactnative.dev/docs/modal) audio picker built with these APIs:

![Preview of a custom Android audio route picker](@video/react-native/_assets/core/camera-and-microphone/androidroutepicker.png)

</tabs-item>

</tabs>

### Force audio through the loudspeaker

Toggle between loudspeaker and earpiece on both iOS and Android:

```tsx
import { callManager } from "@stream-io/video-react-native-sdk";

// route audio through loud speaker immediately (audio outputs here until a new external device is connected)
callManager.speaker.setForceSpeakerphoneOn(true);

// revert back to default behaviour
callManager.speaker.setForceSpeakerphoneOn(false);
```

### Audio volume control

Control system-wide volume and individual participant volume.

#### System wide mute and unmute

```tsx
import { callManager } from "@stream-io/video-react-native-sdk";

// to mute audio
callManager.setMute(true);

// to unmute audio
callManager.setMute(false);
```

#### Participant volume control

Set individual participant volume (e.g., 50%):

```ts
import {
  StreamVideoParticipant,
  Call,
} from "@stream-io/video-react-native-sdk";

let participant: StreamVideoParticipant; // the intended participant
let call: Call; // the call instance
call.speaker.setParticipantVolume(participant.sessionId, 0.5);
```


---

This page was last updated at 2026-04-17T17:34:00.753Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/camera-and-microphone/](https://getstream.io/video/docs/react-native/guides/camera-and-microphone/).