# Backstage

## Introduction

By default, livestreams are created in backstage mode, while in backstage mode, streams can only be accessed by admin-like users.
This is necessary because it makes it possible to create the setup in advance and to notify and grant access to viewers when the event starts.
To allow regular users to join a call ahead of time, even if the call is still in backstage mode you can create the call and set the join ahead time backstage setting.
The default value of `join_ahead_time_seconds` is 0, which means that users can only join the call when the call starts.

## Configuration

To create a call in backstage mode and allow users to join ahead of the scheduled time you can use the join_ahead_time_seconds settings option.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
startsAt = new Date(Date.now() + 30 * 60 * 1000);
client.video.call("livestream", "test-outgoing-call").getOrCreate({
  data: {
    starts_at: startsAt,
    created_by_id: "john",
    settings_override: {
      backstage: {
        enabled: true,
        join_ahead_time_seconds: 300,
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# create a call with backstage enabled, starts_at set
# and join_ahead_of_time_seconds set to 5 minutes
from datetime import datetime, timedelta, timezone
starts_at = datetime.now(timezone.utc) + timedelta(minutes=30)

call = client.video.call("livestream", uuid.uuid4())
response = call.get_or_create(
    data=CallRequest(
        starts_at=starts_at,
        created_by_id=user_id,
        settings_override=CallSettingsRequest(
            backstage=BackstageSettingsRequest(
                enabled=True,
                join_ahead_time_seconds=300,
            ),
        ),
    )
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// create a call with backstage enabled, starts_at set
// and join_ahead_of_time_seconds set to 5 minutes
starts_at := time.Now().Add(30 * time.Minute)

call := client.Video().Call("livestream", uuid.New().String())
response, err := call.GetOrCreate(ctx, &getstream.GetOrCreateCallRequest{
  Data: &getstream.CallRequest{
    StartsAt:    &getstream.Timestamp{Time: starts_at},
    CreatedByID: getstream.PtrTo("john"),
    SettingsOverride: &getstream.CallSettingsRequest{
      Backstage: &getstream.BackstageSettingsRequest{
        Enabled:              getstream.PtrTo(true),
        JoinAheadTimeSeconds: getstream.PtrTo(300),
      },
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# create a call with backstage mode and join ahead time settings
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "starts_at": "2022-01-01T00:00:00Z",
      "created_by_id": "john",
      "settings_override": {
        "backstage": {
            "enabled": true,
            "join_ahead_time_seconds": 300
          }
         },
      }
    }'
```

</tabs-item>

</tabs>

You can change the backstage mode and join ahead time settings on the call type or on the call level. Allowing the users to join a call in backstage is optional.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// call level
call.update({
  settings_override: {
    backstage: {
      enabled: true,
      join_ahead_time_seconds: 300,
    },
  },
});

// or call type level
client.video.updateCallType({
  name: "<call type name>",
  settings: {
    backstage: {
      enabled: true,
      join_ahead_time_seconds: 300,
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# call level update
call.update(
    settings_override=CallSettingsRequest(
        backstage=BackstageSettingsRequest(
            enabled=True,
            join_ahead_time_seconds=300,
        ),
    ),
)

# call type level update
call_type_name = '<call type name>'
client.video.update_call_type(
    settings=CallSettingsRequest(
        backstage=BackstageSettingsRequest(
            enabled=True,
            join_ahead_time_seconds=300,
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// call level update
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Backstage: &getstream.BackstageSettingsRequest{
      Enabled:              getstream.PtrTo(true),
      JoinAheadTimeSeconds: getstream.PtrTo(300),
    },
  },
})

// call type level update
call_type_name := "<call type name>"
client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Backstage: &getstream.BackstageSettingsRequest{
      Enabled:              getstream.PtrTo(true),
      JoinAheadTimeSeconds: getstream.PtrTo(300),
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# call level update
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
      "backstage": {
        "enabled": true,
        "join_ahead_time_seconds": 300
      }
    }
  }'

# call type level update
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "backstage": {
        "enabled": true,
        "join_ahead_time_seconds": 300
      }
    }
  }'
```

</tabs-item>

</tabs>

Setting the backstage mode to `false` means that calls won't be created in backstage mode, and anyone can join the call.

## Backstage Permissions

When a call is in backstage mode, only users with the `join-backstage` capability are allowed to join.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.updateCallType({
  name: "<call type name>",
  grants: {
    host: [OwnCapability.JOIN_BACKSTAGE],
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
callTypeName = '<call type name>'
client.video.update_call_type(
    grants={"host": [OwnCapability.JOIN_BACKSTAGE.to_str()]},
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
callTypeName := "<call type name>"
client.Video().UpdateCallType(ctx, callTypeName, &getstream.UpdateCallTypeRequest{
  Grants: &map[string][]string{
    "host": []string{getstream.JOIN_BACKSTAGE.String()},
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "grants": {
      "host": ["join-backstage"]
    }
  }'
```

</tabs-item>

</tabs>

With this approach you can add multiple members that have the `join-backstage` capability, which allows you to have multiple hosts.
Or, you can bypass this check and allow users to join by creating time with specifying the `join_ahead_time_seconds` backstage option.

## Go Live

When the hosts are ready to start the stream and allow viewers to join, you can call the `GoLive` method.

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


It's also possible to send push notifications to call members on this event, for more information see the [Call Types page](/video/docs/api/call_types/builtin/#push-notifications-settings/).

## Stop Live

When the stream ends the `StopLive` endpoint will remove the viewers that are still in the call, and prevent from new viewers to join.

The stop live endpoint will automatically do the followings unless you specify otherwise:

- Stop HLS broadcast
- Stop recording
- Stop closed captions
- Stop transcriptions

A call can enter and leave backstage mode multiple times.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.stopLive();

call.stopLive({
  // Optionally prevent stoping HLS broadcast
  continue_hls: true,
  // Optionally prevent stoping recording
  continue_recording: true,
  // Optionally prevent stoping closed captions
  continue_closed_caption: true,
  // Optionally prevent stoping call transcription
  continue_transcription: true,
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.stop_live()

call.stop_live(
  # Optionally prevent stoping HLS broadcast
  continue_hls=True,
  # Optionally prevent stoping recording
  continue_recording=True,
  # Optionally prevent stoping closed captions
  continue_closed_caption=True,
  # Optionally prevent stoping call transcription
  continue_transcription=True
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.StopLive(ctx, &getstream.StopLiveRequest{})

call.StopLive(ctx, &getstream.StopLiveRequest{
  // Optionally prevent stoping HLS broadcast
  ContinueHLS: getstream.PtrTo(true),
  // Optionally prevent stoping recording
  ContinueRecording: getstream.PtrTo(true),
  // Optionally prevent stoping closed captions
  ContinueClosedCaption: getstream.PtrTo(true),
  // Optionally prevent stoping call transcription
  ContinueTranscription: getstream.PtrTo(true),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}/stop_live?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}/stop_live?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H " stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
   -d '{
    "continue_hls": true, # Optionally prevent stoping HLS broadcast
    "continue_recording": true, # Optionally prevent stoping recording
    "continue_closed_caption": true, # Optionally prevent stoping closed captions
    "continue_transcription": true # Optionally prevent stoping call transcription
  }'
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:03.129Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/backstage/](https://getstream.io/video/docs/react-native/streaming/backstage/).