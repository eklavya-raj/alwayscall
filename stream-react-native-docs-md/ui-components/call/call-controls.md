# CallControls

Execute call actions (mute/unmute, reactions, hang-up, etc.) with the built-in `CallControls` component.

![Preview of the CallControls component.](@video/react-native/_assets/ui-components/call/call-controls/call-controls.png)

## General Usage

Display available call controls:

```tsx {13}
import {
  Call,
  CallContent,
  CallControls,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;

  return (
    <StreamCall call={call}>
      <CallControls />
    </StreamCall>
  );
};
```

## Props

### `onHangupCallHandler`

Callback invoked after leave attempt from the hangup call button in call controls. Receives an error on failure.

| Type                                   |
| -------------------------------------- |
| `(err?: Error) => void` \| `undefined` |


### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


## Built-in call controls

Each call control is available as a separate UI component.

### [`AcceptCallButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/AcceptCallButton.tsx)

This component is used in the [Incoming Call](/video/docs/react-native/ui-components/call/incoming-call/) component to accept an incoming call.

| Type                  | Type                                   | Description                                                                                          |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `onPressHandler`      | `() => void` \| `undefined`            | Handler to be called when the accept call button is pressed. Used to override the default behaviour. |
| `onAcceptCallHandler` | `(err?: Error) => void` \| `undefined` | Callback invoked after incoming call accept attempt. Receives an error on failure.                   |

### [`HangupCallButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/HangupCallButton.tsx)

This component is used to hangup/leave an active call/outgoing call.

| Type                  | Type                                   | Description                                                                                           |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `onPressHandler`      | `() => void` \| `undefined`            | Handler to be called when the hang up call button is pressed. Used to override the default behaviour. |
| `onHangupCallHandler` | `(err?: Error) => void` \| `undefined` | Callback invoked after hangup attempt. Receives an error on failure.                                  |

### [`RejectCallButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/RejectCallButton.tsx)

This component is used in the [Incoming Call](/video/docs/react-native/ui-components/call/incoming-call/) component to reject an incoming call.

| Type                  | Type                                   | Description                                                                                          |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `onPressHandler`      | `() => void` \| `undefined`            | Handler to be called when the reject call button is pressed. Used to override the default behaviour. |
| `onRejectCallHandler` | `(err?: Error) => void` \| `undefined` | Callback invoked after incoming call reject attempt. Receives an error on failure.                   |

### [`ToggleAudioPreviewButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ToggleAudioPreviewButton.tsx)

This component is used to toggle audio mute/unmute status before joining the call.

| Type             | Type                        | Description                                                                                            |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `onPressHandler` | `() => void` \| `undefined` | Handler to be called when the audio preview button is pressed. Used to override the default behaviour. |

### [`ToggleVideoPreviewButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ToggleVideoPreviewButton.tsx)

This component is used to toggle video mute/unmute status before joining the call.

| Type             | Type                        | Description                                                                                            |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `onPressHandler` | `() => void` \| `undefined` | Handler to be called when the video preview button is pressed. Used to override the default behaviour. |

### [`ToggleAudioPublishingButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ToggleAudioPublishingButton.tsx)

This component is used to toggle audio mute/unmute status while in the call.

| Type             | Type                        | Description                                                                |
| ---------------- | --------------------------- | -------------------------------------------------------------------------- |
| `onPressHandler` | `() => void` \| `undefined` | Handler to override the default behaviour of the audio publishing button.. |

### [`ToggleVideoPublishingButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ToggleVideoPublishingButton.tsx)

This component is used to toggle video mute/unmute status while in the call.

| Type             | Type                        | Description                                                               |
| ---------------- | --------------------------- | ------------------------------------------------------------------------- |
| `onPressHandler` | `() => void` \| `undefined` | Handler to override the default behaviour of the video publishing button. |

### [`ToggleCameraFaceButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ToggleCameraFaceButton.tsx)

This component is used to toggle camera face(front/back) when in the call.

| Type             | Type                        | Description                                                                 |
| ---------------- | --------------------------- | --------------------------------------------------------------------------- |
| `onPressHandler` | `() => void` \| `undefined` | Handler to override the default behaviour of the toggle camera face button. |

### [`ReactionsButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ReactionsButton.tsx)

This component is used to display the list of Reactions supported in the call. It can also be used to send reactions.

The following reactions are supported by default:

- rolling on the floor laughing 🤣
- like 👍
- rocket 🚀
- dislike 👎
- fireworks 🎉
- raised hands 🙌
- raised hand ✋

| Type             | Type                        | Description                                                                     |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------- |
| `onPressHandler` | `() => void` \| `undefined` | Handler to override the default behaviour when the reactions button is pressed. |

## Customization

Create custom components using [built-in call controls](#built-in-call-controls) as building blocks. See the [Call Controls UI Cookbook guide](/video/docs/react-native/ui-cookbook/replacing-call-controls/).


---

This page was last updated at 2026-04-17T17:34:03.209Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/call-controls/](https://getstream.io/video/docs/react-native/ui-components/call/call-controls/).