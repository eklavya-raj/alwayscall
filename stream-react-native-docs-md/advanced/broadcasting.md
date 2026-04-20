# Broadcasting

Broadcasting transmits live or pre-recorded content to wide audiences.

Choose your approach:

- **[HLS](https://en.wikipedia.org/wiki/HTTP_Live_Streaming)** - Slight delay, better buffering
- **[WebRTC](https://webrtc.org/)** - Lower latency, less reliability

<admonition type="tip">

We have built a [livestream app tutorial](https://getstream.io/video/sdk/react-native/tutorial/livestreaming/) that relies on the broadcasting feature. The demo expands on how to implement both, the HLS and the WebRTC approach to streaming.

</admonition>

## Call type for broadcasting

Use the [`livestream` type](/video/docs/react-native/guides/configuring-call-types#livestream/) for broadcasting. It defaults to `backstage` mode, allowing hosts to set up before going live.

## Starting and stopping the broadcasting

Control broadcasting with `Call` methods:

```ts
await call.startHLS();
await call.stopHLS();
```

alternatively:

```ts
await call.goLive({ start_hls: true });
```

Access the HLS `playlist_url` from call state once broadcasting starts:

```ts
import { useCallStateHooks } from "@stream-io/video-react-sdk";

// omitted code ...

const YourComponent = () => {
  const { useCallEgress } = useCallStateHooks();
  const egress = useCallEgress();
  const m3u8Playlist = egress?.hls.playlist_url;

  // omitted code ...
};
```

Use a third-party library like [React Native Video](https://github.com/react-native-video/react-native-video) for HLS playback.

## Broadcasting via RTMP

Stream supports RTMP clients like [OBS](https://obsproject.com/).

### RTMP URL and stream key

Get RTMP address via `call.state.ingress` or `useCallIngress()`. Use a [user token](/video/docs/react-native/guides/client-auth/#generating-a-token/) as stream key.

```typescript
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallIngress } = useCallStateHooks();
const ingress = useCallIngress();

const rtmpURL = ingress?.rtmp.address;
const streamKey = myUserAuthService.getUserToken(rtmpUserId);

console.log("RTMP url:", rtmpURL, "Stream key:", streamKey);
```

### Configure OBS

1. Go to **Settings > Stream**
2. Select `custom` service
3. **Server** - Enter the `rtmpURL` from console
4. **Stream Key** - Enter the `streamKey` from console

Press **Start Streaming** - the RTMP stream appears as a video participant.


---

This page was last updated at 2026-04-17T17:34:01.631Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/broadcasting/](https://getstream.io/video/docs/react-native/advanced/broadcasting/).