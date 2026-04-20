# Expo Setup

The SDK supports two iOS screen share modes — **broadcast** (captures the entire device screen via a Broadcast Upload Extension) and **in-app** (captures your app only via `RPScreenRecorder`). Android setup is common to both.

## Android & iOS Broadcast Setup

Configure screen share for Android and iOS broadcast mode in your Expo app by adding the `enableScreenshare` and `appleTeamId` properties to the SDK plugin in **app.json**:

```js title="app.json" {6,7}
{
 "plugins": [
      [
        "@stream-io/video-react-native-sdk",
        {
          "enableScreenshare": true,
          "appleTeamId": <ADD-YOUR-APPLE-TEAM-ID>, // example: "EHV7XZLAHA"
          // .. rest
        }
      ],
  ]
}
```

<admonition type="info">

**iOS**

- The `appleTeamId` field is used for signing the new extension created for screen share.
- The above configuration in the plugin will generate a new screen sharing extension named as "broadcast" and adds relevant information to your iOS app target as well.
- The plugin automatically includes all required extension files (`SampleHandler.swift`, `SampleUploader.swift`, `SocketConnection.swift`, `Atomic.swift`, `DarwinNotificationCenter.swift`).

**Android**

The plugin adds a foreground service and the permission `android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION`. When uploading the app to the Play Store, declare these permissions in the Play Console and explain their usage, including a link to a video demonstrating the service. This is a one-time requirement. For more information, click [here](https://support.google.com/googleplay/android-developer/answer/13392821).

</admonition>

## iOS In-App Screen Sharing

As an alternative to the broadcast extension, you can use **in-app screen sharing** which captures the current app's screen using `RPScreenRecorder`. This mode does not require the `enableScreenshare` or `appleTeamId` config plugin options — no Broadcast Upload Extension is generated.

To use in-app mode, pass `type: 'inApp'` in the `screenShareOptions` prop:

```tsx
<ScreenShareToggleButton screenShareOptions={{ type: "inApp" }} />
```

In-app mode requires no additional native setup beyond the standard Expo SDK configuration.

## Screen Share with Audio

To include system/app audio in the screen share, pass `includeAudio: true` via the `screenShareOptions` prop on `ScreenShareToggleButton`. On iOS, audio capture is only supported in **in-app** mode, so include `type: "inApp"` together with `includeAudio: true` (on Android, `type` is ignored).

```tsx
<ScreenShareToggleButton
  screenShareOptions={{ type: "inApp", includeAudio: true }}
/>
```

No additional native setup is required — the Expo config plugin includes all necessary files for both platforms. See the [overview](/video/docs/react-native/guides/screensharing/overview/#screen-share-with-audio) for details on platform behavior and limitations.


---

This page was last updated at 2026-04-17T17:34:00.781Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/screensharing/expo/](https://getstream.io/video/docs/react-native/guides/screensharing/expo/).