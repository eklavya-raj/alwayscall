# Screen Sharing Overview

The Stream Video React Native SDK supports displaying and sharing screens from iOS and Android devices.

## Best Practices

- **Configure permissions** - Users need the `screenshare` capability (Screenshare permission) for their call type
- **Enable in dashboard** - Screen sharing must be enabled for your call type in the Stream dashboard
- **Complete native setup** - Platform-specific configuration is required before screen sharing works
- **Use built-in button** - The `ScreenShareToggleButton` handles start/stop logic automatically

![Screenshot shows screensharing dashboard setting](@video/react-native/_assets/advanced/screensharing/screensharing-dashboard.png)

## Setup

Complete native setup for your platform:

- [React Native CLI Screen Share Setup](/video/docs/react-native/guides/screensharing/react-native/)
- [Expo Screen Share Setup](/video/docs/react-native/guides/screensharing/expo/)

## Screen sharing button

Use the `ScreenShareToggleButton` component to manage screen sharing. Add it independently or to [custom call controls](/video/docs/react-native/ui-cookbook/replacing-call-controls/). For custom implementations, reference the [source code](https://github.com/GetStream/stream-video-js/tree/main/packages/react-native-sdk/src/components/Call/CallControls/ScreenShareToggleButton.tsx).

### Props

The `ScreenShareToggleButton` accepts an optional `screenShareOptions` prop to control screen share behavior:

```tsx
<ScreenShareToggleButton
  screenShareOptions={{
    type: "broadcast", // or 'inApp' (iOS only, default: 'broadcast')
    includeAudio: true, // mix screen audio into mic (default: false)
  }}
/>
```

| Prop                              | Type                     | Default       | Description                                                                                                                                                                                                                                     |
| --------------------------------- | ------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `screenShareOptions.type`         | `'broadcast' \| 'inApp'` | `'broadcast'` | **iOS only.** `'broadcast'` uses a Broadcast Upload Extension to capture the entire device screen (works across all apps). `'inApp'` uses `RPScreenRecorder` to capture the current app only — no extension setup required. Ignored on Android. |
| `screenShareOptions.includeAudio` | `boolean`                | `false`       | When `true`, system/app audio (e.g. music, game audio) is captured and mixed into the microphone audio track so remote participants can hear it. See [Screen Share with Audio](#screen-share-with-audio).                                       |
| `onScreenShareStartedHandler`     | `() => void`             | —             | Called when screen sharing starts.                                                                                                                                                                                                              |
| `onScreenShareStoppedHandler`     | `() => void`             | —             | Called when screen sharing stops.                                                                                                                                                                                                               |

### iOS screen share types

**Broadcast** (default) — captures the entire device screen, even when the user switches to other apps. Requires a [Broadcast Upload Extension](/video/docs/react-native/guides/screensharing/react-native/#ios-setup). Best for sharing content across apps.

**In-App** — captures only the current app's screen using `RPScreenRecorder`. No extension setup is needed, making it simpler to configure. However, capture stops when the app is backgrounded.

## Screen share with audio

When `includeAudio` is set to `true`, the SDK captures system/app audio and mixes it into the microphone audio track. Remote participants hear both the user's voice and the shared audio.

**How it works:**

- **Android** (API 29+): Uses `AudioPlaybackCaptureConfiguration` to capture media audio. Only media sounds are captured — notifications and system sounds are excluded. No additional permissions are needed beyond the standard screen share setup.

<admonition type="warning">

On Android, `AudioPlaybackCaptureConfiguration` captures playback audio only when playback-capture requirements are met. In practice, audio is capturable only for eligible usage types and when capture is allowed by app/player capture policy (for example playback capture not disabled in manifest or `AudioAttributes`). Currently, the SDK matches these usage types:

- `USAGE_MEDIA`
- `USAGE_GAME`
- `USAGE_UNKNOWN`

Audio outside these usage types or with capture disallowed by policy, will not be included.

</admonition>

- **iOS** (in-app mode only): Audio is captured directly from `RPScreenRecorder` and mixed into the WebRTC capture pipeline. Audio capturing is **not supported** in broadcast mode.

<admonition type="warning">

If you need to share audio, make sure to set `type: 'inApp'` in your `screenShareOptions`.

</admonition>

<admonition type="info">

While screen share audio mixing is active, the SDK automatically **disables noise cancellation** (if using `@stream-io/noise-cancellation-react-native`) so that non-speech audio like music passes through. Noise cancellation is restored automatically when screen sharing stops. No manual configuration is needed.

On iOS, screen audio is mixed into the capture pipeline **after** voice processing (echo cancellation, auto gain control, noise suppression), so these filters do not affect the mixed audio.

</admonition>

When starting screen share, users see this permission prompt:

| Android preview                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------- |
| ![Android preview of the Screen Sharing Permission](@video/react-native/_assets/advanced/screensharing/android-preview.png) |

| iOS broadcast extension preview                                                                                      | iOS in-app preview                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ![iOS preview of the Screen Sharing Permission](@video/react-native/_assets/advanced/screensharing/ios-preview.jpeg) | ![iOS in-app preview of the Screen Sharing Permission](@video/react-native/_assets/advanced/screensharing/ios-in-app-preview.jpeg) |


---

This page was last updated at 2026-04-17T17:34:00.766Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/screensharing/overview/](https://getstream.io/video/docs/react-native/guides/screensharing/overview/).