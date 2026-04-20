# IncomingCall

Display incoming call state when receiving a call. Shows caller details and accept/reject options.

Customize via [Custom Incoming/Outgoing Call components](/video/docs/react-native/ui-cookbook/incoming-and-outgoing-call/) guide.

![Preview of the IncomingCall component.](@video/react-native/_assets/ui-components/call/incoming-call/incoming-call.png)

## General Usage

```tsx
import {
  CallingState,
  IncomingCall,
  useCall,
  useCalls,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const CallPanel = () => {
  const call = useCall();
  const isCallCreatedByMe = call?.data?.created_by.id === call?.currentUserId;
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  // Display the incoming call if the call state is RINGING and the call is not created by me, i.e., received from others.
  if (callingState === CallingState.RINGING && !isCallCreatedByMe) {
    return <IncomingCall />;
  }
};

const Call = () => {
  const calls = useCalls();

  return (
    <StreamCall call={calls[0]}>
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


### `onAcceptCallHandler`

| Type                                   |
| -------------------------------------- |
| `(err?: Error) => void` \| `undefined` |

Callback invoked after incoming call accept attempt. Receives an error on failure.

### `onRejectCallHandler`

| Type                                   |
| -------------------------------------- |
| `(err?: Error) => void` \| `undefined` |

Callback invoked after incoming call reject attempt. Receives an error on failure.

### `IncomingCallControls`

Prop to customize the Incoming call controls in the `IncomingCall` component.

| Type                          | Default Value                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`IncomingCallControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/IncomingCallControls.tsx) |


---

This page was last updated at 2026-04-17T17:34:03.217Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/incoming-call/](https://getstream.io/video/docs/react-native/ui-components/call/incoming-call/).