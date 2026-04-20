# LivestreamPlayer

Play WebRTC livestreams with call ID and type. Uses [`ViewerLivestream`](/video/docs/react-native/ui-components/livestream/viewer-livestream/) internally.

![Preview of the LivestreamPlayer component.](@video/react-native/_assets/ui-components/livestream/viewer-livestream.jpg)

## General usage

Show `LivestreamPlayer` UI:

```tsx
import {
  StreamVideo,
  LivestreamPlayer,
} from '@stream-io/video-react-native-sdk';

const LivestreamScreen() {
  return (
    <StreamVideo client={client}>
      <LivestreamPlayer callType="livestream" callId={callId} />
    </StreamVideo>
  );
}
```

## Props

### `callType`

The call type. Usually `livestream`.

### `callId`

The call ID.

### `ViewerLivestream`

Component to override the ViewerLivestream component that is used under the hood.

| Type                          | Default Value                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`ViewerLivestream`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Livestream/ViewerLivestream/ViewerLivestream.tsx) |

### `joinBehavior`

Determines when the viewer joins the call. Can have one of these two values: `"asap"` (by default) or `"live"`.


---

This page was last updated at 2026-04-17T17:34:03.246Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/livestream/livestream-player/](https://getstream.io/video/docs/react-native/ui-components/livestream/livestream-player/).