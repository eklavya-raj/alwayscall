# Quickstart

This guide covers the basics of making your first call using Stream Video.
If you haven't already, start with the **[introduction](/video/docs/react-native/)** and **installation** ([Native CLI](/video/docs/react-native/setup/installation/react-native/) or [Expo](/video/docs/react-native/setup/installation/expo/)) steps first.

## Best Practices

- **Use singleton pattern** - Always use `StreamVideoClient.getOrCreateInstance()` instead of creating new client instances
- **Clean up resources** - Call `call.leave()` when leaving a call to release allocated resources
- **Test on real devices** - iOS simulators don't support audio/video recording; Android emulators have limited support
- **Handle call lifecycle** - Use `useEffect` cleanup functions to properly dispose of call instances
- **Request permissions just-in-time** - Ask for camera and microphone access right before first use

## Client setup & Calls

Create an instance of `StreamVideoClient` that will establish a WebSocket connection by connecting a user. Next, you create a call object and join the call. We'll specify `create: true` to create the call if it doesn't exist.

```tsx
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-native-sdk";
import { useEffect, useState } from "react";

const apiKey = "your-api-key";
const userId = "user-id";
const token = "authentication-token";
const callId = "my-call-id";
const user: User = { id: userId };

const client = StreamVideoClient.getOrCreateInstance({ apiKey, user, token });
const call = client.call("default", callId);
call.join({ create: true });

export default function App() {
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>{/* Your UI */}</StreamCall>
    </StreamVideo>
  );
}
```

<admonition type="note">

Use `StreamVideoClient.getOrCreateInstance()` instead of `new StreamVideoClient()` to ensure a singleton instance. Multiple client instances can break push notifications and call state management.

</admonition>

When creating a call on the client, the string `default` is a call type. There are 4 built-in [call types](/video/docs/react-native/guides/configuring-call-types/) and you can also create your own.
The call type controls the permissions and which features are enabled.

The second argument is the call id. Call ids can be reused, meaning it's possible to join a call with the same id multiple times (for example, for recurring meetings). However, for ringing calls, you should always provide a unique call id.

## Rendering video

The call's state can be accessed using hooks, all exposed through the top-level `useCallStateHooks` hook.

Access participant state using hooks like `useParticipants`. Basic video rendering example:

```tsx
import {
  useCallStateHooks,
  CallParticipantsList,
} from "@stream-io/video-react-native-sdk";

function VideoUI() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return <CallParticipantsList participants={participants} />;
}
```

The participant object contains all essential information to render videos, such as audio/video tracks, user information, audio/video enabled status, etc.

More information about state management can be found in the [Call & Participant State guide](/video/docs/react-native/guides/call-and-participant-state/).

## Camera & Microphone

Most video apps show buttons to mute/unmute audio or video. Camera and microphone usage example:

```tsx
import { Button } from "react-native";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const MyVideoButton = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  return (
    <Button
      title={isMute ? "Turn on camera" : "Turn off camera"}
      onPress={() => camera.toggle()}
    />
  );
};

export const MyMicrophoneButton = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  return (
    <Button
      title={isMute ? "Turn on microphone" : "Turn off microphone"}
      onPress={() => microphone.toggle()}
    />
  );
};
```

More information about this topic can be found in the [Camera & Microphone guide](/video/docs/react-native/guides/camera-and-microphone/).

## UI Components

Build any type of video/calling experience with these UI options:

- Build your own UI components using the state as shown above.
- Use our library of built-in components.
- Mix & Match between your own and built-in components.

If you're using our built-in components, you can easily customize them through theming and props. For creating your own components, the UI Cookbook section is there to help you get started.

## Next steps

For a complete integration, review our [Integration Best Practices](/video/docs/react-native/advanced/integration-best-practices/) guide covering lifecycle management, error handling, and device management.


---

This page was last updated at 2026-04-17T17:34:02.963Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/setup/quickstart/](https://getstream.io/video/docs/react-native/setup/quickstart/).