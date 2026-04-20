# Recording calls

Calls can be recorded for later use. Calls recording can be started/stopped via API calls or configured to start automatically when the first user joins the call.
Call recording is done by Stream server-side and later stored on AWS S3. There is no charge for storage of recordings. You can also configure your Stream application to have files stored on your own S3 bucket.

By default, calls will be recorded as mp4 video files. You can configure recording to only capture the audio.

> **Note:** by default, recordings contain all tracks mixed in a single file. You can follow the discussion [here](https://github.com/GetStream/protocol/discussions/247) if you are interested in different ways to record calls.

## Start and stop call recording

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// starts recording
call.startRecording();

// stops the recording for the call
call.stopRecording();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# starts recording
call.start_recording()

# stops the recording for the call
call.stop_recording()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// starts recording
call.StartRecording(ctx, &getstream.StartRecordingRequest{})

// stops the recording for the call
call.StopRecording(ctx, &getstream.StopRecordingRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/start_recording?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"

curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/stop_recording?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## List call recording

This endpoint returns the list of recordings for a call. When using Stream S3 as storage (default) all links are signed and expire after 2-weeks.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.listRecordings();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.list_recordings()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.ListRecordings(ctx, &getstream.ListRecordingsRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/recordings?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Delete call recording

This endpoint allows to delete call recording.
Please note that recordings will be deleted only if they are stored on Stream side (default).

An error will be returned if the recording doesn't exist.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.deleteRecording({ session: "<session id>", filename: "<filename>" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.delete_recording(sessionID, filename)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.DeleteRecording(ctx, "session_id", "filename", &getstream.DeleteRecordingRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X DELETE "https://video.stream-io-api.com/video/call/${CALL_TYPE}/${CALL_ID}/${SESSION_ID}/recordings/${FILENAME}?api_key=${API_KEY}" \
     -H "Authorization: ${JWT_TOKEN}" \
     -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Events

These events are sent to users connected to the call and your webhook/SQS:

- `call.recording_started` when the call recording has started
- `call.recording_stopped` when the call recording has stopped
- `call.recording_ready` when the recording is available for download
- `call.recording_failed` when recording fails for any reason

## User Permissions

The following permissions are checked when users interact with the call recording API.

- `StartRecording` required to start the recording
- `StopRecording` required to stop the recording
- `ListRecordings` required to retrieve the list of recordings
- `DeleteRecording` required to delete an existing recording (including its files if stored using Stream S3 storage)

## Enabling / Disabling call recording

Recording can be configured from the Dashboard (see call type screen) or directly via the API. It is also possible to change the recording settings for a call and override the default settings coming from the its call type.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Disable on call level
call.update({
  settings_override: {
    recording: {
      mode: "disabled",
    },
  },
});

// Disable on call type level
client.video.updateCallType({
  name: "<call type name>",
  settings: {
    recording: {
      mode: "disabled",
    },
  },
});

// Automatically record calls
client.video.updateCallType({
  name: "<call type name>",
  settings: {
    recording: {
      mode: "auto-on",
      quality: "720p",
    },
  },
});

// Enable
call.update({
  settings_override: {
    recording: {
      mode: "available",
    },
  },
});

// Other settings
call.update({
  settings_override: {
    recording: {
      mode: "available",
      audio_only: false,
      quality: "1080p",
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import RecordSettingsRequest

# Disable on call level
call.update(
    settings_override=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode='disabled',
        ),
    ),
)

# Disable on call type level
call_type_name = 'default'
client.video.update_call_type(call_type_name,
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode='disabled',
        ),
    ),
)

# Automatically record calls
client.video.update_call_type(call_type_name,
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="auto-on",
            quality="720p",
        ),
    ),
)

# Enable recording feature for a specific call
call.update(
    settings_override=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
        ),
    ),
)

# Other settings
call.update(
    settings_override=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
            quality="1080p",
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
    Recording: &getstream.RecordSettingsRequest{
      Mode: "disabled",
    },
  },
})

// Disable on call type level
call_type_name := "default"
client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
	  Recording: &getstream.RecordSettingsRequest{
      Mode: "disabled",
    },
  },
})

// Automatically record calls
client.Video().UpdateCallType(ctx, call_type_name, &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
	  Recording: &getstream.RecordSettingsRequest{
      Mode:    "auto-on",
      Quality: getstream.PtrTo("720p"),
    },
  },
})

// Enable recording feature for a specific call
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
	  Recording: &getstream.RecordSettingsRequest{
      Mode: "available",
    },
  },
})

// Other settings
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Recording: &getstream.RecordSettingsRequest{
      Mode:    "available",
      Quality: getstream.PtrTo("1080p"),
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Disable on call level
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings_override": {
      "recording": {
        "mode": "disabled"
      }
    }
  }'

# Enable on call level
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings_override": {
      "recording": {
        "mode": "available"
      }
    }
  }'

# Other settings
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
    "recording": {
      "mode": "available",
      "audio_only": false,
      "quality": "1080p"
    }
  }
}'

# Enable/disable on call type level
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "recording": {
        "mode": "disabled"
      }
    }
  }'
```

</tabs-item>

</tabs>

## Audio only recording

You can configure your calls to only record the audio tracks and exclude the video. You can do this from the dashboard (Call Types sections) or set it for individual calls.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Enable
call.update({
  settings_override: {
    recording: {
      mode: "available",
      audio_only: true,
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# Set recording only for audio
call.update(
    settings_override=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode='available',
            audio_only=True
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Set recording only for audio
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Recording: &getstream.RecordSettingsRequest{
      Mode:     "available",
      AudioOnly: getstream.PtrTo(true),
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/default/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
  "settings_override": {
    "recording": {
      "mode": "available",
      "audio_only": true
    }
  }
}'
```

</tabs-item>

</tabs>

## Recording layouts

Recording can be customized in several ways:

- You can pick one of the built-in layouts and pass some options to it
- You can further customize the style of the call by providing your own CSS file
- You can use your own recording application

There are three available layouts you can use for your calls: `"single_participant"`, `"grid"` and `"spotlight"`

### Single Participant

This layout shows only one participant video at a time, other video tracks are hidden.

![Layout Single Participant](@video/api/_assets/layout_single-participant.png)

The visible video is selected based on this priority:

- Participant is pinned
- Participant is screen-sharing
- Participant is the dominant speaker
- Participant has a video track

### Grid

This layout shows a configurable number of tracks in an equally sized grid.

![Layout Grid](@video/api/_assets/layout_grid.png)

### Spotlight

This layout shows a video in a spotlight and the rest of the participants in a separate list or grid.

![Layout Spotlight](@video/api/_assets/layout_spotlight.png)

## Layout options

Each layout has a number of options that you can configure. Here is an example:

![Layout Custom Options](@video/api/_assets/layout_custom_options.png)

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const layoutOptions = {
  "logo.image_url":
    "https://theme.zdassets.com/theme_assets/9442057/efc3820e436f9150bc8cf34267fff4df052a1f9c.png",
  "logo.horizontal_position": "center",
  "title.text": "Building Stream Video Q&A",
  "title.horizontal_position": "center",
  "title.color": "black",
  "participant_label.border_radius": "0px",
  "participant.border_radius": "0px",
  "layout.spotlight.participants_bar_position": "top",
  "layout.background_color": "#f2f2f2",
  "participant.placeholder_background_color": "#1f1f1f",
  "layout.single-participant.padding_inline": "20%",
  "participant_label.background_color": "transparent",
};

client.video.updateCallType({
  name: callTypeName,
  settings: {
    recording: {
      mode: "available",
      audio_only: false,
      quality: "1080p",
      layout: {
        name: "spotlight",
        options: layoutOptions,
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest, LayoutSettingsRequest, RecordSettingsRequest

layout_options = {
    "logo.image_url": "https://theme.zdassets.com/theme_assets/9442057/efc3820e436f9150bc8cf34267fff4df052a1f9c.png",
    "logo.horizontal_position": "center",
    "title.text": "Building Stream Video Q&A",
    "title.horizontal_position": "center",
    "title.color": "black",
    "participant_label.border_radius": "0px",
    "participant.border_radius": "0px",
    "layout.spotlight.participants_bar_position": "top",
    "layout.background_color": "#f2f2f2",
    "participant.placeholder_background_color": "#1f1f1f",
    "layout.single-participant.padding_inline": "20%",
    "participant_label.background_color": "transparent",
}

client.video.update_call_type(
    "default",
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
            audio_only=False,
            quality="1080p",
            layout=LayoutSettingsRequest(
                name="spotlight",
                options=layout_options,
            ),
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
layoutOptions := map[string]any{
  "logo.image_url":                             "https://theme.zdassets.com/theme_assets/9442057/efc3820e436f9150bc8cf34267fff4df052a1f9c.png",
  "logo.horizontal_position":                   "center",
  "title.text":                                 "Building Stream Video Q&A",
  "title.horizontal_position":                  "center",
  "title.color":                                "black",
  "participant_label.border_radius":            "0px",
  "participant.border_radius":                  "0px",
  "layout.spotlight.participants_bar_position": "top",
  "layout.background_color":                    "#f2f2f2",
  "participant.placeholder_background_color":   "#1f1f1f",
  "layout.single-participant.padding_inline":   "20%",
  "participant_label.background_color":         "transparent",
}

client.Video().UpdateCallType(ctx, "callTypeName", &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Recording: &getstream.RecordSettingsRequest{
      Mode:      "available",
      AudioOnly: getstream.PtrTo(false),
      Quality:   getstream.PtrTo("1080p"),
      Layout: &getstream.LayoutSettingsRequest{
        Name:    "spotlight",
        Options: &layoutOptions,
      },
    },
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
    "settings": {
      "recording": {
        "mode": "available",
        "audio_only": false,
        "quality": "1080p",
        "layout": {
          "name": "spotlight",
          "options": {
            "logo.image_url": "https://theme.zdassets.com/theme_assets/9442057/efc3820e436f9150bc8cf34267fff4df052a1f9c.png",
            "logo.horizontal_position": "center",
            "title.text": "Building Stream Video Q&A",
            "title.horizontal_position": "center",
            "title.color": "black",
            "participant_label.border_radius": "0px",
            "participant.border_radius": "0px",
            "layout.spotlight.participants_bar_position": "top",
            "layout.background_color": "#f2f2f2",
            "participant.placeholder_background_color": "#1f1f1f",
            "layout.single-participant.padding_inline": "20%",
            "participant_label.background_color": "transparent"
          }
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

Here you can find the complete list of options available to each layout.

### Single Participant

| Option                                   | Type    | Default     | Allowed Values                        | Description                                                                                                                                                                                          |
| ---------------------------------------- | ------- | ----------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| video.background_color                   | color   | `#000000`   |                                       | The background color                                                                                                                                                                                 |
| video.screenshare_scale_mode             | string  | `fit`       | `[fit fill]`                          | How source video is displayed inside a box when aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| participant.label_horizontal_position    | string  | `left`      | `[center left right]`                 | horizontal position for the participant label                                                                                                                                                        |
| participant.video_border_radius          | number  | `1.2`       |                                       | The corner radius used for the participant video border                                                                                                                                              |
| logo.horizontal_position                 | string  | `center`    | `[center left right]`                 | horizontal position of the logo                                                                                                                                                                      |
| participant.label_display                | boolean | `true`      |                                       | Show the participant label                                                                                                                                                                           |
| participant.label_text_color             | color   | `#000000`   |                                       | Text color of the participant label                                                                                                                                                                  |
| participant.label_background_color       | color   | `#00000000` |                                       | Background color of the participant label                                                                                                                                                            |
| participant.label_border_radius          | number  | `1.2`       |                                       | The corner radius used for the label border                                                                                                                                                          |
| logo.vertical_position                   | string  | `top`       | `[top bottom center]`                 | vertical position of the logo                                                                                                                                                                        |
| participant.label_display_border         | boolean | `true`      |                                       | Render label border                                                                                                                                                                                  |
| participant.label_vertical_position      | string  | `bottom`    | `[top bottom center]`                 | vertical position for the participant label                                                                                                                                                          |
| participant.video_highlight_border_color | color   | `#7CFC00`   |                                       | The color used for highlighted participants video border                                                                                                                                             |
| participant.video_border_rounded         | boolean | `true`      |                                       | Render the participant video border rounded                                                                                                                                                          |
| participant.video_border_width           | boolean | `true`      |                                       | The stroke width used to render a participant border                                                                                                                                                 |
| participant.placeholder_background_color | color   | `#000000`   |                                       | Sets the background color for video placeholder tile                                                                                                                                                 |
| video.scale_mode                         | string  | `fill`      | `[fit fill]`                          | How source video is displayed inside a box when aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| layout.forceMirrorParticipants           | boolean |             |                                       | Forces participant camera videos to be mirrored or unmirrored. When omitted, the default mirroring behavior applies.                                                                                 |
| logo.image_url                           | string  |             |                                       | add a logo image to the video layout                                                                                                                                                                 |
| participant.label_border_color           | color   | `#CCCCCC`   |                                       | Label border color                                                                                                                                                                                   |
| participant.label_border_rounded         | boolean | `true`      |                                       | Render the label border rounded                                                                                                                                                                      |
| participant.video_border_color           | color   | `#CCCCCC`   |                                       | The color used for the participant video border                                                                                                                                                      |
| participant.aspect_ratio                 | string  |             | `"9/16", "4/3", "1/1", ...`           | The aspect ratio of the participant                                                                                                                                                                  |
| custom_actions                           | array   |             | See [Custom actions](#custom-actions) | Optional array of custom actions that should be executed when pre-defined condition is met                                                                                                           |
| presenter_visible                        | boolean | `true`      | `true` or `false`                     | Enables or disables presenter's camera video in the recording during screen sharing.                                                                                                                 |

### Spotlight

| Option                                   | Type    | Default     | Allowed Values                                        | Description                                                                                                                                                                                          |
| ---------------------------------------- | ------- | ----------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| participant.video_border_width           | boolean | `true`      |                                                       | The stroke width used to render a participant border                                                                                                                                                 |
| grid.position                            | string  | `bottom`    | `[top bottom left right]`                             | position of the grid in relation to the spotlight                                                                                                                                                    |
| participant.label_display_border         | boolean | `true`      |                                                       | Render label border                                                                                                                                                                                  |
| participant.label_horizontal_position    | string  | `left`      | `[center left right]`                                 | horizontal position for the participant label                                                                                                                                                        |
| participant.video_border_color           | color   | `#CCCCCC`   |                                                       | The color used for the participant video border                                                                                                                                                      |
| grid.columns                             | number  | `5`         |                                                       | how many column to use in grid mode                                                                                                                                                                  |
| video.background_color                   | color   | `#000000`   |                                                       | The background color                                                                                                                                                                                 |
| logo.horizontal_position                 | string  | `center`    | `[center left right]`                                 | horizontal position of the logo                                                                                                                                                                      |
| participant.label_border_color           | color   | `#CCCCCC`   |                                                       | Label border color                                                                                                                                                                                   |
| participant.label_background_color       | color   | `#00000000` |                                                       | Background color of the participant label                                                                                                                                                            |
| grid.cell_padding                        | size    | `10`        |                                                       | padding between cells                                                                                                                                                                                |
| screenshare_layout                       | string  | `spotlight` | `[grid spotlight single-participant]`                 | The layout to use when entering screenshare mode                                                                                                                                                     |
| grid.size_percentage                     | number  | `20`        |                                                       | The percentage of the screen the grid should take up                                                                                                                                                 |
| participant.label_border_radius          | number  | `1.2`       |                                                       | The corner radius used for the label border                                                                                                                                                          |
| participant.video_highlight_border_color | color   | `#7CFC00`   |                                                       | The color used for highlighted participants video border                                                                                                                                             |
| participant.placeholder_background_color | color   | `#000000`   |                                                       | Sets the background color for video placeholder tile                                                                                                                                                 |
| participant.video_border_radius          | number  | `1.2`       |                                                       | The corner radius used for the participant video border                                                                                                                                              |
| participant.label_display                | boolean | `true`      |                                                       | Show the participant label                                                                                                                                                                           |
| participant.label_border_rounded         | boolean | `true`      |                                                       | Render the label border rounded                                                                                                                                                                      |
| participant.video_border_rounded         | boolean | `true`      |                                                       | Render the participant video border rounded                                                                                                                                                          |
| grid.rows                                | number  | `1`         |                                                       | how many rows to use in grid mode                                                                                                                                                                    |
| grid.margin                              | size    | `10`        |                                                       | the margin between grid and spotlight                                                                                                                                                                |
| video.scale_mode                         | string  | `fill`      | `[fit fill]`                                          | How source video is displayed inside a box when aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| logo.image_url                           | string  |             |                                                       | add a logo image to the video layout                                                                                                                                                                 |
| logo.vertical_position                   | string  | `top`       | `[top bottom center]`                                 | vertical position of the logo                                                                                                                                                                        |
| video.screenshare_scale_mode             | string  | `fit`       | `[fit fill]`                                          | How source video is displayed inside a box when aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| participant.label_text_color             | color   | `#000000`   |                                                       | Text color of the participant label                                                                                                                                                                  |
| participant.label_vertical_position      | string  | `bottom`    | `[top bottom center]`                                 | vertical position for the participant label                                                                                                                                                          |
| participant.aspect_ratio                 | string  |             | `"9/16", "4/3", "1/1", ...`                           | The aspect ratio of the participant                                                                                                                                                                  |
| layout.forceMirrorParticipants           | boolean |             |                                                       | Forces participant camera videos to be mirrored or unmirrored. When omitted, the default mirroring behavior applies.                                                                                 |
| participant.filter                       | object  |             | See [Filtering participants](#filtering-participants) | Optional filter object to determine which participants should be displayed                                                                                                                           |
| custom_actions                           | array   |             | See [Custom actions](#custom-actions)                 | Optional array of custom actions that should be executed when pre-defined condition is met                                                                                                           |

### Grid

| Option                                   | Type    | Default     | Allowed Values                                        | Description                                                                                                                                                                                              |
| ---------------------------------------- | ------- | ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| logo.image_url                           | string  | ``          |                                                       | add a logo image to the video layout                                                                                                                                                                     |
| logo.vertical_position                   | string  | `top`       | `[top bottom center]`                                 | vertical position of the logo                                                                                                                                                                            |
| participant.label_horizontal_position    | string  | `left`      | `[center left right]`                                 | horizontal position for the participant label                                                                                                                                                            |
| participant.placeholder_background_color | color   | `#000000`   |                                                       | Sets the background color for video placeholder tile                                                                                                                                                     |
| video.scale_mode                         | string  | `fill`      | `[fit fill]`                                          | How source video is displayed inside a box when the aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| logo.horizontal_position                 | string  | `center`    | `[center left right]`                                 | horizontal position of the logo                                                                                                                                                                          |
| participant.video_border_rounded         | boolean | `true`      |                                                       | Render the participant video border rounded                                                                                                                                                              |
| participant.label_display_border         | boolean | `true`      |                                                       | Render label border                                                                                                                                                                                      |
| participant.label_border_color           | color   | `#CCCCCC`   |                                                       | Label border color                                                                                                                                                                                       |
| grid.cell_padding                        | size    | `10`        |                                                       | padding between cells                                                                                                                                                                                    |
| video.screenshare_scale_mode             | string  | `fit`       | `[fit fill]`                                          | How source video is displayed inside a box when the aspect ratio does not match. 'fill' crops the video to fill the entire box, 'fit' ensures the video fits inside the box by padding necessary padding |
| video.background_color                   | color   | `#000000`   |                                                       | The background color                                                                                                                                                                                     |
| participant.label_border_radius          | number  | `1.2`       |                                                       | The corner radius used for the label border                                                                                                                                                              |
| grid.size_percentage                     | number  | `90`        |                                                       | The percentage of the screen the grid should take up                                                                                                                                                     |
| grid.margin                              | size    | `10`        |                                                       | the margin between grid and spotlight                                                                                                                                                                    |
| grid.columns                             | number  | `5`         |                                                       | how many column to use in grid mode                                                                                                                                                                      |
| participant.label_vertical_position      | string  | `bottom`    | `[top bottom center]`                                 | vertical position for the participant label                                                                                                                                                              |
| participant.label_display                | boolean | `true`      |                                                       | Show the participant label                                                                                                                                                                               |
| participant.video_border_color           | color   | `#CCCCCC`   |                                                       | The color used for the participant video border                                                                                                                                                          |
| participant.video_border_width           | boolean | `true`      |                                                       | The stroke width used to render a participant border                                                                                                                                                     |
| screenshare_layout                       | string  | `spotlight` | `[grid spotlight single-participant]`                 | The layout to use when entering screen share mode                                                                                                                                                        |
| participant.label_text_color             | color   | `#000000`   |                                                       | Text color of the participant label                                                                                                                                                                      |
| participant.label_background_color       | color   | `#00000000` |                                                       | Background color of the participant label                                                                                                                                                                |
| participant.label_border_rounded         | boolean | `true`      |                                                       | Render the label border rounded                                                                                                                                                                          |
| participant.video_border_radius          | number  | `1.2`       |                                                       | The corner radius used for the participant video border                                                                                                                                                  |
| participant.video_highlight_border_color | color   | `#7CFC00`   |                                                       | The color used for highlighted participants video border                                                                                                                                                 |
| grid.rows                                | number  | `4`         |                                                       | how many rows to use in grid mode                                                                                                                                                                        |
| participant.aspect_ratio                 | string  |             | `"9/16", "4/3", "1/1", ...`                           | The aspect ratio of the participant                                                                                                                                                                      |
| participant.filter                       | object  |             | See [Filtering participants](#filtering-participants) | Optional filter object to determine which participants should be displayed in the grid                                                                                                                   |
| custom_actions                           | array   |             | See [Custom actions](#custom-actions)                 | Optional array of custom actions that should be executed when pre-defined condition is met                                                                                                               |

## Recording resolution and portrait mode

Calls can be recorded in different resolutions and modes (landscape and portrait). On the dashboard, you can configure the default settings for all calls of a specific call type.

![Recording Resolution And Orientation](@video/api/_assets/recording-resolution-and-orientation.png)

While this can be configured from the dashboard, you can also set it for individual calls:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.updateCallType({
  name: callTypeName,
  settings: {
    recording: {
      mode: "available",
      quality: "portrait-1080x1920",
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest, RecordSettingsRequest

client.video.update_call_type(
    "default",
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
            quality="portrait-1080x1920",
        ),
    ),
)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "recording": {
        "mode": "available",
        "quality": "portrait-1080x1920"
      }
    }
  }'
```

</tabs-item>

</tabs>

## Filtering participants

The `participant.filter` option allows you to choose which participants are visible in the recording.
Its value is a special filter object.

The following properties are allowed to be used in the filter object:

| Property            | Type     | Description                                                                                                           |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `userId`            | string   | Participant's user id                                                                                                 |
| `isSpeaking`        | boolean  | Indicates wheather the participant is currently speaking                                                              |
| `isDominantSpeaker` | boolean  | Indicates wheather the participant is a dominant speaker (only one participant can be a dominant speaker at the time) |
| `name`              | string   | Participant's user name                                                                                               |
| `roles`             | string[] | List of participant's roles in the current call                                                                       |
| `isPinned`          | boolean  | Indicates wheather the participant is pinned                                                                          |
| `hasVideo`          | boolean  | Indicates whether the participant has video                                                                           |
| `hasAudio`          | boolean  | Indicates whether the participant has audio                                                                           |
| `hasScreenShare`    | boolean  | Indicates whether the participant has screen share video                                                              |

For example, to include only pinned participants in the recording, you can provide the following filter:

```json
{
  "participant.filter": {
    "isPinned": true
  }
}
```

If you want to filter participants based on their role, keep in mind that a participant can have more than one role within a call.
Because the `roles` property is an array, you must use the `$contains` operator to build your filter. For example, this filter
will only match participants with the role `"admin"`:

```json
{
  "participant.filter": {
    "roles": { "$contains": "admin" }
  }
}
```

When recording livestreams, including only participants with video is an easy way to exclude viewers from the recording:

```json
{
  "participant.filter": {
    "hasVideo": true
  }
}
```

Other operators you can use are `$neq` ("not equal to") and `$in` ("equal to one of the listed values"). For example, this filter
will only match participants with one of the three names:

```json
{
  "participant.filter": {
    "name": { "$in": ["Moe", "Larry", "Curly"] }
  }
}
```

You can also use the `$eq` ("equals") operator, but its effect is the same as not using any operator at all, as in the first example.

You can combine multiple conditions using the `$and`, `$or`, and `$not` operators:

```json
// Hide participants with the role "guest", unless they have been pinned:
{
  "participant.filter": {
    "$or": [
      { "$not": { "roles": { "$contains": "guest" } } },
      { "isPinned": true }
    ]
  }
}

// Show participants that either have video or screen share
{
  "participant.filter": {
    "$or": [
      { "hasVideo": true },
      { "hasScreenShare": true }
    ]
  }
}
```

## Custom actions

Custom actions let you dynamically adjust the recording setup during the runtime based on the conditions you define under `options.custom_actions` configuration option. The function that evaluates the conditions is the same as in [Filtering participants](#filtering-participants) (`participant.filter` option) and allows using the same operators.

### Available actions

#### layout_override

Override the current layout when a condition matches. The first matching `layout_override` action wins (checked top-to-bottom).

| Property           | Type              | Allowed Values                        | Description                                                                                                 |
| ------------------ | ----------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| action_type        | `layout_override` |                                       |                                                                                                             |
| layout             | string            | `[grid spotlight single-participant]` | One of the supported layouts                                                                                |
| ignore_screenshare | boolean           |                                       | When `true`, keeps the override even during screen sharing; otherwise `screenshare_layout` takes precedence |
| condition          | object            |                                       |                                                                                                             |

#### options_override

Override any supported `options.*` values when a condition matches. All matching `options_override` actions are merged in order; later actions overwrite earlier ones for the same option keys.

| Property    | Type               | Allowed Values                                                                                      | Description                                                                                                           |
| ----------- | ------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| action_type | `options_override` |                                                                                                     |                                                                                                                       |
| options     | object             | Refer to [Single Participant](#single-participant-1), [Spotlight](#spotlight-1) and [Grid](#grid-1) | A partial of the supported `options` keys (anything you normally set under `options.*`), `custom_actions` are omitted |
| condition   | object             |                                                                                                     |                                                                                                                       |

### Target values & supported operators

You can target these values in conditions:

| Property                   | Type   | Description                                                       |
| -------------------------- | ------ | ----------------------------------------------------------------- |
| `participant_count`        | number | Number of participants in the call                                |
| `pinned_participant_count` | number | Number of pinned participants in the call (evaluated client-side) |

Logical operators:

- `$and`, `$or`, `$not`

Scalar operators:

- `$eq`, `$neq`, `$in`, `$gt`, `$gte`, `$lt`, `$lte`

<admonition type="info">

The number of target values is currently limited but if you need other properties available feel free to reach out to our [support](https://getstream.io/contact/support/).

</admonition>

### Examples

Switch to a `dominant-spearker` layout when `pinned_participant_count` is greater or equal to one:

```json
{
  // other options
  "custom_actions": [
    {
      "action_type": "layout_override",
      "condition": {
        "pinned_participant_count": { "$gte": 1 }
      },
      "layout": "dominant-speaker"
    }
  ]
}
```

Apply different background color to the recording setup when second participant joins the call:

```json
{
  // other options
  "custom_actions": [
    {
      "action_type": "options_override",
      "condition": {
        "participant_count": { "$gt": 1 }
      },
      "options": {
        "layout.background_color": "hotpink"
      }
    }
  ]
}
```

## Custom recording styling using external CSS

You can customize how recorded calls look by providing an external CSS file. The CSS file needs to be publicly available and ideally hosted on a CDN to ensure the best performance.
The best way to find the right CSS setup is by running the layout app directly. The application is [publicly available on Github here](https://github.com/GetStream/stream-video-js/tree/main/sample-apps/react/egress-composite) and contains instructions on how to be used.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.updateCallType({
  name: callTypeName,
  settings: {
    recording: {
      mode: "available",
      audio_only: false,
      quality: "1080p",
      layout: {
        name: "spotlight",
        external_css_url: "https://path/to/custom.css",
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest, LayoutSettingsRequest, RecordSettingsRequest

client.video.update_call_type(
    "default",
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
            audio_only=False,
            quality="1080p",
            layout=LayoutSettingsRequest(
                name="spotlight",
                external_css_url="https://path/to/custom.css",
            ),
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().UpdateCallType(ctx, "callTypeName", &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Recording: &getstream.RecordSettingsRequest{
      Mode:      "available",
      AudioOnly: getstream.PtrTo(false),
	    Quality:   getstream.PtrTo("1080p"),
      Layout: &getstream.LayoutSettingsRequest{
        Name:           "spotlight",
        ExternalCssUrl: getstream.PtrTo("https://path/to/custom.css"),
      },
    },
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
    "settings": {
      "recording": {
        "mode": "available",
        "audio_only": false,
        "quality": "1080p",
        "layout": {
          "name": "spotlight",
          "external_css_url": "https://path/to/custom.css"
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

## Advanced - record calls using a custom web application

If needed, you can use your own custom application to record a call. This is the most flexible and complex approach to record calls, make sure to reach out to our customer support before going with this approach.

The layout app used to record calls is available on [GitHub](https://github.com/GetStream/stream-video-js/tree/main/sample-apps/react/egress-composite) and is a good starting point. The repository also includes information on how to build your own.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.updateCallType({
  name: callTypeName,
  settings: {
    recording: {
      mode: "available",
      audio_only: false,
      quality: "1080p",
      layout: {
        name: "custom",
        external_app_url: "https://path/to/layout/app",
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest, LayoutSettingsRequest, RecordSettingsRequest

client.video.update_call_type(
    "default",
    settings=CallSettingsRequest(
        recording=RecordSettingsRequest(
            mode="available",
            audio_only=False,
            quality="1080p",
            layout=LayoutSettingsRequest(
                name="custom",
                external_app_url="https://path/to/layout/app",
            ),
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go

client.Video().UpdateCallType(ctx, "callTypeName", &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Recording: &getstream.RecordSettingsRequest{
      Mode:      "available",
      AudioOnly: getstream.PtrTo(false),
      Quality:   getstream.PtrTo("1080p"),
      Layout: &getstream.LayoutSettingsRequest{
        Name:           "custom",
        ExternalAppUrl: getstream.PtrTo("https://path/to/layout/app"),
      },
    },
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
    "settings": {
      "recording": {
        "mode": "available",
        "audio_only": false,
        "quality": "1080p",
        "layout": {
          "name": "custom",
          "external_app_url": "https://path/to/layout/app"
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

## Client-side recording

Unfortunately, there is no direct support for client-side recording at the moment. Call recording at the moment is done by Stream server-side. If client-side recording is important for you please make sure to follow the conversation [here](https://github.com/GetStream/protocol/discussions/249).


---

This page was last updated at 2026-04-17T17:34:00.924Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/recording/calls/](https://getstream.io/video/docs/react-native/recording/calls/).