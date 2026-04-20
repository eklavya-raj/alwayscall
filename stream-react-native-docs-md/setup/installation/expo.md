# Expo

Our SDK requires native code and is not available on Expo Go. Use [expo-dev-client](https://docs.expo.dev/development/create-development-builds/) for development builds.

## Best Practices

- **Use development builds** - Expo Go doesn't support native modules required by this SDK
- **Run prebuild after config changes** - Execute `npx expo prebuild --clean` when modifying config plugins
- **Use minimum SDK version 24** - Required for Android compatibility
- **Test on real devices** - iOS simulators don't support audio/video; Android emulators have limited support
- **Wrap with GestureHandlerRootView** - Required if using `react-native-gesture-handler`

### Development Build

Prepare your project for [expo development builds](https://docs.expo.dev/develop/development-builds/installation/).

## SDK Installation

Install the SDK and required dependencies:

```bash title=Terminal
npx expo install @stream-io/video-react-native-sdk \
  @stream-io/react-native-webrtc \
  @config-plugins/react-native-webrtc \
  react-native-svg \
  @react-native-community/netinfo \
  expo-build-properties
```

**Installed packages:**

- **@stream-io/video-react-native-sdk** - Stream's Video SDK with UI components, hooks, and utilities for audio/video calls
- **@stream-io/react-native-webrtc** - WebRTC module for rendering audio/video tracks and media device interaction
- **@config-plugins/react-native-webrtc** - Config plugin for auto-configuring WebRTC on `npx expo prebuild`
- **react-native-svg** - SVG support for SDK components and icons
- **@react-native-community/netinfo** - Detects device connectivity state, type, and quality
- **expo-build-properties** - Config plugin for native build properties

<admonition type="info">

Starting from version `125.3.0` version of `@stream-io/react-native-webrtc`, only Expo version `50` and above is supported. If you are on an older Expo version than `50`, please use `125.2.1` version of `@stream-io/react-native-webrtc`.

</admonition>

### Android Specific installation

#### Update the minSdk version

In your `app.json` file add the following to the `expo-build-properties` plugin:

```js title=app.json
{
  "expo": {
    ...
    "plugins": [
      "expo-build-properties",
      {
        "android": {
          "minSdkVersion": 24
        }
      }
    ]
  }
}
```

### Add config plugin

Add the config plugin for [`@stream-io/video-react-native-sdk`](https://github.com/GetStream/stream-video-js/tree/main/packages/react-native-sdk/expo-config-plugin/README.md) and [`react-native-webrtc`](https://www.npmjs.com/package/@config-plugins/react-native-webrtc) to your `app.json` file:

```js title=app.json
{
  "expo": {
    ...
    "plugins": [
      "@stream-io/video-react-native-sdk",
      [
        "@config-plugins/react-native-webrtc",
        {
          // add your explanations for camera and microphone
          "cameraPermission": "$(PRODUCT_NAME) requires camera access in order to capture and transmit video",
          "microphonePermission": "$(PRODUCT_NAME) requires microphone access in order to capture and transmit audio"
        }
      ]
    ]
  }
}
```

If Expo EAS build is not used, please do `npx expo prebuild --clean` to generate the native directories again after adding the config plugins.

<admonition type="info">

Permissions need to be granted by the user as well. Requests for Camera and Microphone usage are automatically asked when the stream is first requested by the app. But other permissions like `BLUETOOTH_CONNECT` in Android need to be requested manually. However, we recommend that all necessary permissions be manually asked at an appropriate place in your app for the best user experience.

We recommend the usage of [`react-native-permissions`](https://github.com/zoontek/react-native-permissions) library to request permissions in the app.

</admonition>

**Hardware requirement on Android**

Video/audio calling apps require video and audio hardware. Use these utility methods to detect hardware presence:

```ts
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

const hasCameraHardware = await StreamVideoRN.androidHasCameraHardware();
const hasAudioOutputHardware =
  await StreamVideoRN.androidHasAudioOutputHardware();
const hasMicrophoneHardware =
  await StreamVideoRN.androidHasMicrophoneHardware();
```

Disable camera features or SDK usage when hardware is absent.

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

This occurs on Expo 49+ with a monorepo configuration. Notifee is unable to find the compiled AAR android library. You can do the following workaround in your `app.json` to mitigate this:

```ts
const config = {
  expo: {
    // ...
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "$rootDir/../../../node_modules/@notifee/react-native/android/libs",
            ],
          },
        },
      ],
    ],
  },
};
```

This will add the Notifee library to the list of repositories that Gradle will search for dependencies. Please note that the exact path for **extraMavenRepos** will vary depending on your project's structure.

**Reference**: [https://github.com/invertase/notifee/issues/808](https://github.com/invertase/notifee/issues/808)


---

This page was last updated at 2026-04-17T17:34:00.688Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/setup/installation/expo/](https://getstream.io/video/docs/react-native/setup/installation/expo/).