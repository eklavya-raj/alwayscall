# Custom Video Filters with Expo

In this guide, you'll learn how to create and use your own video filter in Expo, using a grayscale filter as an example.

### Step 1 - Setup a new local Expo module

Navigate to your project directory (containing `package.json`) and run this command to create a [local Expo module](https://docs.expo.dev/modules/get-started/):

```bash title="Terminal"
npx create-expo-module@latest --local
```

Example input values:

- **Name of the module** - video-effects
- **Native module name** - VideoEffects
- **Android package name** - io.getstream.videoeffects

After completion, navigate to `<project-directory>/modules/video-effects/`.

### Step 2 - Define our module structure

The default files include example modules with web support. Since we don't need web support or views, delete these files:

- `android/VideoEffectsView.swift`
- `ios/VideoEffectsView.swift`
- `src/VideoEffectsView.web.ts`
- `src/VideoEffectsModule.web.ts`
- `src/VideoEffects.types.ts`
- `src/VideoEffectsView.tsx`

Configure the module with a single `registerVideoFilters` method that registers the video filter with the WebRTC module:

<codetabs>

<codetabs-item value="VideoEffectsModule.ts" label="src/VideoEffectsModule.ts">

```ts
import { NativeModule, requireNativeModule } from "expo";

declare class VideoEffectsModule extends NativeModule {
  registerVideoFilters(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<VideoEffectsModule>("VideoEffects");
```

</codetabs-item>

<codetabs-item value="expo-module.config.json" label="expo-module.config.json">

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": ["VideoEffectsModule"]
  },
  "android": {
    "modules": ["io.getstream.videoeffects.VideoEffectsModule"]
  }
}
```

</codetabs-item>

<codetabs-item value="index.ts" label="index.ts">

```ts
export { default } from "./src/VideoEffectsModule";
```

</codetabs-item>

</codetabs>

### Step 3 - Implement the Android module

Navigate to `<project-directory>/modules/video-effects/android/src/main/java/io/getstream/videoeffects`.

Create a video filter by implementing `VideoFrameProcessorFactoryInterface` from `@stream-io/react-native-webrtc`. Example rotation filter:

```kotlin title="RotationFilterFactory.kt"
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessor
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessorFactoryInterface
import org.webrtc.VideoFrame

class RotationFilterFactory : VideoFrameProcessorFactoryInterface {
    override fun build(): VideoFrameProcessor {
        return VideoFrameProcessor { frame, textureHelper ->
            VideoFrame(
                frame.buffer.toI420(),
                180, // apply rotation to the video frame
                frame.timestampNs
            )
        }
    }
}
```

For easier [`Bitmap`](https://developer.android.com/reference/android/graphics/Bitmap) processing, use `VideoFrameProcessorWithBitmapFilter` from `@stream-io/video-filters-react-native`. Extend `BitmapVideoFilter` to receive a `Bitmap` for each frame that you can manipulate directly.

<admonition type="note">

`BitmapVideoFilter` is less performant due to _YUV ↔ ARGB_ conversion overhead.

</admonition>

#### Example: grayscale video filter

Create a grayscale filter by extending `BitmapVideoFilter`:

```kotlin title="videofilters/GrayScaleVideoFilterFactory.kt"
package io.getstream.videoeffects.videofilters

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessor
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessorFactoryInterface
import com.streamio.videofiltersreactnative.common.BitmapVideoFilter
import com.streamio.videofiltersreactnative.common.VideoFrameProcessorWithBitmapFilter

class GrayScaleVideoFilterFactory : VideoFrameProcessorFactoryInterface {
  override fun build(): VideoFrameProcessor {
    return VideoFrameProcessorWithBitmapFilter {
      GrayScaleFilter()
    }
  }
}
private class GrayScaleFilter : BitmapVideoFilter() {
    override fun applyFilter(videoFrameBitmap: Bitmap) {
        val canvas = Canvas(videoFrameBitmap)
        val paint = Paint().apply {
            val colorMatrix = ColorMatrix().apply {
                // map the saturation of the color to grayscale
                setSaturation(0f)
            }
            colorFilter = ColorMatrixColorFilter(colorMatrix)
        }
        canvas.drawBitmap(videoFrameBitmap, 0f, 0f, paint)
    }
}
```

Add this file in a new `videofilters` folder. Next, implement the Kotlin module with the `registerVideoFilters` method:

```kotlin title="VideoEffectsModule.kt"
package io.getstream.videoeffects

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import io.getstream.videoeffects.videofilters.GrayScaleVideoFilterFactory
import com.oney.WebRTCModule.videoEffects.ProcessorProvider

class VideoEffectsModule : Module() {

  override fun definition() = ModuleDefinition {

    Name("VideoEffects")

    Function("registerVideoFilters") {
      ProcessorProvider.addProcessor("grayscale", GrayScaleVideoFilterFactory())
    }

  }
}
```

Finally, add dependencies in `<project-directory>/modules/video-effects/android/build.gradle`:

```groovy title="android/build.gradle"
dependencies {
  implementation project(':stream-io_react-native-webrtc')
  implementation project(':stream-io_video-filters-react-native')
}
```

### Step 4 - Implement the iOS module

Navigate to `<project-directory>/modules/video-effects/ios/`.

Create an object conforming to `VideoFrameProcessorDelegate` protocol from `@stream-io/video-filters-react-native` that inherits from `NSObject`.

For easier [`CIImage`](https://developer.apple.com/documentation/coreimage/ciimage) processing, **copy** [VideoFilters.swift](https://github.com/GetStream/stream-video-js/blob/main/packages/video-filters-react-native/ios/VideoFrameProcessors/Utils/VideoFilters.swift) into this directory. The `VideoFilter` class receives each frame as `CIImage` and converts it to an output `CIImage`, giving you full control over the processing pipeline. For raw video frame access, adapt the `VideoFilter` class implementation.

#### Example: grayscale video filter

Create a grayscale filter by extending `VideoFilter`:

```swift title="GrayScaleVideoFrameProcessor.swift"
import Foundation
import stream_react_native_webrtc

final class GrayScaleVideoFrameProcessor: VideoFilter {
    @available(*, unavailable)
    override public init(
        filter: @escaping (Input) -> CIImage
    ) { fatalError() }

    init() {
        super.init(
            filter: { input in
                let filter = CIFilter(name: "CIPhotoEffectMono")
                filter?.setValue(input.originalImage, forKey: kCIInputImageKey)

                let outputImage: CIImage = filter?.outputImage ?? input.originalImage
                return outputImage
            }
        )
    }
}
```

Next, implement the Swift module with the `registerVideoFilters` method:

```swift title="VideoEffectsModule.swift"
import ExpoModulesCore
import stream_react_native_webrtc

public class VideoEffectsModule: Module {

  public func definition() -> ModuleDefinition {

    Name("VideoEffects")

    Function("registerVideoFilters") {
      ProcessorProvider.addProcessor(GrayScaleVideoFrameProcessor(), forName: "grayscale")
    }
  }
}
```

Finally, add dependencies in `VideoEffects.podspec`:

```ruby title="VideoEffects.podspec" {2}
s.dependency 'ExpoModulesCore'
s.dependency 'stream-react-native-webrtc'
```

### Step 5 - Apply the video filter in JavaScript

Call `mediaStreamTrack._setVideoEffect(name)` to apply the filter. Use `disableAllFilter` from `useBackgroundFilters()` to disable filters. Example hook for the grayscale filter (media stream is in the `Call` instance from `useCall`):

```ts
import {
  useBackgroundFilters,
  useCall,
} from "@stream-io/video-react-native-sdk";
import { useRef, useCallback, useState } from "react";

import { MediaStream } from "@stream-io/react-native-webrtc";

// NOTE: Ensure the relative path matches your project structure.
// In a standard Expo project, local modules are often located in the `modules` directory at the root level.
import VideoEffectsModule from "../../modules/video-effects";

type CustomFilters = "GrayScale" | "MyOtherCustomFilter";

export const useCustomVideoFilters = () => {
  const call = useCall();
  const isFiltersRegisteredRef = useRef(false);
  const { disableAllFilters } = useBackgroundFilters();
  const [currentCustomFilter, setCustomFilter] = useState<CustomFilters>();

  const applyGrayScaleFilter = useCallback(async () => {
    if (!isFiltersRegisteredRef.current) {
      // registering is needed only once per the app's lifetime
      VideoEffectsModule.registerVideoFilters();
      isFiltersRegisteredRef.current = true;
    }
    disableAllFilters(); // disable any other filter
    (call?.camera.state.mediaStream as MediaStream | undefined)
      ?.getVideoTracks()
      .forEach((track) => {
        track._setVideoEffect("grayscale"); // set the grayscale filter
      });
    setCustomFilter("GrayScale");
  }, [call, disableAllFilters]);

  const disableCustomFilter = useCallback(() => {
    disableAllFilters();
    setCustomFilter(undefined);
  }, [disableAllFilters]);

  return {
    currentCustomFilter,
    applyGrayScaleFilter,
    disableCustomFilter,
  };
};
```

Call `applyGrayScaleFilter` while in a call:

![Preview of the grayscale video filter](@video/react-native/_assets/advanced/apply-video-filters/preview-grayscale-filter.png)

Complete code available in our [Expo sample app](https://github.com/GetStream/stream-video-js/tree/main/sample-apps/react-native/expo-video-sample/modules/video-effects).


---

This page was last updated at 2026-04-17T17:34:01.675Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/video-filters/custom-expo/](https://getstream.io/video/docs/react-native/advanced/video-filters/custom-expo/).