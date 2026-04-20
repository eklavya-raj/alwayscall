# OutgoingCall

Display outgoing call state when calling another user. Shows until someone accepts.

Features:

- **Callee details** - Shows who is being called
- **Pre-join controls** - Audio/video mute status

Customize via [Custom Incoming/Outgoing Call components](/video/docs/react-native/ui-cookbook/incoming-and-outgoing-call/) guide.

<gallery>

![Outgoing Call Camera Enabled](@video/react-native/_assets/ui-components/call/outgoing-call/outgoing-call-camera-enabled.png)

![Outgoing Call View Camera Disabled](@video/react-native/_assets/ui-components/call/outgoing-call/outgoing-call-camera-disabled.png)

</gallery>

## General Usage

```tsx
import {
  CallingState,
  OutgoingCall,
  useCall,
  useCalls,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const CallPanel = () => {
  const call = useCall();
  const isCallCreatedByMe = call?.data?.created_by.id === call?.currentUserId;
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  // Display the outgoing call if the call state is RINGING and the call is created by me.
  if (callingState === CallingState.RINGING && isCallCreatedByMe) {
    return <OutgoingCall />;
  }
};

const Call = () => {
  const calls = useCalls();

  return (
    <StreamCall call={call[0]}>
      <CallPanel />
    </StreamCall>
  );
};
```

## Props

### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


### `onHangupCallHandler`

| Type                                   |
| -------------------------------------- |
| `(err?: Error) => void` \| `undefined` |

Callback invoked after outgoing call cancel/hangup attempt. Receives an error on failure.

### `OutgoingCallControls`

Prop to customize the Outgoing call controls in the `OutgoingCall` component.

| Type                          | Default Value                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`OutgoingCallControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/OutgoingCallControls.tsx) |


---

This page was last updated at 2026-04-17T17:34:03.225Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/outgoing-call/](https://getstream.io/video/docs/react-native/ui-components/call/outgoing-call/).