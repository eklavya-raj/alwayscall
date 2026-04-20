# ViewerLivestream

Viewer-side livestream UI component with minimal setup. Features:

- **Full viewer UI** - View stream video content
- **Duration display** - Real-time duration with live indicator
- **Viewer count** - Live status and active viewer count
- **Interactive controls** - Play/pause, audio, show/hide controls, leave

<gallery>

![Viewer Livestream](@video/react-native/_assets/ui-components/livestream/viewer-livestream.jpg)

![Viewer Livestream Screen Share](@video/react-native/_assets/ui-components/livestream/viewer-livestream-screenshare.jpg)

</gallery>

## General usage

Show `ViewerLivestream` UI:

```tsx {13}
import {
  Call,
  StreamCall,
  ViewerLivestream,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <ViewerLivestream />
    </StreamCall>
  );
};
```

## Props

### `ViewerLivestreamTopView`

Component to customize the top view at the viewer's live stream.

| Type                          | Default Value                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ViewerLiveStreamTopView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamTopView/ViewerLivestreamTopView.tsx) |


### `LivestreamLayout`

Component to customize the live stream video layout.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`LiveStreamLayout`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamLayout/LivestreamLayout.tsx) |


### `ViewerLivestreamControls`

Component to customize the bottom view controls at the viewer's live stream.

| Type                          | Default Value                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ViewerLiveStreamControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/ViewerLivestreamControls.tsx) |


### `DurationBadge`

Component to customize the duration badge on the viewer's livestream top view.

| Type                          | Default Value                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`DurationBadge`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamTopView/DurationBadge.tsx) |


### `FollowerCount`

Component to customize the follower count indicator on the viewer's livestream top view.

| Type                          | Default Value                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`FollowerCount`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamTopView/FollowerCount.tsx) |


### `LiveIndicator`

Component to customize the live indicator on the viewer's livestream top view.

| Type                          | Default Value                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`LiveIndicator`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamTopView/LiveIndicator.tsx) |


### `ViewerLeaveStreamButton`

Component to customize the leave stream button for the viewer.

| Type                          | Default Value                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ViewerLeaveStreamButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/ViewerLeaveStreamButton.tsx) |


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


### `onLeaveStreamHandler`

Handler to be called when the leave stream button is pressed by the viewer.

| Type                        |
| --------------------------- |
| `() => void` \| `undefined` |


### `joinBehavior`

Determines when the viewer joins the call. Can have one of these two values: `"asap"` (by default) or `"live"`.


---

This page was last updated at 2026-04-17T17:34:01.048Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/livestream/viewer-livestream/](https://getstream.io/video/docs/react-native/ui-components/livestream/viewer-livestream/).