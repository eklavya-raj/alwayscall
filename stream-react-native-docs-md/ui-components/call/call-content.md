# CallContent

Highest-level UI component for building complete call screens with:

- **Full call UI** - Top view, participants grid, control buttons
- **Media controls** - Camera, microphone, speakerphone state management
- **Screen sharing** - Built-in rendering
- **Participant info** - Network quality, name, mute state, reactions
- **Video rendering** - Participant video streams
- **Layout options** - Grid or spotlight modes

Displays participant list/grid with avatars, names, video (if publishing), and connection quality.

<gallery>

![Call Content Grid](@video/react-native/_assets/ui-components/call/call-content/call-content-grid.png)

![Call Content Grid 3 Participants](@video/react-native/_assets/ui-components/call/call-content/call-content-grid-3-participants.png)

![Call Content Spotlight](@video/react-native/_assets/ui-components/call/call-content/call-content-spotlight.png)

</gallery>

## General usage

Show `CallContent` UI:

```tsx {13}
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};
```

<admonition type="warning">

Please ensure the `CallContent` component isn’t remounted during a call to avoid occasional audio loss.
We’re aware of this issue and working on a solution.

</admonition>

## Props

### `layout`

This switches the list between the grid and the spotlight mode.

See [Call layouts](/video/docs/react-native/ui-components/call/call-layouts/) for the layout components used by `CallContent`.

| Type                  | Default Value |
| --------------------- | ------------- |
| `grid` \| `spotlight` | `grid`        |

<admonition type="note">

When a screen is shared, the layout automatically changes to `spotlight` mode.

</admonition>

### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


### `mirror`

Forces participant's video to be mirrored or unmirrored. By default, video track from the local participant is mirrored, and all other videos are not mirrored.

This also applies to Picture-in-Picture rendering.

| Type      |
| --------- |
| `boolean` |

### [`onHangupCallHandler`](/video/docs/react-native/ui-components/call/call-controls/#onhangupcallhandler/)

Callback invoked after leave attempt from the hangup call button in call controls. Receives an error on failure.

| Type                                   |
| -------------------------------------- |
| `(err?: Error) => void` \| `undefined` |


### `supportedReactions`

Supported reactions for the call. Default reactions:

- 🤣 Rolling on the floor laughing
- 👍 like
- 👎 Dislike
- 🎉 fireworks
- 🙌 Raised hands
- ✋ Raised hand

| Type                                      |
| ----------------------------------------- |
| `StreamReactionType & { icon: string }[]` |


### `CallControls`

Prop to customize the `CallControls` component.

| Type                          | Default Value                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`CallControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/CallControls.tsx) |


### `ParticipantLabel`

Component to customize the Label of the participant.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantLabel`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantLabel.tsx) |


### `ParticipantReaction`

Component to customize the participant reaction display.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantReaction`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantReaction.tsx) |


### `ParticipantVideoFallback`

Component to customize the video fallback of the participant, when the video is disabled.

| Type                          | Default Value                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantVideoFallback`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantVideoFallback.tsx) |


### `ParticipantNetworkQualityIndicator`

Component to customize the network quality indicator of the participant.

| Type                          | Default Value                                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantNetworkQualityIndicator`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantNetworkQualityIndicator.tsx) |


### `VideoRenderer`

Component to customize the participant video. Also displays the [`ParticipantVideoFallback`](#participantvideofallback).

The `VideoRenderer` accepts a `mirror?: boolean` prop to force mirroring on or off. When provided, it takes precedence over the default mirroring logic.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`VideoRenderer`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/VideoRenderer/index.tsx) |

#### Props

| Prop                       | Type                                                                                                            | Default Value              | Description                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `participant`              | [`StreamVideoParticipant`](https://github.com/GetStream/stream-video-js/blob/main/packages/client/src/types.ts) |                            | The participant whose video or screenshare should be rendered.                                          |
| `trackType`                | `videoTrack` \| `screenShareTrack`                                                                              | `videoTrack`               | The track to render.                                                                                    |
| `isVisible`                | `boolean`                                                                                                       | `true`                     | When `false`, the video stream is not shown even if it is available.                                    |
| `objectFit`                | `'contain'` \| `'cover'` \| `undefined`                                                                         | `undefined`                | How the video fits within its container. When omitted, a default is computed from the track dimensions. |
| `videoZOrder`              | `number`                                                                                                        | `0`                        | The z-order to apply to the underlying RTC view.                                                        |
| `mirror`                   | `boolean` \| `undefined`                                                                                        | `undefined`                | Forces mirroring on or off. When omitted, the default mirroring logic is used.                          |
| `ParticipantVideoFallback` | `ComponentType` \| `null` \| `undefined`                                                                        | `ParticipantVideoFallback` | Component to render when video is unavailable. Use `null` to disable the fallback.                      |


### `ParticipantView`

Prop to customize the `ParticipantView` component entirely.

| Type                          | Default Value                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantView.tsx) |


### `FloatingParticipantView`

Prop to customize the `FloatingParticipantView` component.

| Type                          | Default Value                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`FloatingParticipantView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/FloatingParticipantView/index.tsx) |

#### Props

| Prop                                 | Type                                                                                                                           | Default Value                        | Description                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------ |
| `participant`                        | [`StreamVideoParticipant`](https://github.com/GetStream/stream-video-js/blob/main/packages/client/src/types.ts) \| `undefined` |                                      | The participant to render in the floating view.                                |
| `alignment`                          | `top-left` \| `top-right` \| `bottom-left` \| `bottom-right`                                                                   | `top-right`                          | Determines where the floating participant video will be placed initially.      |
| `onPressHandler`                     | `() => void` \| `undefined`                                                                                                    |                                      | Handler invoked when the floating participant view is pressed.                 |
| `participantViewStyle`               | [ViewStyle](https://reactnative.dev/docs/view-style-props)                                                                     |                                      | Style override for the participant view container.                             |
| `draggableContainerStyle`            | [ViewStyle](https://reactnative.dev/docs/view-style-props)                                                                     |                                      | Style override for the draggable container.                                    |
| `videoZOrder`                        | `number`                                                                                                                       | `1`                                  | The z-order for the video view.                                                |
| `objectFit`                          | `'contain'` \| `'cover'` \| `undefined`                                                                                        | `undefined`                          | How the video fits within its container.                                       |
| `mirror`                             | `boolean` \| `undefined`                                                                                                       | `undefined`                          | Forces mirroring on or off. When omitted, the default mirroring logic is used. |
| `supportedReactions`                 | `StreamReactionType & { icon: string }[]`                                                                                      |                                      | Reactions to enable for the floating participant view.                         |
| `ParticipantView`                    | `ComponentType` \| `undefined`                                                                                                 | `ParticipantView`                    | Custom participant view component.                                             |
| `ParticipantLabel`                   | `ComponentType` \| `undefined`                                                                                                 | `ParticipantLabel`                   | Custom label component.                                                        |
| `ParticipantReaction`                | `ComponentType` \| `undefined`                                                                                                 | `ParticipantReaction`                | Custom reaction component.                                                     |
| `ParticipantVideoFallback`           | `ComponentType` \| `null` \| `undefined`                                                                                       | `ParticipantVideoFallback`           | Fallback when video is unavailable. Use `null` to disable.                     |
| `ParticipantNetworkQualityIndicator` | `ComponentType` \| `undefined`                                                                                                 | `ParticipantNetworkQualityIndicator` | Custom network quality indicator.                                              |
| `VideoRenderer`                      | `ComponentType` \| `undefined`                                                                                                 | `VideoRenderer`                      | Custom video renderer component.                                               |


### `CallParticipantsList`

Prop to customize the `CallParticipantsList` component.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`CallParticipantsList`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallParticipantsList/CallParticipantsList.tsx) |


### `ScreenShareOverlay`

Component to customize the screen share overlay, when the screen is shared by a user.

| Type                          | Default Value                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ComponentType`\| `undefined` | [`ScreenShareOverlay`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/utility/ScreenShareOverlay.tsx) |

### `initialInCallManagerAudioMode`

<admonition type="warning">

This prop is deprecated and will be removed in a future version.
Please use `callManager.start()` with the appropriate audio configuration instead. See the [Camera & Microphone guide](/video/docs/react-native/guides/camera-and-microphone/#speaker-management) for the recommended approach.

</admonition>

Property to set the audio mode for the `react-native-incall-manager` library. If media type is `video`, audio is routed by default to speaker, otherwise it is routed to earpiece. Changing the mode on the fly is not supported. Manually invoke `InCallManager.start({ media })` to achieve this.

| Type              | Default Value |
| ----------------- | ------------- |
| `video`\| `audio` | `video`       |

## Customization

Customize via UI Cookbook recipes. See [`ParticipantView` customization guide](/video/docs/react-native/ui-components/participants/participant-view/#customization/).


---

This page was last updated at 2026-04-17T17:34:03.195Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/call-content/](https://getstream.io/video/docs/react-native/ui-components/call/call-content/).