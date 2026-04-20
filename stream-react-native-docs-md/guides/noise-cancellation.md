# Noise Cancellation

Enable Noise Cancellation by installing `@stream-io/noise-cancellation-react-native` and enabling it in the Stream [dashboard](https://getstream.io/dashboard/). This feature uses technology developed by [krisp.ai](https://krisp.ai).

## Best Practices

- **Check device capability first** - Use `deviceSupportsAdvancedAudioProcessing` before showing noise cancellation controls
- **Enable selectively** - Noise cancellation is resource-intensive; enable only on capable devices
- **Respect dashboard settings** - The `isSupported` value reflects server-side configuration
- **Wrap with NoiseCancellationProvider** - Must be a child of `StreamCall` component

## Installation

Add the `@stream-io/noise-cancellation-react-native` library for native audio processing:

<tabs>

<tabs-item value="expo" label="Expo">

```bash title="Terminal"
npx expo install @stream-io/noise-cancellation-react-native
```

<admonition type="note">

Noise cancellation is supported only on `125.3.0` version and above of `@stream-io/react-native-webrtc`. Expo version `50` or above is required.

</admonition>

### Add the config plugin properties

In **app.json**, in the `plugins` field, add the `addNoiseCancellation` property to the `@stream-io/video-react-native-sdk` plugin.

```json title="app.json" {6}
{
  "plugins": [
    [
      "@stream-io/video-react-native-sdk",
      {
        "addNoiseCancellation": true
        // ... any other props
      }
    ]
    // your other plugins
  ]
}
```

<admonition type="info">

- The `addNoiseCancellation` field is used to add the relevant native code to initialise the noise cancellation audio filter on iOS and Android.

</admonition>

<admonition type="tip">

If Expo EAS build is not used, please do `npx expo prebuild --clean` to generate the native directories again after adding the config plugins.

</admonition>

</tabs-item>

<tabs-item value="rncli" label="React Native CLI">

```bash title="Terminal"
yarn add @stream-io/noise-cancellation-react-native
npx pod-install
```

<admonition type="note">

Noise cancellation is supported only on `125.3.0` version and above of `@stream-io/react-native-webrtc`. React Native version `0.73` or above is required.

</admonition>

### iOS specific installation

#### Update AppDelegate

Update `AppDelegate.m` or `AppDelegate.mm` or `AppDelegate.swift` with the following parts for iOS support in your existing `didFinishLaunchingWithOptions` method.

<tabs>

<tabs-item value="objc" label="Objective-C">

```objc title="AppDelegate.mm"
#import "NoiseCancellationManagerObjc.h"

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[NoiseCancellationManagerObjc sharedInstance] registerProcessor];

  // the rest
}
```

</tabs-item>

<tabs-item value="swift" label="Swift">

```swift title="AppDelegate.swift"
import stream_io_noise_cancellation_react_native

override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {

  NoiseCancellationManager.getInstance().registerProcessor()

  // the rest
}
```

</tabs-item>

</tabs>

### Android specific installation

#### Update MainApplication

Update `MainApplication.kt` with the following parts for Android support.

```kt title="MainApplication.kt"
import io.getstream.rn.noisecancellation.NoiseCancellationReactNative

override fun onCreate() {
  NoiseCancellationReactNative.registerProcessor(applicationContext)

  // the rest
}
```

</tabs-item>

</tabs>

## Integration

The SDK provides components and hooks for smooth integration:

- **NoiseCancellationProvider** - Context provider (must be child of `StreamCall`)
- **useNoiseCancellation()** - Hook for controlling noise cancellation behavior

```tsx
import { Button } from "react-native";
import {
  Call,
  NoiseCancellationProvider,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useNoiseCancellation,
} from "@stream-io/video-react-native-sdk";

export const MyApp = () => {
  let client: StreamVideoClient; // ...
  let call: Call; // ...

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <NoiseCancellationProvider>
          <MyComponentTree>
            <MyToggleNoiseCancellationButton />
          </MyComponentTree>
        </NoiseCancellationProvider>
      </StreamCall>
    </StreamVideo>
  );
};

// a minimal example of a noise cancellation button
const MyToggleNoiseCancellationButton = () => {
  const {
    // `isSupported` can be true, false or undefined. It is `false` when the server settings indicate that user must not not turn noise cancellation on. It is `undefined` while user capability check is in progress.
    isSupported,
    // `deviceSupportsAdvancedAudioProcessing` can be true, false or undefined. It is `true` when Apple's Neural Engine can be used or AUDIO_PRO on Android. It is `undefined` used while device capability check is in progress.
    deviceSupportsAdvancedAudioProcessing,
    isEnabled,
    setEnabled,
  } = useNoiseCancellation();

  if (!deviceSupportsAdvancedAudioProcessing) {
    // optional but recommended
    // do not show the option if the device does support advanced audio processing.
    return null;
  }

  return (
    <Button
      disabled={!isSupported}
      title={
        isEnabled ? "Disable Noise Cancellation" : "Enable Noise Cancellation"
      }
      onPress={() => setEnabled((prev) => !prev)}
    />
  );
};
```

<admonition type="tip">

While noise cancellation may be enabled, it is a resource-intensive process. It is recommended to enable it only on devices that support advanced audio processing.

You can check if a device supports advanced audio processing with the `deviceSupportsAdvancedAudioProcessing` boolean value from the `useNoiseCancellation` hook.

This method returns `true` if the iOS device supports Apple's Neural Engine or if an Android device has the `FEATURE_AUDIO_PRO` feature enabled. Devices with this capability are better suited for handling noise cancellation efficiently.

</admonition>

### Feature availability

Feature availability is automatically managed by `NoiseCancellationProvider` based on call settings. The `isSupported` value from `useNoiseCancellation` reflects whether noise cancellation is enabled. Access settings via Call State Hooks:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallSettings } = useCallStateHooks();
const settings = useCallSettings();

// "available", "disabled", "auto-on"
console.log(settings?.audio.noise_cancellation?.mode);
```

- **available** - Feature enabled on dashboard; show noise cancellation toggle UI
- **disabled** - Feature not enabled; hide noise cancellation toggle UI
- **auto-on** - Like `available`, but SDK auto-enables on join when `deviceSupportsAdvancedAudioProcessing` is true


---

This page was last updated at 2026-04-17T17:34:03.008Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/noise-cancellation/](https://getstream.io/video/docs/react-native/guides/noise-cancellation/).