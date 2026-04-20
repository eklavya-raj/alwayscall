# HostLivestream

Host-side livestream UI component with minimal setup. Features:

- **Full livestream UI** - Host and stream video content
- **Duration display** - Real-time duration with live indicator
- **Viewer count** - Live status and active viewer count
- **Controls** - Start/end stream, pause/resume audio/video

<gallery>

![Host Livestream Start](@video/react-native/_assets/ui-components/livestream/host-livestream-start.png)

![Host Livestream End](@video/react-native/_assets/ui-components/livestream/host-livestream-end.png)

</gallery>

## General usage

Show `HostLivestream` UI:

```tsx {13}
import {
  Call,
  StreamCall,
  HostLivestream,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <HostLivestream />
    </StreamCall>
  );
};
```

## Props

### `hls`

Enable HTTP livestreaming

| Type      | Default |
| --------- | ------- |
| `boolean` | false   |

### `HostLivestreamTopView`

Component to customize the top view at the host's live stream.

| Type                          | Default Value                                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`HostLiveStreamTopView`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamTopView/HostLivestreamTopView.tsx) |


### `LivestreamLayout`

Component to customize the live stream video layout.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`LiveStreamLayout`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamLayout/LivestreamLayout.tsx) |


### `HostLivestreamControls`

Component to customize the bottom view controls at the host's live stream.

| Type                          | Default Value                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ComponentType`\| `undefined` | [`HostLiveStreamControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/HostLivestreamControls.tsx) |

<admonition type="note">

To add screen-sharing to livestream, include the exported [`LivestreamScreenShareButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/LivestreamScreenShareButton.tsx) in your custom `HostLiveStreamControls` component.

</admonition>


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


### `HostStartStreamButton`

Component to customize the host's start/end live stream button.

| Type                          | Default Value                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`HostStartStreamButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/HostStartStreamButton.tsx) |


### `LivestreamMediaControls`

Component to customize the host's media control(audio/video) buttons.

| Type                          | Default Value                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`LiveStreamMediaControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/LivestreamControls/LivestreamMediaControls.tsx) |


### `onStartStreamHandler`

Handler to be called when the Start Stream button is pressed.

| Type                        |
| --------------------------- |
| `() => void` \| `undefined` |


### `onEndStreamHandler`

Handler to be called when the End Stream button is pressed.

| Type                        |
| --------------------------- |
| `() => void` \| `undefined` |


### `ScreenShareOverlay`

Component to customize the screen share overlay, when the screen is shared by a user.

| Type                          | Default Value                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ComponentType`\| `undefined` | [`ScreenShareOverlay`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/utility/ScreenShareOverlay.tsx) |


---

This page was last updated at 2026-04-17T17:34:03.242Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/livestream/host-livestream/](https://getstream.io/video/docs/react-native/ui-components/livestream/host-livestream/).