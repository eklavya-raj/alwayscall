# SRT ingress

Secure Reliable Transport (SRT) lets you ingest audio/video into Stream Video calls and livestreams. It's a modern alternative to RTMP with UDP transport, codec-agnostic support, and strong resilience to jitter and packet loss.

The target resolution and bitrate depend on your content type. See [Video bandwidth requirements](/video/docs/api/quality/introduction/#video-bandwidth-requirements) for detailed guidance.

## Quickstart

### 1) Create a call and generate SRT credentials

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const userID = "host-user-id";
const callID = "my-livestream";

const call = client.video.call("livestream", callID);
call.getOrCreate({
  data: {
    created_by_id: userID,
    members: [{ user_id: "john", role: "host" }],
  },
});
const credentials = call.createSRTCredentials(userID);

console.log(credentials.address);
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallRequest, MemberRequest

user_id = "host-user-id"
call_id = "my-livestream"

call = client.video.call('livestream', call_id)
call.create(
    data=CallRequest(
        created_by_id=user_id,
        members=[MemberRequest(user_id=user_id, role="host")],
    ),
)

srt_credentials = call.create_srt_credentials(user_id)
print(srt_credentials.address)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call := client.Video().Call("default", "my-livestream")
_, err := call.GetOrCreate(context.Background(), &getstream.GetOrCreateCallRequest{
    Data: &getstream.CallRequest{
        CreatedByID: &userID,
    },
})
if err != nil {
    log.Fatal(err)
}

credentials, err := call.CreateSRTCredentials("host-user-id")
if err != nil {
    log.Fatal(err)
}

fmt.Println(credentials.Address)
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
String userId = "user-" + RandomStringUtils.randomAlphanumeric(10);
client.updateUsers(
        UpdateUsersRequest.builder()
                .users(Map.of(userId, UserRequest.builder().id(userId).name("User Name").build()))
                .build()
);

String callID = "call-" + RandomStringUtils.randomAlphanumeric(10);
Call call = video.call("livestream", callID);
call.getOrCreate(GetOrCreateCallRequest.builder().data(
        CallRequest.builder().createdByID(userId).build()
).build());

String srtToken = call.createSRTCredentials(testUser.getId()).getAddress();
System.out.println("SRT Token: " + srtToken);
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Create the call (example)
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" -H "Content-Type: application/json" -H "stream-auth-type: jwt" \
  -d '{
    "data": {"created_by_id": "host-user-id", "members": [{"user_id": "host-user-id", "role": "host"}]}
  }'

# Generate SRT credentials (address contains embedded credentials)
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}/srt_credentials?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" -H "Content-Type: application/json" -H "stream-auth-type: jwt" \
  -d '{"user_id": "host-user-id"}'
```

</tabs-item>

</tabs>

### 2) Send video to Stream via ffmpeg or OBS

If you have ffmpeg installed, you can quickly send a sample video to your call. Replace `${SRT_ADDRESS}` with the generated address above.

**Send with FFMPEG**

```bash
ffmpeg -re \
  -i "https://cdn.jsdelivr.net/npm/big-buck-bunny-1080p@0.0.6/video.mp4" \
  -c:v libx264 -preset veryfast -tune zerolatency -g 50 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ac 2 \
  -f mpegts "${SRT_ADDRESS}"
```

**Send with OBS**

To stream from OBS using SRT, use a recent OBS release (32.0.0 or newer). Then set Service to “Custom” and paste the SRT address into the Server/URL field.

![OBS SRT settings](@video/api/_assets/obs-srt.jpg)

Note: OBS 32.0.0+ is required for stable SRT support; older versions may fail to publish.

### 3) Preview the stream

Use the viewer [demo](https://pronto.getstream.io/livestream) to watch the livestream via WebRTC/HLS. Ensure you use the same API key and call ID you used in step 1.

## Recommended settings

- Video codec: H.264
- Choose resolution/bitrate for your content. See [Quality](/video/docs/api/quality/introduction/) for guidance.

## SRT vs RTMP

| Feature     | SRT                        | RTMP                             |
| ----------- | -------------------------- | -------------------------------- |
| Latency     | ~100 ms – 1s               | ~2s                              |
| Transport   | UDP (ARQ/FEC)              | TCP                              |
| Reliability | High (handles jitter/loss) | Moderate (retransmits add delay) |
| Security    | AES encryption             | RTMPS/TLS required               |
| Codecs      | H.264, AV1, VP8, VP9       | Commonly H.264/AAC               |


---

This page was last updated at 2026-04-17T17:34:03.132Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/srt/](https://getstream.io/video/docs/react-native/streaming/srt/).