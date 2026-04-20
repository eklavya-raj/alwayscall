# Overview

In this section, we are going to explain how you can use Stream to power different livestream use cases.

The most common way for users to connect to a livestream is with webRTC, HLS is also supported but comes with higher latency (~6s).

Publishing can be done using webRTC (same SDKs used to connect to calls) or using one of the available ingresses.

## Video ingress options

Stream supports multiple ways to send video into a call. Each ingress method has different trade-offs in terms of latency, software compatibility, and cost.

| Ingress                                     | Latency | Transport    | Software support                                     | Transcoding cost |
| ------------------------------------------- | ------- | ------------ | ---------------------------------------------------- | ---------------- |
| [WebRTC](/video/docs/api/streaming/webrtc/) | ~100ms  | UDP          | Stream SDKs (browser, mobile)                        | No               |
| [WHIP](/video/docs/api/streaming/whip/)     | ~100ms  | UDP (WebRTC) | OBS 32.1.0+                                          | No               |
| [SRT](/video/docs/api/streaming/srt/)       | 2s      | UDP          | OBS 32.0.0+, ffmpeg, professional broadcast hardware | Yes              |
| [RTMP](/video/docs/api/streaming/rtmp/)     | 2s      | TCP          | OBS, vMix, Restream, ffmpeg, most streaming software | Yes              |

### Which ingress should I use?

- **WebRTC**: Best for browser and mobile apps using Stream SDKs. Lowest latency and no transcoding costs. Requires better hardware and connectivity compared to WHIP/RTMP/SRT.
- **WHIP**: Best for streaming from OBS with low latency and no transcoding costs. Requires OBS 32.1.0 or newer. Requires better hardware and connectivity compared to RTMP/SRT.
- **SRT**: Best for professional broadcast setups or when you need resilience to network issues. Modern protocol with better latency than RTMP (UDP).
- **RTMP**: Best for maximum compatibility with existing streaming software and hardware. Higher latency but works with almost any streaming tool.

Using WebRTC yields the best user experience:

- Stream video allows you to power ultra-low-latency streaming (hundreds of milliseconds). This is made possible by our worldwide edge infrastructure, which supports WebRTC for consuming and sending video.
- WebRTC livestreams can be interactive (users can send reactions, messages, etc.). This is not possible with other protocols (such as HLS).

[Let us know if you wish to use other streaming protocols.](https://github.com/GetStream/protocol/discussions/127)

Other important features related to livestream that are discussed in this section:

- Multiple streams & co-hosts
- RTMP in and WebRTC input
- Exporting to HLS

## Quickstart

Before diving into the detail, let's get a livestream up and running.

### Create a new livestream call using the API

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```javascript
call = client.video.call("livestream", callId);
const response = await call.getOrCreate({
  data: {
    created_by_id: "john",
    // You can add multiple hosts if you want to
    members: [{ user_id: "john", role: "host" }],
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallRequest, MemberRequest

call = client.video.call('livestream', callId)
response = call.create(
    data=CallRequest(
        created_by_id="john",
        # You can add multiple hosts if you want to
        members=[MemberRequest(user_id="john", role="host")],
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go

call := client.Video().Call("livestream", callID)
response, err := call.GetOrCreate(ctx, &getstream.GetOrCreateCallRequest{
  Data: &getstream.CallRequest{
    CreatedByID: getstream.PtrTo("john"),
    // You can add multiple hosts if you want to
    Members: []getream.MemberRequest{
      {UserID: "john", Role: getstream.PtrTo("host")},
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "created_by_id": "john",
      "members": [
        { "role": "host", "user_id": "john" }
      ]
    }
  }'
```

</tabs-item>

</tabs>

The built-in `livestream` call type has sensible defaults for livestreaming. However, you can customize that call type or create your own to better match your requirements. More information on this topic can be found in the [Call Types section](/video/docs/api/call_types/builtin/).

### Set the call live

By default, livestreams are created in backstage mode. When in backstage mode, streams can only be accessed by admin-like users.
This is necessary because it makes it possible to create the setup in advance and to notify and grant access to viewers when the event starts.

All we need to do in this case is call the `GoLive` method on the call object, and that will make it accessible to viewers.

This method will automatically start the following processes if those are set to `auto-on`:

- HLS broadcast
- Closed captions
- Transcription
- Recording starts in backstage mode, so it's already on at this point

If you set any of the above processes to `available` you can start them with a corresponding flag.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.goLive();

// Optionally start processes that are set to `available`
call.goLive({
  // Optionally start HLS broadcast
  start_hls: true,
  // Optionally start recording the call
  start_recording: true,
  // Optionally start displaying closed captions for call participants
  start_closed_caption: true,
  // Optionally start saving the call transcription to a file
  start_transcription: true,
  // Optionally select storage for the recording file (if none is specified, the default storage will be used)
  recording_storage_name: "<storage name>",
  // Optionally select storage for the transcription file (if none is specified, the default storage will be used)
  transcription_storage_name: "<storage name",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.go_live()

# Optionally start processes that are set to `available`
call.go_live(
  # Optionally start HLS broadcast
  start_hls=True,
  # Optionally start recording the call
  start_recording=True,
  # Optionally start displaying closed captions for call participants
  start_closed_caption=True,
  # Optionally start saving the call transcription to a file
  start_transcription=True,
  # Optionally select storage for the recording file (if none is specified, the default storage will be used)
  recording_storage_name="<storage name>",
  # Optionally select storage for the transcription file (if none is specified, the default storage will be used)
  transcription_storage_name="<storage name>"
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.GoLive(ctx, &getstream.GoLiveRequest{})

// Optionally start processes that are set to `available`
call.GoLive(ctx, &getstream.GoLiveRequest{
  // Optionally start HLS broadcast
  StartHLS: getstream.PtrTo(true),
  // Optionally start recording the call
  StartRecording: getstream.PtrTo(true),
  // Optionally start displaying closed captions for call participants
  StartClosedCaption: getstream.PtrTo(true),
  // Optionally start saving the call transcription to a file
  StartTranscription: getstream.PtrTo(true),
  // Optionally select storage for the recording file (if none is specified, the default storage will be used)
  RecordingStorageName: getstream.PtrTo("<storage name>"),
  // Optionally select storage for the transcription file (if none is specified, the default storage will be used)
  TranscriptionStorageName: getstream.PtrTo("<storage name>"),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}/go_live?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# Optionally start processes that are set to `available`
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}/go_live?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "start_hls": true, # Optionally start HLS broadcast
    "start_recording": true, # Optionally start recording the call
    "start_closed_caption": true, # Optionally start displaying closed captions for call participants
    "start_transcription": true, # Optionally start saving the call transcription to a file
    "recording_storage_name": "<storage name>", # Optionally select storage for the recording file (if none is specified, the default storage will be used)
    "transcription_storage_name": "<storage name>" # Optionally select storage for the transcription file (if none is specified, the default storage will be used)
  }'
```

</tabs-item>

</tabs>


For more information, see the [Backstage page](/video/docs/api/streaming/backstage/).

### Sending video from browser or mobile with WebRTC

For testing purposes, you can use this [simple example host application](https://codesandbox.io/s/javascript-livestream-host-3hs4vt). You can open the application multiple times which allows you to have multiple hosts, who can send multiple audio/video streams. Don't forget to provide the necessary credentials before testing.

### Watching the stream

For testing purposes, you can use this [simple example application](https://codesandbox.io/s/javascript-livestream-viewer-lwzgmw) that can play WebRTC and HLS streams as well. Don't forget to provide the necessary credentials before testing.

### Test sending video via RTMP using OBS

Almost all livestream software and hardware supports RTMP. Our API supports using third-party software for streaming using RTMP.

Let's keep the demo app open and try to send video to the same call using RTMP.

#### Log the URL & Stream Key

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


#### Open OBS and go to settings -> stream

Select "custom" service
Server: equal to the rtmpURL from the log
Stream key: equal to the streamKey from the log

Press start streaming in OBS. The RTMP stream will now show up in your call just like a regular video participant.

You can test the livestream with the test application linked above.

For more information on this topic, see the [RTMP page](/video/docs/api/streaming/rtmp/).


---

This page was last updated at 2026-04-17T17:34:00.909Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/overview/](https://getstream.io/video/docs/react-native/streaming/overview/).