# Keeping The Call Alive In Background

Keep calls alive when the app goes to the background. Users continue hearing remote audio streams while the app is backgrounded.

## Best Practices

- **Install Notifee** - Required for foreground service management on Android
- **Declare permissions** - Add foreground service permissions to AndroidManifest.xml
- **Request notification permissions** - Required for Android 13+ foreground services
- **Enable audio background mode** - Add `audio` to UIBackgroundModes on iOS
- **Customize notifications** - Configure foreground service notification appearance

## Android Setup

In Android, we use a [foreground service](https://developer.android.com/guide/components/foreground-services) to keep the call alive. The SDK will automatically create and manage the foreground service.

<tabs groupId="current-platform" queryString>

<tabs-item value="expo" label="Expo">

In order to be able to use the foreground service, some declarations need to be added to the `AndroidManifest.xml`. In **app.json**, in the `plugins` field, add `true` to the `androidKeepCallAlive` property in the `@stream-io/video-react-native-sdk` plugin. This will add the declarations automatically.

```js title="app.json" {6}
{
 "plugins": [
      [
        "@stream-io/video-react-native-sdk",
        {
           "androidKeepCallAlive": true
        }
      ],
      // your other plugins
  ]
}
```

<admonition type="tip">

If Expo EAS build is not used, please do `npx expo prebuild --clean` to edit the `AndroidManifest.xml` again after adding the config plugin property.

</admonition>

</tabs-item>

<tabs-item value="rn" label="React Native" default>

In order to be able to use the foreground service, some declarations need to be added in the `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<!-- We declare the permissions needed for using foreground service to keep call alive -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
```

</tabs-item>

</tabs>

<admonition type="info">

When uploading the app to the Play Store, it is essential to declare the permissions for foreground services in the Play Console and provide an explanation for their use. This includes adding a link to a video that demonstrates how the foreground service is utilized during video and audio calls. This procedure is required only once. For more details, click [here](https://support.google.com/googleplay/android-developer/answer/13392821). The added permissions are:

- `android.permission.FOREGROUND_SERVICE_CAMERA` - To access camera when app goes to background
- `android.permission.FOREGROUND_SERVICE_MICROPHONE` - To access microphone when app goes to background
- `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK` - To play video and audio tracks when the app goes to background

</admonition>

### Request notification permissions

At an appropriate place in your app, request notification permissions from the user.
Below is an example of how to request notification permissions using the [`react-native-permissions`](https://github.com/zoontek/react-native-permissions) library:

```ts
import { requestNotifications } from "react-native-permissions";

// This will request POST_NOTIFICATION runtime permission for Anroid 13+
await requestNotifications(["alert", "sound"]);
```

<admonition type="tip">

For a comprehensive guide on requesting all required permissions (camera, microphone, bluetooth, and notifications), see [Manage Native Permissions](/video/docs/react-native/guides/native-permissions/).

</admonition>

### Optional: override the default configuration of the foreground service notifications

```ts
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

StreamVideoRN.updateConfig({
  foregroundService: {
    android: {
      channel: {
        id: "stream_call_foreground_service",
        name: "Service to keep call alive",
      },
      // you can edit the title and body of the notification here
      notificationTexts: {
        title: "Video call is in progress",
        body: "Tap to return to the call",
      },
      // you can optionally add a promise to run in the foreground service
      taskToRun: (call) =>
        new Promise(() => {
          console.log(
            "jumping to foreground service foreground service with call-cid",
            call.cid,
          );
        }),
    },
  },
});
```

## iOS Setup

Enable the `audio` background mode to keep audio alive when users lock their device or switch apps. In Xcode, add `audio` to `UIBackgroundModes` in `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```


---

This page was last updated at 2026-04-17T17:34:00.806Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/keeping-call-alive/](https://getstream.io/video/docs/react-native/guides/keeping-call-alive/).