# Call layouts

Call layout components render participants in grid or spotlight arrangements and are used by [`CallContent`](/video/docs/react-native/ui-components/call/call-content/).

Use these components directly when you need custom call screens but still want the SDK layout behavior.

## `CallParticipantsGrid`

Renders participants in a grid-oriented layout.

### General usage

```tsx
import {
  Call,
  CallParticipantsGrid,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;

  return (
    <StreamCall call={call}>
      <CallParticipantsGrid />
    </StreamCall>
  );
};
```

### Props

#### `showLocalParticipant`

Controls whether the local participant is shown in one-to-one calls when floating behavior is active.

| Type                     | Default Value |
| ------------------------ | ------------- |
| `boolean` \| `undefined` | `false`       |

#### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


#### `mirror`

Forces participant videos to be mirrored or unmirrored. By default, local front camera video is mirrored and remote videos are not mirrored.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |

#### `supportedReactions`

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


#### `CallParticipantsList`

Prop to customize the `CallParticipantsList` component.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`CallParticipantsList`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallParticipantsList/CallParticipantsList.tsx) |


#### `ParticipantView`

Prop to customize the `ParticipantView` component entirely.

| Type                          | Default Value                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantView.tsx) |


#### `ParticipantLabel`

Component to customize the Label of the participant.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantLabel`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantLabel.tsx) |


#### `ParticipantReaction`

Component to customize the participant reaction display.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantReaction`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantReaction.tsx) |


#### `ParticipantVideoFallback`

Component to customize the video fallback of the participant, when the video is disabled.

| Type                          | Default Value                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantVideoFallback`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantVideoFallback.tsx) |


#### `ParticipantNetworkQualityIndicator`

Component to customize the network quality indicator of the participant.

| Type                          | Default Value                                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantNetworkQualityIndicator`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantNetworkQualityIndicator.tsx) |


#### `VideoRenderer`

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


## `CallParticipantsSpotlight`

Renders one participant in spotlight and remaining participants in a secondary list.

### General usage

```tsx
import {
  Call,
  CallParticipantsSpotlight,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;

  return (
    <StreamCall call={call}>
      <CallParticipantsSpotlight />
    </StreamCall>
  );
};
```

### Props

#### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


#### `mirror`

Forces participant videos to be mirrored or unmirrored. By default, local front camera video is mirrored and remote videos are not mirrored.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |

#### `supportedReactions`

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


#### `CallParticipantsList`

Prop to customize the `CallParticipantsList` component.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`CallParticipantsList`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallParticipantsList/CallParticipantsList.tsx) |


#### `ScreenShareOverlay`

Component to customize the screen share overlay when a user is sharing their screen.

| Type                          | Default Value                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ComponentType`\| `undefined` | [`ScreenShareOverlay`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/utility/ScreenShareOverlay.tsx) |

#### `ParticipantView`

Prop to customize the `ParticipantView` component entirely.

| Type                          | Default Value                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantView.tsx) |


#### `ParticipantLabel`

Component to customize the Label of the participant.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantLabel`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantLabel.tsx) |


#### `ParticipantReaction`

Component to customize the participant reaction display.

| Type                          | Default Value                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantReaction`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantReaction.tsx) |


#### `ParticipantVideoFallback`

Component to customize the video fallback of the participant, when the video is disabled.

| Type                          | Default Value                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantVideoFallback`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantVideoFallback.tsx) |


#### `ParticipantNetworkQualityIndicator`

Component to customize the network quality indicator of the participant.

| Type                          | Default Value                                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ParticipantNetworkQualityIndicator`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantNetworkQualityIndicator.tsx) |


#### `VideoRenderer`

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



---

This page was last updated at 2026-04-17T17:34:00.964Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/call-layouts/](https://getstream.io/video/docs/react-native/ui-components/call/call-layouts/).