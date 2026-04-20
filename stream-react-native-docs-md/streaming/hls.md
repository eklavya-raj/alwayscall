# HLS

[HLS streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) provides better buffering than WebRTC, at the cost having a slight delay in your livestreams.

## Start and stop HLS broadcast

There are two ways to start/stop HLS broadcast:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.startHLSBroadcasting();

// to end broadcasting
call.stopHLSBroadcasting();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.start_hls_broadcasting()

# to end broadcasting
call.stop_hls_broadcasting()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.StartHLSBroadcasting(ctx, &getstream.StartHLSBroadcastingRequest{})
// to end broadcasting
call.StopHLSBroadcasting(ctx, &getstream.StopHLSBroadcastingRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/start_broadcasting?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>


Or, if you're using backstage mode, you can do that when going live:

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


Once the live ended, the HLS broadcast will be stopped as well.

## User permissions

To perform these operations, users need the following capabilities:

- `start-broadcast-call`
- `stop-broadcast-call`

## Broadcast state

You can check if the call is being broadcast like this:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const resp = await call.get();
const isBroadcasting = resp.call.egress.broadcasting;
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
response = call.get()
print(f"broadcasting: {response.data.call.egress.broadcasting}")
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
response, err := call.Get(ctx, &getstream.GetCallRequest{})
fmt.Printf("broadcasting: %v", response.Data.Call.Egress.Broadcasting)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Broadcasting state: resp.call.egress.broadcasting
curl -X GET "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Events

These events are sent to users connected to the call and your webhook/SQS:

- `call.broadcasting_started`
- `call.broadcasting_stopped`
- `call.broadcasting_failed`

## Consuming HLS broadcast

Users don't need to join the call to consume the HLS broadcast, but they need to have the URL of the broadcast:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const resp = await call.get();
const URL = resp.call.egress.hls?.playlist_url;
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
response = call.get()

# the URL of the HLS stream
response.data.call.egress.hls.playlist_url
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
response, err := call.Get(ctx, &getstream.GetCallRequest{})
fmt.Printf("HLS URL: %v", response.Data.Call.Egress.Hls.PlaylistUrl)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Broadcasting URL: resp.call.egress.hls.playlist_url
curl -X GET "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Multitracking

Multitracking allows you to provide multiple quality streams to your users, so they can choose the one that fits their network conditions.
Lower quality streams will be downsampled from the highest quality stream. Using portrait and landscape orientations in the same stream is not supported.
To enable multitracking, you need to override the `quality_tracks` field in the HLS settings or update call type settings on the dashboard.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const callType = "default";
const callId = "my-call";
const call = client.video.call(callType, callId);

// optionally provide additional data
call.getOrCreate({
  data: {
    created_by_id: "john",
    settings_override: {
      broadcasting: {
        enabled: true,
        hls: {
          quality_tracks: ["720p", "480p", "360p"],
        },
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call = client.video.call("default", uuid.uuid4())

call.get_or_create(
    data=CallRequest(
        created_by_id="john",
        settings_override=CallSettingsRequest(
            broadcasting=BroadcastSettingsRequest(
                enabled=True,
                hls=HLSSettingsRequest(
                    quality_tracks=["720p", "480p", "360p"],
                ),
            ),
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call := client.Video().Call("default", uuid.NewString())

response, err := call.GetOrCreate(context.Background(), &getstream.GetOrCreateCallRequest{
    Data: &getstream.CallRequest{
        CreatedByID: getstream.PtrTo("john"),
        SettingsOverride: &getstream.CallSettingsRequest{
            Broadcasting: &getstream.BroadcastSettingsRequest{
                Enabled: getstream.PtrTo(true),
                HLS: &getstream.HLSSettingsRequest{
                    QualityTracks: []string{"720p", "480p", "360p"},
                },
            },
        },
    },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "<https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}>" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "created_by_id": "john",
        "settings_override": {
            "broadcasting": {
                "enabled": true,
                "hls": {
                    "quality_tracks": ["720p", "480p", "360p"]
                }
            }
        }
    }
  }'
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:03.133Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/hls/](https://getstream.io/video/docs/react-native/streaming/hls/).