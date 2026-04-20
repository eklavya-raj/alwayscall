# RTMP ingress

You can send audio and video to any call using any software that support the RTMP protocol, such as OBS or products like Restream. Stream exposes an ingress service that handles RTMP audio/video and publishes it to calls that users can connect to via WebRTC.

The audio and video sent via RTMP is transcoded by Stream ingress layer and published using multiple qualities and optionally with AV1 codec.

The target resolution and bitrate depend on your content type. See [Video bandwidth requirements](/video/docs/api/quality/introduction/#video-bandwidth-requirements) for detailed guidance.

## RTMP publishing

This is how you can acquire the necessary information for publishing RTMP using a third-party software.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const resp = await call.get();

// userId of existing user
const userId = "jane";
await client.upsertUsers([{ id: userId }]);
const token = client.generateUserToken({ user_id: userId });
const rtmpURL = resp.call.ingress.rtmp.address;
const streamKey = token;

console.log(rtmpURL, streamKey);
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import UserRequest

call = client.video.call("default", uuid.uuid4())
# create the call where the RTMP will be sent to
response = call.get_or_create()

# ensure we have a user for the host to send video via RTMP
client.upsert_users(
    UserRequest(id="tommaso-the-host")
)

# create a token for the user sending video, this can be used as the stream key
stream_key = client.create_token(user_id, expiration=3600)

rtmp_url = response.data.call.ingress.rtmp.address
print(rtmp_url, stream_key)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call := client.Video().Call("default", uuid.New().String())
// create the call where the RTMP will be sent to
response, err := call.GetOrCreate(ctx, &getstream.GetOrCreateCallRequest{})

// ensure we have a user for the host to send video via RTMP
client.UpdateUsers(ctx, &getstream.UpdateUsersRequest{
	Users: map[string]getstream.UserRequest{
		"tommaso-the-host": {
		  ID: "tommaso-the-host",
	  },
  },
})

// create a token for the user sending video, this can be used as the stream key
expiration := time.Now().Add(1 * time.Hour)
streamKey, err := client.CreateToken("tommaso-the-host", &StreamJWTClaims{Expire: &expiration})

rtmpURL := response.Data.Call.Ingress.Rtmp.Address
fmt.Println("RTMP URL:", rtmpURL, "Stream Key:", streamKey)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# RTMP URL is: response.call.rtmp.address
curl -X GET "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# Stream key: create a user token
```

</tabs-item>

</tabs>


The user(s) streaming from the third-party software will show up as regular users in the call.

You can see an example in the [Quickstart](/video/docs/api/streaming/overview/#test-sending-video-via-rtmp-using-obs/).

### Streaming into a call with OBS

1. Open OBS and go to `Settings` (CMD + , on macOS).
2. Set the `Stream Type` to `Custom`.
3. Set the `URL` to the `rtmp_url` you got from the API.
4. Set the `Stream Key` to the `stream_key` you got from the API.

![Rtmp Obs Settings](@video/api/_assets/rtmp_obs_settings.png)

#### Optimal OBS Video Encoding Settings

To ensure optimal quality and performance when transcoding media from RTMP, follow these recommended H.264 encoding settings:

Go to `Settings`:

**Video**:

- Base Resolution: 1920x1080
- Output Resolution: 1920x1080 (Same as input resolution)

**Output**:

- Encoder: `x264`
- Rate Control: `CBR` (Constant Bit Rate)
- Bitrate: 3,000-6,000 kbps (adjust based on your network and type of media being streamed, higher movement will require higher bitrate)
- Keyframe Interval: 2 seconds
- CPU Usage Preset: `veryfast` (balance between quality and encoding speed)
- Tune: `zerolatency`

![Rtmp In Obs Output Settings](@video/api/_assets/rtmp_in_obs_output_settings.png)

_The example is for OBS, but any other RTMP client should support adding the same settings_

### Streaming into a call with restream.io

1. Go to [restream.io](https://restream.io/) and create an account.
2. For streaming to a custom RTMP server, you need to have a paid account.
3. Add a new channel and select `Custom RTMP`.
4. Set the `Server` to the `rtmp_url` you got from the API.
5. Set the `Stream Key` to the `stream_key` you got from the API.

![Rtmp Restream Settings](@video/api/_assets/rtmp_restream_settings.png)

### Streaming into a call with vMix

[vMix](https://www.vmix.com/) is a professional live video production and streaming software for Windows that supports RTMP streaming. vMix offers advanced features for live production including multiple camera inputs, mixing, transitions, and built-in graphics.

1. Open vMix and go to `Stream` settings (gear icon in the bottom).
2. Select `Custom RTMP Server` from the `Destination` dropdown menu.
3. Enter your stream credentials:
   - **URL**: Enter the `rtmp_url` you got from the API
   - **Stream Name or Key**: Enter the `stream_key` you got from the API
4. Select stream quality, for example `H264 1080p 6mbps AAC 128kbps` (similar to the [OBS recommendations](#optimal-obs-video-encoding-settings)).
5. Click `Save and Close` to save the settings.
6. Click the `Stream` button in the main vMix interface to start streaming.

The vMix output will appear in your call as a regular participant. vMix supports the same H.264 encoding recommendations as OBS for optimal performance.

### Streaming a file into a call with FFmpeg

With your call's RTMP url `$CALL_RTMP_URL` and your token streamKey `$STREAM_KEY` from [publishing](#rtmp-publishing).
Run:

```bash
ffmpeg -re -stream_loop 400 -i YourVideoFile1080p30fps.mp4 \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k \
  -ac 2 -f flv "$CALL_RTMP_URL/$STREAM_KEY"
```

### FAQ

#### What is the typical latency introduced by RTMP?

RTMP input typically introduces a latency of 2-5 seconds. This can vary based on the network conditions, encoder settings (as the stream will be transcoded), and the performance of the RTMP server.
Optimizing [encoding settings](#optimal-obs-video-encoding-settings) and ensuring a stable network connection can help minimize this latency.

#### What are the best practices for setting up OBS for RTMP streaming?

Refer to [Optimal OBS Video Encoding Settings](#optimal-obs-video-encoding-settings).

#### Do we support both RTMP and RTMPS?

RTMP input service supports exclusively RTMPS. RTMPS is the recommended for secure streaming as it uses SSL/TLS to encrypt the data, providing an additional layer of security over RTMP.

#### What are the recommended internet connection settings for optimal streaming performance?

- **Upload Speed**: At least double the target bitrate of your stream. For example, if streaming at 5,000 kbps, ensure an upload speed of at least 10 Mbps.
- **Connection Type**: Wired Ethernet connection is preferred over Wi-Fi for stability.
- **Network Quality**: Ensure low packet loss (&lt;1%) and low jitter (&lt;30ms).

#### Enhanced RTMP protocol

RTMP only supports the h.264 codec, TCP and the FLV container. The enhanced RTMP protocol addresses some of the limitation of the protocol. Adoption of enhanced RTMP is very scarce, Stream ingress does not support it either.
If you are interested in a more modern video ingestion protocol, we recommend looking into SRT or WHIP. Both protocols support modern codecs and use UDP for best latency.


---

This page was last updated at 2026-04-17T17:34:03.130Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/rtmp/](https://getstream.io/video/docs/react-native/streaming/rtmp/).