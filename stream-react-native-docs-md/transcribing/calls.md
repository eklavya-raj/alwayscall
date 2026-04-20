# Transcriptions & Captions

Stream supports transcriptions and live closed captions for audio and video calls. Both can be configured to run automatically or can be started and stopped with API calls. Closed captions are delivered to clients with WebSocket events, and transcriptions are uploaded after the call has ended or the process is stopped. If transcription is enabled automatically, the transcription process will start when the first user joins the call, and stop when all participants have left the call.

## Quick Start

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// start transcription with language
await call.startTranscription({ language: "en" });

// start closed captions with language
await call.startClosedCaptions({ language: "en" });

// stop transcription
await call.stopTranscription();

// stop closed captions
await call.stopClosedCaptions();

// you can also start or stop with a single API call
await call.startTranscription({ enable_closed_captions: true });
await call.stopTranscription({ stop_closed_captions: true });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# starts transcription
call.start_transcription(language="en")

# starts closed captions
call.start_closed_captions(language="en")

# stops the transcription for the call
call.stop_transcription()

# stops the transcriptions for the call
call.stop_closed_captions()

# you can also start or stop with a single API call
call.start_transcription(enable_closed_captions=True)
call.stop_transcription(stop_closed_captions=True)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// start transcription with language
call.StartTranscription(ctx, &getstream.StartTranscriptionRequest{
    Language: getstream.PtrTo("en"),
})

// start closed captions with language
call.StartClosedCaptions(ctx, &getstream.StartClosedCaptionsRequest{
    Language: getstream.PtrTo("en"),
})

// stop transcription
call.StopTranscription(ctx, &getstream.StopTranscriptionRequest{})

// stop closed captions
call.StopClosedCaptions(ctx, &getstream.StopClosedCaptionsRequest{})

// you can also start or stop with a single API call
call.StartTranscription(ctx, &getstream.StartTranscriptionRequest{
    EnableClosedCaptions: getstream.PtrTo(true),
})
call.StopTranscription(ctx, &getstream.StopTranscriptionRequest{
    StopClosedCaptions: getstream.PtrTo(true),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}/start_transcription?api_key=${API_KEY}"\
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"

curl -X POST "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}/stop_transcription?api_key=${API_KEY}"\
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

By default, transcriptions are stored in Stream’s S3 bucket and retained for two weeks. You can also configure your application to store transcriptions on your own external storage, see the [Storage section](/video/docs/api/transcribing/storage/) for more detail.

**Note:** While transcription occurs continuously during the call, and chunks of conversations are saved continuously, the complete transcription file is uploaded only once at the end of the call. This approach is used to avoid requiring additional permissions (such as delete permissions) when using external storage.

## Transcription language

For best speech-to-text performance, it is recommended that you specify the language you are using. By default, the language is set to English (`en`) for all call types.

Alternatively, you can use automatic language detection, which is easier to set up but has some drawbacks:

- Speech-to-text accuracy is lower
- Closed caption events will have an additional latency

There are three ways to set the transcription language:

1. call type level: this is the default language for all calls of the same type
2. call level: when provided, it overrides the language set for its call type
3. when starting closed captions or transcriptions using the API

**Note**: If you change the language for an active call, we will propagate the new language to the already running transcription/closed-caption process.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// 1. set the language for all calls of the default type to "fr"
await client.video.updateCallType("default", {
  settings: {
    transcription: {
      language: "fr",
    },
  },
});

// 2. create a call and set its language to "fr"
await call.getOrCreate({
  settings_override: {
    transcription: {
      language: "fr",
    },
  },
});

// 3. update an existing call and set its language to "fr"
await call.update({
  settings_override: {
    transcription: {
      language: "fr",
    },
  },
});

// 4. start transcription and set language to "fr"
await call.startTranscription({ language: "fr" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# 1. set the language for all calls of the default type to "fr"
client.video.update_call_type(call.call_type, settings=CallSettingsRequest(
    transcription=TranscriptionSettingsRequest(
        mode="auto-on",
        closed_caption_mode="auto-on",
        language="fr"
    ),
))

# 2. create a call and set its language to "fr"
call.get_or_create(
    data=CallRequest(
        created_by_id="user-id",
        settings_override=CallSettingsRequest(
            transcription=TranscriptionSettingsRequest(
                mode="auto-on",
                closed_caption_mode="auto-on",
                language="fr"
            ),
        ),
    )
)

# 3. update an existing call and set its
call.update(
    settings_override=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            mode="auto-on",
            closed_caption_mode="auto-on",
            language="it"
        ),
    )
)

# 4. start transcription and set language to "fr"
call.start_transcription(language="fr")
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
//set the language for all calls of the default type to "fr"
client.Video().UpdateCallType(ctx, "default", &getstream.UpdateCallTypeRequest{
    Settings: &getstream.CallSettingsRequest{
        Transcription: &getstream.TranscriptionSettingsRequest{
            Language: getstream.PtrTo("fr"),
        },
    },
})

// create a call and set its language to "fr"
call.GetOrCreate(ctx, &getstream.CallRequest{
    SettingsOverride: &getstream.CallSettingsRequest{
        Transcription: &getstream.TranscriptionSettingsRequest{
            Language: getstream.PtrTo("fr"),
        },
    },
})

// update an existing call and set its language to "fr"
call.Update(ctx, &getstream.UpdateCallRequest{
    SettingsOverride: &getstream.CallSettingsRequest{
        Transcription: &getstream.TranscriptionSettingsRequest{
            Language: getstream.PtrTo("fr"),
        },
    },
})

// start transcription and set language to "fr"
call.StartTranscription(ctx, &getstream.StartTranscriptionRequest{
    Language: getstream.PtrTo("fr"),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# TODO
```

</tabs-item>

</tabs>

## Closed captions: Speech segment settings

These settings control how live captions are segmented into on-screen chunks.

- max_speech_caption_ms (default 9000, range 5000–10000): Maximum duration of a single caption segment during continuous speech.
- silence_duration_ms (default 700, range 300–2000): Minimum silence to finalize the current caption and start a new one.

### Why use it

- To keep captions smaller on mobile, use shorter values. Example: max_speech_caption_ms=5000, silence_duration_ms=500–800.

### How it works

- A caption finalizes when detected silence exceeds silence_duration_ms, or when continuous speech reaches max_speech_caption_ms.

### Configuration

- Configure per call type (default for all calls of that type) or per call (override) under transcription settings.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Per call type (default)
await client.video.updateCallType("default", {
  settings: {
    transcription: {
      speech_segment_config: {
        max_speech_caption_ms: 9000,
        silence_duration_ms: 700,
      },
    },
  },
});

// Per call (override)
await call.update({
  settings_override: {
    transcription: {
      speech_segment_config: {
        max_speech_caption_ms: 5000,
        silence_duration_ms: 600,
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from stream.video.models import CallSettingsRequest, TranscriptionSettingsRequest

# Per call type (default)
client.video.update_call_type(
    "default",
    settings=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            speech_segment_config=SpeechSegmentConfig(
                max_speech_caption_ms=9000,
                silence_duration_ms=700,
            ),
        ),
    ),
)

# Per call (override)
call.update(
    settings_override=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            speech_segment_config=SpeechSegmentConfig(
                max_speech_caption_ms=5000,
                silence_duration_ms=600,
            ),
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Per call type (default)
_, err := client.Video().UpdateCallType(ctx, "default", &getstream.UpdateCallTypeRequest{
    Settings: &getstream.CallSettingsRequest{
        Transcription: &getstream.TranscriptionSettingsRequest{
            SpeechSegmentConfig: &getstream.SpeechSegmentConfig{
                MaxSpeechCaptionMs: getstream.PtrTo(int32(9000)),
                SilenceDurationMs:  getstream.PtrTo(int32(700)),
            },
        },
    },
})
if err != nil {
    // handle error
}

// Per call (override)
_, err = call.Update(ctx, &getstream.UpdateCallRequest{
    SettingsOverride: &getstream.CallSettingsRequest{
        Transcription: &getstream.TranscriptionSettingsRequest{
            SpeechSegmentConfig: &getstream.SpeechSegmentConfig{
                MaxSpeechCaptionMs: getstream.PtrTo(int32(5000)),
                SilenceDurationMs:  getstream.PtrTo(int32(600)),
            },
        },
    },
})
if err != nil {
    // handle error
}
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Per call (override)
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
    "transcription": {
      "speech_segment_config": {
        "max_speech_caption_ms": 5000,
        "silence_duration_ms": 600
      }
    }
  }
}'

# Per call type (default)
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings": {
    "transcription": {
      "speech_segment_config": {
        "max_speech_caption_ms": 9000,
        "silence_duration_ms": 700
      }
    }
  }
}'
```

</tabs-item>

</tabs>

## List call transcriptions

> **Note:** transcriptions stored on Stream’s S3 bucket (the default) will be returned with a signed URL.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.listTranscriptions();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.list_transcriptions()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.ListTranscriptions(ctx, &getstream.ListTranscriptionsRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}/transcriptions?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Delete call transcription

This endpoint allows to delete call transcription. Please note that transcriptions will be deleted only if they are stored on Stream side (default).

An error will be returned if the transcription doesn't exist.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.deleteTranscription({ session: "<session ID>", filename: "<filename>" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.delete_transcription(sessionID, filename)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.DeleteTranscription(ctx, sessionID, filename, &getstream.DeleteTranscriptionRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X DELETE "https://video.stream-io-api.com/video/call/${CALL_TYPE}/${CALL_ID}/${SESSION_ID}/transcriptions/${FILENAME}?api_key=${API_KEY}" \
     -H "Authorization: ${JWT_TOKEN}" \
     -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Events

These events are sent to users connected to the call and your webhook/SQS:

- [call.transcription_started](/video/docs/api/webhooks/events/#CallTranscriptionStartedEvent) sent when the transcription of the call has started
- [call.transcription_stopped](/video/docs/api/webhooks/events/#CallClosedCaptionsStoppedEvent) this event is sent only when the transcription is explicitly stopped through an API call, not in cases where the transcription process encounters an error.
- [call.transcription_ready](/video/docs/api/webhooks/events/#CallTranscriptionReadyEvent) dispatched when the transcription is completed and available for download. An example payload of this event is detailed below.
- [call.transcription_failed](/video/docs/api/webhooks/events/#CallTranscriptionFailedEvent) sent if the transcription process encounters any issue
- [call.closed_captions_started](/video/docs/api/webhooks/events/#CallClosedCaptionsStartedEvent) sent when captioning has started
- [call.closed_caption](/video/docs/api/webhooks/events/#ClosedCaptionEvent) an event containing transcribed speech from a participant
- [call.closed_captions_stopped](/video/docs/api/webhooks/events/#CallClosedCaptionsStoppedEvent) sent when captioning is stopped
- [call.closed_captions_failed](/video/docs/api/webhooks/events/#CallClosedCaptionsFailedEvent) sent when the captioning process encounters any issue

## Transcription JSONL file format

The transcription file is a JSONL, where each line is a JSON object containing a speech fragment, and each speech fragment contains timing and user information. It is trivial to convert this JSONL format to other simpler formats such as SRT.

```json
{"type":"speech", "start_time": "2024-02-28T08:18:18.061031795Z", "stop_time":"2024-02-28T08:18:22.401031795Z", "speaker_id": "Sacha_Arbonel", "text": "hello"}
{"type":"speech", "start_time": "2024-02-28T08:18:22.401031795Z", "stop_time":"2024-02-28T08:18:26.741031795Z", "speaker_id": "Sacha_Arbonel", "text": "how are you"}
{"type":"speech", "start_time": "2024-02-28T08:18:26.741031795Z", "stop_time":"2024-02-28T08:18:31.081031795Z", "speaker_id": "Tommaso_Barbugli", "text": "I'm good"}
{"type":"speech", "start_time": "2024-02-28T08:18:31.081031795Z", "stop_time":"2024-02-28T08:18:35.421031795Z", "speaker_id": "Tommaso_Barbugli", "text": "how about you"}
{"type":"speech", "start_time": "2024-02-28T08:18:35.421031795Z", "stop_time":"2024-02-28T08:18:39.761031795Z", "speaker_id": "Sacha_Arbonel", "text": "I'm good too"}
{"type":"speech", "start_time": "2024-02-28T08:18:39.761031795Z", "stop_time":"2024-02-28T08:18:44.101031795Z", "speaker_id": "Tommaso_Barbugli", "text": "that's great"}
{"type":"speech", "start_time": "2024-02-28T08:18:44.101031795Z", "stop_time":"2024-02-28T08:18:48.441031795Z", "speaker_id": "Tommaso_Barbugli", "text": "I'm glad to hear that"}
```

## User Permissions

The following permissions are available to grant/restrict access to this functionality when used client-side.

- `StartTranscription` required to start the transcription
- `StopTranscription` required to stop the transcription
- `ListTranscriptions` required to retrieve the list of transcriptions
- `StartClosedCaptions` required to start closed captions
- `StopClosedCaptions` required to stop closed captions

## Enabling, disabling, automatically start

Transcriptions and closed captions can be configured from the Dashboard (see the call type settings) or directly via the API. It is also possible to change the transcription settings for a call and override the default settings that come from its call type.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Disable on call level
call.update({
  settings_override: {
    transcription: {
      mode: "disabled",
      closed_caption_mode: "disabled",
    },
  },
});

// Disable on call type level
client.video.updateCallType({
  name: "<call type name>",
  settings: {
    transcription: {
      language: "en",
      mode: "disabled",
      closed_caption_mode: "disabled",
    },
  },
});

// Enable
call.update({
  settings_override: {
    transcription: {
      language: "en",
      mode: "available",
      closed_caption_mode: "available",
    },
  },
});

// Other settings
call.update({
  settings_override: {
    transcription: {
      language: "en",
      quality: "auto-on",
      closed_caption_mode: "auto-on",
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# Disable on call level
call.update(
    settings_override=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            mode="disabled",
            closed_caption_mode="disabled",
            language="en",
        ),
    ),
)

# Disable on call type level
call_type_name = "default"
client.video.update_call_type(call_type_name,
    settings=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            mode="disabled",
            closed_caption_mode="disabled",
            language="en",
        ),
    ),
)

# Automatically transcribe calls
client.video.update_call_type(
    settings=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            mode="disabled",
            closed_caption_mode="disabled",
            language="en",
        ),
    ),
)

# Enable
client.update(
    settings_override=CallSettingsRequest(
        transcription=TranscriptionSettingsRequest(
            mode="available",
            closed_caption_mode="available",
            language="en",
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Disable on call level
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Transcription: &getstream.TranscriptionSettingsRequest{
      Mode: "disabled",
    },
  },
})

// Disable on call type level
call_type_name := "default"

// Disable transcription
_, err := client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Transcription: &getstream.TranscriptionSettingsRequest{
      Mode: "disabled",
    },
  },
})

// Automatically transcribe calls
_, err = client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Transcription: &getstream.TranscriptionSettingsRequest{
      Mode: "auto-on",
    },
  },
})

// Enable transcription (available)
call := client.Video().Call("call_type", "call_id")
_, err = call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Transcription: &getstream.TranscriptionSettingsRequest{
      Mode: "available",
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Disable on call level
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
      "transcription": {
        "mode": "disabled"
      }
    }
  }'

# Disable on call type level
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "transcription": {
        "mode": "disabled"
      }
    }
  }'

# Enable on call level
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
      "transcription": {
        "mode": "available"
      }
    }
  }'

# Other settings
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE_NAME}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
      "transcription": {
        "mode": "available",
        "audio_only": false,
        "quality": "auto_on"
      }
    }
  }'
```

By default the transcriptions are stored on Stream’s S3 bucket and retained for 2-weeks. You can also configure your application to have transcriptions stored on your own external storage, see the storage section of tis document for more detail.

</tabs-item>

</tabs>

## Supported languages

- English (en) - default
- French (fr)
- Spanish (es)
- German (de)
- Italian (it)
- Dutch (nl)
- Portuguese (pt)
- Polish (pl)
- Catalan (ca)
- Czech (cs)
- Danish (da)
- Greek (el)
- Finnish (fi)
- Indonesian (id)
- Japanese (ja)
- Russian (ru)
- Swedish (sv)
- Tamil (ta)
- Thai (th)
- Turkish (tr)
- Hungarian (hu)
- Romanian (to)
- Chinese (zh)
- Arabic (ar)
- Tagalog (tl)
- Hebrew (he)
- Hindi (hi)
- Croatian (hr)
- Korean (ko)
- Malay (ms)
- Norwegian (no)
- Ukrainian (uk)


---

This page was last updated at 2026-04-17T17:34:03.144Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/transcribing/calls/](https://getstream.io/video/docs/react-native/transcribing/calls/).