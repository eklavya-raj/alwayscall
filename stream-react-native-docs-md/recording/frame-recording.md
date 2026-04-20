# Frame Recording

Frame recording is a lightweight alternative to traditional call recordings that focuses on capturing periodic still images (or “frames”) from your video calls. When enabled, events with key frames are delivered periodically to your backend via webhooks/SQS.

Common use-cases for this feature include:

- **Quickly Spot Inappropriate Behavior:** By reviewing periodically captured frames, moderators can rapidly identify any visual signs of misconduct or potential issues in real time.
- **Empower AI Moderation:** Seamlessly integrate with AI-driven moderation tools that analyze the visual content automatically, flagging suspicious activities based on the still images received.
- **Enhance Post-Call Analysis:** Utilize the still images as reference points during investigations of reported incidents or for performing detailed compliance checks.
- **Reduce Storage Overhead:** Focus on capturing key moments without the data-heavy requirements of full video recordings, resulting in efficient data management.

Frame recording can be started/stopped for specific calls using the API or can be configured to automatically start for all calls.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// starts frame recording
call.startFrameRecording();

// stops the frame recording for the call
call.stopFrameRecording();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# starts frame recording
call.start_frame_recording()

# when frame recording is running call.Egress.FrameRecording will be populated

# stops the frame recording for the call
call.stop_frame_recording()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call := client.Video().Call("default", "call-id")

// starts frame recording
_, err := call.StartFrameRecording(ctx, &getstream.StartFrameRecordingRequest{})

// stops the frame recording for the call
_, err = call.StopFrameRecording(ctx, &getstream.StopFrameRecordingRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/start_frame_recording?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"

curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/stop_frame_recording?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Keyframe event

A [`call.frame_recording_ready`](/video/docs/api/webhooks/events/#CallFrameRecordingReadyType) event is delivered to your webhook/SQS handler periodically, by default a key-frame event is sent every two seconds for each participant.
For example, on a call with 3 participants you will receive 3 events every 2 seconds.

Here's an example of the event payload:

```json
{
  "call_cid": "default:e6fd0221-c926-40a6-80d4-9aa386937cae",
  "captured_at": "2025-02-10T09:15:37.95784985Z",
  "created_at": "2025-02-10T09:15:44.252969252Z",
  "session_id": "e48dd421-6281-457e-8995-0ccc463da252",
  "track_type": "TRACK_TYPE_VIDEO",
  "type": "call.frame_recording_ready",
  "url": "https://path/to/captured/image",
  "users": {
    "$user_id": {
      "banned": false,
      "blocked_user_ids": [],
      "created_at": "2023-11-24T15:32:08.327662Z",
      "id": "$user_id",
      "image": "...",
      "invisible": false,
      "language": "",
      "last_active": "2025-02-10T09:15:39.515802276Z",
      "name": "Tommaso Barbugli",
      "online": true,
      "role": "user",
      "shadow_banned": false,
      "teams": [],
      "updated_at": "2024-05-10T14:11:48.986736Z"
    }
  }
}
```

Your backend can use this events to perform image moderation on a live call and then use the [moderation APIs](/video/docs/api/moderation/overview/) to take necessary actions.

## Adjusting events frequency and quality

You can adjust how often frames are captured to to anything between 2 and 60 seconds (by default frames are captured every three seconds). It is also possible to change the resolution for the image to any of these values: `360p`, `420p`, `720p`, `1080p` and `1440p`. By default 720p is used.

## Running frame recorder automatically for all calls

You can configure your call type to automatically start a frame recorder for every new call, this can be done via API or from the dashboard:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.video.updateCallType({
  name: "default",
  settings: {
    frame_recording: {
      mode: "auto-on",
      capture_interval_in_seconds: 5,
      quality: "720p",
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest, FrameRecordingSettingsRequest

# Run frame recorder automatically to all calls
response = client.video.update_call_type(
    name="default",
    settings=CallSettingsRequest(
        frame_recording=FrameRecordingSettingsRequest(
            mode="auto-on",
            capture_interval_in_seconds=5,
             quality="720p",
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Run frame recorder automatically to all calls
client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
    Settings: &getstream.CallSettingsRequest{
        FrameRecording: &getstream.FrameRecordingSettingsRequest{
            Mode:                     "auto-on",
            CaptureIntervalInSeconds: 2,
        },
    },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Run frame recorder automatically to all calls
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "frame_recording": {
        "mode": "auto-on",
        "capture_interval_in_seconds": 2
      }
    }
  }'
```

</tabs-item>

</tabs>

## External storage

By default, keyframe images are stored on Stream CDN and retained for 2-weeks. The image URLs are all signed. If your call type is configured to use a different storage, then the images will be uploaded to that storage.

## Events

These events are sent to your webhook/SQS when using frame recording:

- [`call.frame_recording_started`](/video/docs/api/webhooks/events/#CallFrameRecordingStartedEventType) when frame recording has started
- [`call.frame_recording_stopped`](/video/docs/api/webhooks/events/#CallFrameRecordingStoppedEventType) when frame recording stopped
- [`call.frame_recording_failed`](/video/docs/api/webhooks/events/#CallFrameRecordingFailedEventType) when frame recording failed to start

## User Permissions

You can start/stop frame recording server-side or client-side. There are two permissions that can be granted to users: `StartFrameRecording` and `StopFrameRecording`.


---

This page was last updated at 2026-04-17T17:34:03.143Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/recording/frame-recording/](https://getstream.io/video/docs/react-native/recording/frame-recording/).