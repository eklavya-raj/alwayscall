# Picture in picture

Picture-in-picture (PiP) mode displays calls in a movable small window while using other apps.

## iOS

<video muted controls autoPlay loop playsInline>
  <source src="https://getstream.cdn.prismic.io/getstream/Z0Xkr5bqstJ97yMr_pip-ios.mp4" type="video/mp4"/>
</video>

### Setup

`CallContent` activates PiP automatically when backgrounding during active calls. Disable with `disablePictureInPicture` prop.

For custom components, use `RTCViewPipIOS`:

```tsx
import { RTCViewPipIOS } from "@stream-io/video-react-native-sdk";

<>
  <RTCViewPipIOS />
  <MyComponent />
</>;
```

### Mirroring in PiP

PiP mirroring follows the same `mirror` behavior as participant rendering:

- `CallContent`: set `mirror` to force mirrored/unmirrored video in PiP.
- `RTCViewPipIOS`: set `mirror` to force mirrored/unmirrored video when building custom PiP rendering.

For layout-level controls, see [Call layouts](/video/docs/react-native/ui-components/call/call-layouts/).

```tsx
<CallContent mirror={false} />
```

```tsx
<RTCViewPipIOS mirror={false} />
```

If `mirror` is not provided, default behavior is used (local front camera mirrored, other camera tracks unmirrored). Screen share is never mirrored.

### Current user camera

iOS requires [multitasking camera access](https://developer.apple.com/documentation/avfoundation/avcapturesession/4013228-ismultitaskingcameraaccesssuppor) for background camera use. Enabled automatically with `voip` in `UIBackgroundModes` (iOS 18+) or the [multitasking-camera-access entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_avfoundation_multitasking-camera-access).

#### Enabling

Enable local camera in PiP:

- `CallContent`: Set `iOSPiPIncludeLocalParticipantVideo` to `true`
- `RTCViewPipIOS`: Set `includeLocalParticipantVideo` to `true`

Then apply native changes:

<tabs groupId="current-platform" queryString>

<tabs-item value="rn" label="React Native" default>

##### Update AppDelegate

Add header after `#import "AppDelegate.h"`:

```objc {1}
#import <WebRTCModuleOptions.h>
```

Add to `didFinishLaunchingWithOptions`:

```objc {3,4}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  WebRTCModuleOptions *options = [WebRTCModuleOptions sharedInstance];
  options.enableMultitaskingCameraAccess = YES;
  // the rest
}
```

</tabs-item>

<tabs-item value="expo" label="Expo">

Add to **app.json** plugins:

```json title="app.json" {6}
{
  "plugins": [
    [
      "@stream-io/video-react-native-sdk",
      {
        "iOSEnableMultitaskingCameraAccess": true
      }
    ]
  ]
}
```

<admonition type="tip">

If Expo EAS build is not used, please do `npx expo prebuild --clean` to generate the native directories again after adding the config plugins.

</admonition>

</tabs-item>

</tabs>

## Android

<video muted controls autoPlay loop playsInline>
  <source src="https://getstream.cdn.prismic.io/getstream/Z0XkrpbqstJ97yMp_pip-android.mp4" type="video/mp4"/>
</video>

### Setup

<tabs>

<tabs-item value="rn" label="React Native" default>

#### Changes to AndroidManifest

Add to `MainActivity` in `AndroidManifest.xml`:

```xml title="AndroidManifest.xml" {4,5}
  <activity>
    ...
      android:name=".MainActivity"
      android:supportsPictureInPicture="true"
      android:configChanges="screenSize|smallestScreenSize|screenLayout|orientation"
    ...
  </activity>
```

#### Changes to MainActivity

Add imports:

<tabs>

<tabs-item value="kotlin" label="Kotlin">

```kotlin title="MainActivity.kt"
import android.content.res.Configuration
import com.streamvideo.reactnative.StreamVideoReactNative
import android.os.Build
import androidx.lifecycle.Lifecycle
```

</tabs-item>

<tabs-item value="java" label="Java">

```java title="MainActivity.java"
import android.content.res.Configuration;
import com.streamvideo.reactnative.StreamVideoReactNative;
import android.os.Build;
import androidx.lifecycle.Lifecycle;
```

</tabs-item>

</tabs>

Add functions:

<tabs>

<tabs-item value="kotlin" label="Kotlin">

```kotlin title="MainActivity.kt"
  fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode)
    if (isFinishing) {
      return
    }
    if (lifecycle.currentState === Lifecycle.State.CREATED) {
        // when user clicks on Close button of PIP
        finishAndRemoveTask()
    } else {
        StreamVideoReactNative.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    }
  }

  override fun onUserLeaveHint() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
          Build.VERSION.SDK_INT < Build.VERSION_CODES.S &&
          StreamVideoReactNative.canAutoEnterPictureInPictureMode) {
          val config = resources.configuration
          onPictureInPictureModeChanged(true,  config)
      }
  }
```

</tabs-item>

<tabs-item value="java" label="Java">

```java title="MainActivity.java"
  @Override
  public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode);
    if (isFinishing()) {
      return;
    }
    if (getLifecycle().getCurrentState() == Lifecycle.State.CREATED) {
      // when user clicks on Close button of PIP
      finishAndRemoveTask();
    } else {
      StreamVideoReactNative.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
    }
  }

  @Override
  protected void onUserLeaveHint() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
          Build.VERSION.SDK_INT < Build.VERSION_CODES.S &&
          StreamVideoReactNative.Companion.getCanAutoEnterPictureInPictureMode()) {
          Configuration config = getResources().getConfiguration();
          onPictureInPictureModeChanged(true, config);
      }
  }
```

</tabs-item>

<tabs-item value="expo" label="Expo">

Add to **app.json** plugins:

```json title="app.json" {6}
{
  "plugins": [
    [
      "@stream-io/video-react-native-sdk",
      {
        "androidPictureInPicture": true
      }
    ]
  ]
}
```

<admonition type="tip">

If Expo EAS build is not used, please do `npx expo prebuild --clean` to generate the native directories again after adding the config plugins.

</admonition>

</tabs-item>

</tabs>

</tabs-item>

</tabs>

### Keep call alive in the background

PiP triggers background mode on Android. Add a foreground service to keep calls alive. See [Keeping Call Alive](/video/docs/react-native/guides/keeping-call-alive/#android-setup).

### Entering PiP mode

`CallContent` activates PiP on home button press. Disable with `disablePictureInPicture` prop.

For custom components, use `useAutoEnterPiPEffect`:

```ts
import { useAutoEnterPiPEffect } from "@stream-io/video-react-native-sdk";

useAutoEnterPiPEffect();
```

### Choosing what to render on PiP mode

PiP windows are small - render only essential content. `CallContent` automatically shows only the dominant speaker.

For custom rendering, use `useIsInPiPMode`:

```ts
import { useIsInPiPMode } from "@stream-io/video-react-native-sdk";

const isInPiPMode = useIsInPiPMode();
```

Use this boolean to conditionally render content during PiP mode.

When using `CallContent`, you can also set `mirror` to control whether the rendered participant video is mirrored in Android PiP:

```tsx
<CallContent mirror={false} />
```


---

This page was last updated at 2026-04-17T17:34:01.652Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/pip/](https://getstream.io/video/docs/react-native/advanced/pip/).