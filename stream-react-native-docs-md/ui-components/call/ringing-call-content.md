# RingingCallContent

Build calling/ringing UI easily with `RingingCallContent`. Shows participant info and cancel option before acceptance.

Based on ringing state and call type, displays participant list with avatars/names, or single avatar background for 1:1 calls.

<gallery>

![Incoming Call](@video/react-native/_assets/ui-components/call/ringing-call-content/incoming-call.png)

![Outgoing Call](@video/react-native/_assets/ui-components/call/ringing-call-content/outgoing-call.png)

![Joining Call Indicator](@video/react-native/_assets/ui-components/call/ringing-call-content/joining-call-indicator.png)

![Call Content](@video/react-native/_assets/ui-components/call/ringing-call-content/call-content.png)

</gallery>

## Usage

To use the `RingingCallContent` you can do the following:

```tsx
import {
  StreamCall,
  useCalls,
  CallingState,
  RingingCallContent,
} from "@stream-io/video-react-native-sdk";

export const MyComponent = () => {
  // collect all ringing kind of calls managed by the SDK
  const calls = useCalls().filter((c) => c.ringing);

  // for simplicity, we only take the first one but
  // there could be multiple calls ringing at the same time
  const ringingCall = calls[0];
  if (!ringingCall) return null;

  return (
    <StreamCall call={ringingCall}>
      <RingingCallContent />
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


### `IncomingCall`

Prop to customize the `IncomingCall` component. This component is rendered when an incoming call is received.

| Type                          | Default Value                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`IncomingCall`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/RingingCallContent/IncomingCall.tsx) |

### `OutgoingCall`

Prop to customize the `OutgoingCall` component. This component is rendered when someone is called.

| Type                          | Default Value                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`OutgoingCall`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/RingingCallContent/OutgoingCall.tsx) |

### `CallContent`

Prop to customize the accepted CallContent component in the RingingCallContent. This is shown after the call is accepted. By default it renders the [`CallContent`](/video/docs/react-native/ui-components/call/call-content/) component.

| Type                          | Default Value                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`CallContent`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallContent/CallContent.tsx) |

### `JoiningCallIndicator`

Prop to customize the `JoiningCallIndicator` component in the RingingCallContent. It is shown when the call is accepted and is waiting to be joined.

| Type                          | Default Value                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`JoiningCallIndicator`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/RingingCallContent/JoiningCallIndicator.tsx) |


---

This page was last updated at 2026-04-17T17:34:01.014Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/ringing-call-content/](https://getstream.io/video/docs/react-native/ui-components/call/ringing-call-content/).