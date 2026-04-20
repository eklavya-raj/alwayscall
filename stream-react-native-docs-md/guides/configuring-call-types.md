# Call Types

The Video SDK provides pre-defined call types with different default permissions and feature configurations. You can extend these or create custom types via the dashboard.

## Best Practices

- Use the `development` call type only for testing, never in production
- Configure call types in the dashboard before deploying to production
- Set up proper user roles to simplify permission management
- Use backstage mode for scheduled calls or livestreams that need preparation time
- Review default capabilities and customize them based on your security requirements

## Key Concepts

- **Call Type** - Pre-defined configurations with associated user roles and capabilities. Four default types are available, or create custom types via the dashboard.
- **User Role** - Defines what actions a user can perform. Users can have multiple roles. Use existing roles or define custom ones via the dashboard.
- **Call Capabilities** - Specific actions a participant can perform (such as `send-video` or `end-call`). Associated with user roles and customizable via the dashboard.

## Call Types

Four pre-defined call types are available:

- **`default`** - 1-1 or group video calls with sensible defaults
- **`audio_room`** - Pre-configured for audio-only experiences with permission request workflows (like Clubhouse or Twitter Spaces)
- **`livestream`** - All authenticated users can access calls; ideal for one-to-many broadcasting
- **`development`** - All permissions enabled; use only for testing

Each call type includes specific settings. The `backstage` concept allows calls to be created but not directly joined until `goLive()` is called, useful for scheduled calls.

### Development

The `development` call type has all permissions enabled for testing purposes. Do not use in production since all participants can perform any action (blocking, muting, etc).

Backstage is disabled, so calls start immediately without requiring `goLive()`.

### Default

The `default` call type supports 1-1 calls, group calls, and meetings. Video and audio are enabled, backstage is disabled, and admins/hosts have elevated permissions.

<div id="video-calling-tutorial-mnemonic">

<admonition type="info">

The `default` type can be used in apps that use regular video calling.
To learn more try our tutorial on [building a video calling app](https://getstream.io/video/sdk/react-native/tutorial/video-calling/).

</admonition>

</div>

### Audio Room

The `audio_room` call type suits apps like Clubhouse or Twitter Spaces. It includes a pre-configured workflow for requesting speaking permissions. Backstage is enabled by default; call `goLive()` to make the call active for all participants.

<div id="audio-room-tutorial-mnemonic">

<admonition type="info">

See the [Audio Room tutorial](https://getstream.io/video/sdk/react-native/tutorial/audio-room/) for implementation details.

</admonition>

</div>

### Livestream

The `livestream` call type is configured for live streaming apps. All authenticated users can access calls, and backstage is enabled by default.

<div id="livestream-tutorial-mnemonic">

<admonition type="info">

See the [live streaming tutorial](https://getstream.io/video/sdk/react-native/tutorial/livestreaming/) for implementation details.

</admonition>

</div>

---

## Call type settings

Each call type has configurable settings. See the [defaults table](#defaults-for-call-type-settings) for a comparison of settings across call types.

### Audio

| Setting Name               | Type                           | Description                                                                             |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| `access_request_enabled`   | Boolean                        | When `true` users that do not have permission to this feature can request access for it |
| `opus_dtx_enabled`         | Boolean                        | When `true` OPUS DTX is enabled                                                         |
| `redundant_coding_enabled` | Boolean                        | When `true` redundant audio transmission is enabled                                     |
| `mic_default_on`           | Boolean                        | When `true` the user will join with the microphone enabled by default                   |
| `speaker_default_on`       | Boolean                        | When `true` the user will join with the audio turned on by default                      |
| `default_device`           | String `speaker` or `earpiece` | The default audio device to use                                                         |

### Backstage

| Setting Name | Type    | Description                                                                                                                      |
| ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`    | Boolean | When backstage is enabled, calls will be in backstage mode when created and can be joined by users only after `goLive` is called |

### Video

| Setting Name             | Type                                 | Description                                                                             |
| ------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `enabled`                | Boolean                              | Defines whether video is enabled for the call                                           |
| `access_request_enabled` | Boolean                              | When `true` users that do not have permission to this feature can request access for it |
| `camera_default_on`      | Boolean                              | When `true`, the camera will be turned on when joining the call                         |
| `camera_facing`          | String `front`, `back` or `external` | When applicable, the camera that should be used by default                              |
| `target_resolution`      | Target Resolution Object             | The ideal resolution that video publishers should send                                  |

The target resolution is an advanced setting. Modifying defaults can degrade performance. Structure:

| Setting Name | Type   | Description          |
| ------------ | ------ | -------------------- |
| `width`      | Number | The width in pixels  |
| `height`     | Number | The height in pixels |
| `bitrate`    | Number | The bitrate          |

### Screensharing

| Setting Name             | Type    | Description                                                                             |
| ------------------------ | ------- | --------------------------------------------------------------------------------------- |
| `enabled`                | Boolean | Defines whether screensharing is enabled                                                |
| `access_request_enabled` | Boolean | When `true` users that do not have permission to this feature can request access for it |

### Recording

| Setting Name | Type                                                                                                 | Description                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | String `available`, `disabled` or `auto-on`                                                          | `available` → recording can be requested <br />`disabled` → recording is disabled <br />`auto-on` → recording starts and stops automatically when one or multiple users join the call |
| `quality`    | String `audio-only`, `360p`, `480p`, `720p`, `1080p`, `1440p`                                        | Defines the resolution of the recording                                                                                                                                               |
| `audio_only` | `boolean`                                                                                            | If `true` the recordings will only contain audio                                                                                                                                      |
| `layout`     | object, for more information see the [API docs](/video/docs/api/recording/calls/#recording-layouts/) | Configuration options for the recording application                                                                                                                                   |

### Broadcasting

| Setting Name | Type                  | Description                             |
| ------------ | --------------------- | --------------------------------------- |
| `enabled`    | Boolean               | Defines whether broadcasting is enabled |
| `hls`        | HLS Settings (object) | Settings for HLS broadcasting           |

### HLS Settings

| Setting Name     | Type                                                          | Description                                                         |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `enabled`        | Boolean                                                       | Defines whether HLS is enabled or not                               |
| `auto_on`        | Boolean                                                       | When `true` HLS streaming will start as soon as users join the call |
| `quality_tracks` | String `audio-only`, `360p`, `480p`, `720p`, `1080p`, `1440p` | The tracks to publish for the HLS stream (up to three tracks)       |

### Geofencing

| Setting Name | Type                                                                                                                                                                                      | Description                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `names`      | List of one or more of these strings `european_union`, `iran_north_korea_syria_exclusion`, `china_exclusion`, `russia_exclusion`, `belarus_exclusion`, `india`, `united_states`, `canada` | The list of geofences that are used for the calls of these type |

See the [API docs](/video/docs/api/call_types/geofencing/) for details.

### Transcription

| Setting Name          | Type                                        | Description         |
| --------------------- | ------------------------------------------- | ------------------- |
| `mode`                | String `available`, `disabled` or `auto-on` | Not implemented yet |
| `closed_caption_mode` | String                                      | Not implemented yet |

### Ringing

| Setting Name               | Type   | Description                                                                                         |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `incoming_call_timeout_ms` | Number | Defines how long the SDK should display the incoming call screen before discarding the call (in ms) |
| `auto_cancel_timeout_ms`   | Number | Defines how long the caller should wait for others to accept the call before canceling (in ms)      |

### Push Notifications Settings

| Setting Name        | Type                               | Description                                                 |
| ------------------- | ---------------------------------- | ----------------------------------------------------------- |
| `enabled`           | Boolean                            |                                                             |
| `call_live_started` | Event Notification Settings Object | The notification settings used for call_live_started events |
| `session_started`   | Event Notification Settings Object | The notification settings used for session_started events   |
| `call_notification` | Event Notification Settings Object | The notification settings used for call_notification events |
| `call_ring`         | Event Notification Settings Object | The notification settings used for call_ring events         |

Event notification settings object structure:

| Setting Name | Type                 | Description                        |
| ------------ | -------------------- | ---------------------------------- |
| `enabled`    | Boolean              | Whether this object is enabled     |
| `apns`       | APNS Settings Object | The settings for APN notifications |

### APNS Settings Object

Customize remote notifications by implementing a Notification Service Extension. For simple customizations, modify the title and body fields at the call type level. Both fields are handlebars templates with `call` and `user` objects in scope.

| Setting Name | Type     | Description                                                 |
| ------------ | -------- | ----------------------------------------------------------- |
| title        | Template | The string template for the title field of the notification |
| body         | Template | The string template for the body field of the notification  |


### Defaults for call type settings

|                            | audio-room | default                                            | livestream                                         | development                                       |
| -------------------------- | ---------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| **Audio**                  |            |                                                    |                                                    |                                                   |
| `access_request_enabled`   | ✅         | ✅                                                 | ❌                                                 | ✅                                                |
| `opus_dtx_enabled`         | ✅         | ✅                                                 | ✅                                                 | ✅                                                |
| `redundant_coding_enabled` | ✅         | ✅                                                 | ✅                                                 | ✅                                                |
| `mic_default_on`           | ❌         | ✅                                                 | ❌                                                 | ✅                                                |
| `speaker_default_on`       | ✅         | ✅                                                 | ✅                                                 | ✅                                                |
| `default_device`           | `speaker`  | `earpiece`                                         | `speaker`                                          | `earpiece`                                        |
| **Backstage**              |            |                                                    |                                                    |                                                   |
| `enabled`                  | ✅         | ❌                                                 | ✅                                                 | ❌                                                |
| **Video**                  |            |                                                    |                                                    |                                                   |
| `enabled`                  | ❌         | ✅                                                 | ✅                                                 | ✅                                                |
| `access_request_enabled`   | ❌         | ✅                                                 | ❌                                                 | ✅                                                |
| `target_resolution`        | N/A        | Width: 2560<br /> Height 1440<br />Bitrate 5000000 | Width: 1920<br />Height: 1080<br />Bitrate 3000000 | Width: 1920<br />Height 1080<br />Bitrate 3000000 |
| `camera_default_on`        | ❌         | ✅                                                 | ✅                                                 | ✅                                                |
| `camera_facing`            | front      | front                                              | front                                              | front                                             |
| **Screensharing**          |            |                                                    |                                                    |                                                   |
| `enabled`                  | ❌         | ✅                                                 | ✅                                                 | ✅                                                |
| `access_request_enabled`   | ❌         | ✅                                                 | ❌                                                 | ✅                                                |
| **Recording**              |            |                                                    |                                                    |                                                   |
| `mode`                     | available  | available                                          | available                                          | available                                         |
| `quality`                  | 720p       | 720p                                               | 720p                                               | 720p                                              |
| **Broadcasting**           |            |                                                    |                                                    |                                                   |
| `enabled`                  | ✅         | ✅                                                 | ✅                                                 | ✅                                                |
| `hls.auto_on`              | ❌         | ❌                                                 | ❌                                                 | ❌                                                |
| `hls.enabled`              | available  | available                                          | available                                          | available                                         |
| `hls.quality_tracks`       | [720p]     | [720p]                                             | [720p]                                             | [720p]                                            |
| **Geofencing**             |            |                                                    |                                                    |                                                   |
| `names`                    | []         | []                                                 | []                                                 | []                                                |
| **Transcriptions**         |            |                                                    |                                                    |                                                   |
| `mode`                     | available  | available                                          | available                                          | available                                         |
| **Ringing**                |            |                                                    |                                                    |                                                   |
| `incoming_call_timeout_ms` | 0          | 15000                                              | 0                                                  | 15000                                             |
| `auto_cancel_timeout_ms`   | 0          | 15000                                              | 0                                                  | 15000                                             |

## User roles

Five pre-defined user roles are available:

- **`user`** - Standard participant
- **`moderator`** - Can moderate calls
- **`host`** - Call host with elevated permissions
- **`admin`** - Full administrative access
- **`call-member`** - Basic call membership

Each role has associated capabilities. Access default roles and capabilities in the [Stream Dashboard](https://dashboard.getstream.io/). A well-defined role setup simplifies permission management.

## Call Capabilities

A capability defines actions a user can perform on a call. Each user has capabilities attached based on their role. Modify default capabilities in the dashboard or change them dynamically at runtime.

Users with permission to assign capabilities can grant them to other users, enabling flexible permission management.

<admonition type="info">

If you want to learn more about doing this, head over to the [Permissions and Capabilities](/video/docs/react-native/guides/permissions-and-moderation/) chapter.

</admonition>

### Default call capabilities

When fetching a call from the API, the response includes the user's allowed actions:

- `join-call`
- `read-call`
- `create-call`
- `join-ended-call`
- `join-backstage`
- `update-call`
- `update-call-settings`
- `screenshare`
- `send-video`
- `send-audio`
- `start-record-call`
- `stop-record-call`
- `start-broadcast-call`
- `stop-broadcast-call`
- `end-call`
- `mute-users`
- `update-call-permissions`
- `block-users`
- `create-reaction`
- `pin-for-everyone`
- `remove-call-member`
- `start-transcription-call`
- `stop-transcription-call`




---

This page was last updated at 2026-04-17T17:34:03.070Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/configuring-call-types/](https://getstream.io/video/docs/react-native/guides/configuring-call-types/).