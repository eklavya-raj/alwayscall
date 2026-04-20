# React Native

## Best Practices

- **Use minimum SDK version 24** - Required for Android compatibility
- **Enable Java 8 support** - Required for the WebRTC module
- **Test on real devices** - iOS simulators don't support audio/video; Android emulators have limited support
- **Request permissions appropriately** - Request camera and microphone permissions at the right moment in your app flow
- **Wrap with GestureHandlerRootView** - Required if using `react-native-gesture-handler`

### Prerequisites

Ensure your React Native development environment is configured. See the [official guide](https://reactnative.dev/docs/environment-setup).

## SDK Installation

Install the Stream Video React Native SDK:

```bash title=Terminal
yarn add @stream-io/video-react-native-sdk
```

Install required peer dependencies:

```bash title=Terminal
yarn add @stream-io/react-native-webrtc \
   react-native-svg \
   @react-native-community/netinfo

npx pod-install
```

**Installed packages:**

- **@stream-io/video-react-native-sdk** - Stream's Video SDK with UI components, hooks, and utilities for audio/video calls
- **@stream-io/react-native-webrtc** - WebRTC module for rendering audio/video tracks and interacting with media devices
- **react-native-svg** - SVG support for SDK components and icons
- **@react-native-community/netinfo** - Detects device connectivity state, type, and quality

<admonition type="info">

Starting from version `125.3.0` version of `@stream-io/react-native-webrtc`, only React Native version `0.73` and above is supported. If you are on an older react native version than `0.73`, please use `125.2.1` version of `@stream-io/react-native-webrtc`.

</admonition>

### Android Specific installation

#### Update the minSdk version

Update minSdkVersion to 24 if lower. In `android/build.gradle`, add inside the `buildscript` section:

```java
buildscript {
    ext {
        ...
        minSdkVersion = 24
    }
    ...
}
```

#### Enable Java 8 Support

In `android/app/build.gradle` add the following inside the `android` section:

```java
compileOptions {
	sourceCompatibility JavaVersion.VERSION_1_8
	targetCompatibility JavaVersion.VERSION_11
}
```

#### Optional: R8/ProGuard Support

For R8/ProGuard support, add to `android/app/proguard-rules.pro`:

```plaintext
-keep class org.webrtc.** { *; }
```

### Declaring Permissions

Video and audio calls require camera and microphone access. Declare permissions on both platforms.

#### iOS

Add the following keys and values to `Info.plist` file at a minimum:

- `Privacy - Camera Usage Description` - "`{'<Your_app_name>'}` requires camera access to capture and transmit video"
- `Privacy - Microphone Usage Description` - "`{'<Your_app_name>'}` requires microphone access to capture and transmit audio"

<admonition type="note">

You should replace `{'<Your_app_name>'}` (or also use your custom strings instead).

</admonition>

#### Android

In `AndroidManifest.xml` add the following permissions before the `<application>` section.

```xml title="AndroidManifest.xml"
<uses-feature android:name="android.hardware.camera.any" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
<uses-feature android:name="android.hardware.audio.output" />
<uses-feature android:name="android.hardware.microphone" />

<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />.
```

If you plan to also support Bluetooth devices then also add the following.

```xml
<uses-feature android:name="android.hardware.bluetooth" android:required="false"/>
<uses-feature android:name="android.hardware.bluetooth_le" android:required="false"/>

<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

<admonition type="info">

Permissions need to be granted by the user as well. Requests for Camera and Microphone usage are automatically asked when the stream is first requested by the app. But other permissions like `BLUETOOTH_CONNECT` in Android need to be requested manually. However, we recommend that all necessary permissions be manually asked at an appropriate place in your app for the best user experience.

We recommend the usage of [`react-native-permissions`](https://github.com/zoontek/react-native-permissions) library to request permissions in the app.

</admonition>

**Hardware requirement on Android**

In the above step we added,

```xml title="AndroidManifest.xml"
<uses-feature android:name="android.hardware.camera.any" />
<uses-feature android:name="android.hardware.audio.output" />
<uses-feature android:name="android.hardware.microphone" />
```

This means Google Play will filter out the app for devices without camera, audio output, or microphone. To support devices without these hardware features, set `android:required="false"`.

Example for optional camera support:

```xml title="AndroidManifest.xml"
<uses-feature android:name="android.hardware.camera.any" android:required="false" />
```

Disable camera features or SDK usage when hardware is absent. Use these utility methods to detect hardware presence:

```ts
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

const hasCameraHardware = await StreamVideoRN.androidHasCameraHardware();
const hasAudioOutputHardware =
  await StreamVideoRN.androidHasAudioOutputHardware();
const hasMicrophoneHardware =
  await StreamVideoRN.androidHasMicrophoneHardware();
```

### Run on device

#### iOS

iOS simulators don't support audio/video recording. Always test on actual devices.

#### Android

Android emulators can send static video streams for basic testing, but actual devices provide the best experience.

## New Architecture (Fabric)

The SDK's native modules and views are compatible with the [New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page) and [Bridgeless mode](https://github.com/reactwg/react-native-new-architecture/discussions/154) through the **New Renderer Interop Layers**. These layers are [automatically enabled](https://github.com/reactwg/react-native-new-architecture/discussions/175) when you turn on the New Architecture in React Native 0.74 and above. We recommend that you use React Native 0.74+ if you are using the New Architecture with the SDK.

## Troubleshooting

### Google Play's Android 15+ 16KB page size requirement warning

Ensure that the following libraries satisfy the versioning mentioned below, these are compliant with the Android 16 KB page size requirement.

```bash
@stream-io/video-react-native-sdk >= 1.21.1
@stream-io/noise-cancellation-react-native >= 0.3.0
@stream-io/video-filters-react-native >= 0.7.0
```

### GestureDetector must be used as a descendant of GestureHandlerRootView

The SDK uses `react-native-gesture-handler` for smooth gestures when installed. Wrap your entry point with `<GestureHandlerRootView>` or `gestureHandlerRootHOC`:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return <GestureHandlerRootView>{/* content */}</GestureHandlerRootView>;
}
```

### Error: Super expression must either be null or a function

This was a [known issue](https://github.com/react-native-webrtc/react-native-webrtc/issues/1503) in `@stream-io/react-native-webrtc` library.

It has been fixed on version `118.1.0` of the `@stream-io/react-native-webrtc` library.

### Android Only Error: Could not find any matches for app.notifee:core:+ as no versions of app.notifee:core are available

This occurs on projects with a monorepo configuration. Notifee is unable to find the compiled AAR android library. You can do the following workaround in your `android/build.gradle` to mitigate this:

```ts
allprojects {
  repositories {
    maven { url "$rootDir/../../../node_modules/@notifee/react-native/android/libs" }
  }
}
```

This will add the Notifee library to the list of repositories that Gradle will search for dependencies. Please note that the exact path will vary depending on your project's structure.

**Reference**: [https://github.com/invertase/notifee/issues/808](https://github.com/invertase/notifee/issues/808)


---

This page was last updated at 2026-04-17T17:34:02.951Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/setup/installation/react-native/](https://getstream.io/video/docs/react-native/setup/installation/react-native/).