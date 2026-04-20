# Custom Video Filters with React Native Community CLI

Learn how to create custom video filters in a React Native CLI app, using a grayscale filter as an example.

### Step 1 - Add your custom filter natively in Android and iOS

<tabs groupId="current-os" queryString>

<tabs-item value="android" label="Android">

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

```kotlin title="GrayScaleVideoFilterFactory.kt"
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

</tabs-item>

<tabs-item value="ios" label="iOS">

Create an object conforming to `VideoFrameProcessorDelegate` protocol from `@stream-io/video-filters-react-native` that inherits from `NSObject`.

For easier [`CIImage`](https://developer.apple.com/documentation/coreimage/ciimage) processing, copy [VideoFilters.swift](https://github.com/GetStream/stream-video-js/blob/main/packages/video-filters-react-native/ios/VideoFrameProcessors/Utils/VideoFilters.swift) into your app. The `VideoFilter` class receives each frame as `CIImage` and converts it to an output `CIImage`, giving you full control over the processing pipeline. For raw video frame access, adapt the `VideoFilter` class implementation.

Import the necessary headers in the [bridging header](https://developer.apple.com/documentation/swift/importing-objective-c-into-swift) file (Xcode offers to create one when adding your first Swift file):

```objc title="MyApp-Bridging-Header.h"
#import <React/RCTBridgeModule.h>
#import "ProcessorProvider.h"
```

#### Example: grayscale video filter

Create a grayscale filter by extending `VideoFilter`:

```swift title="GrayScaleVideoFrameProcessor.swift"
import Foundation

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

</tabs-item>

</tabs>

### Step 2 - Register this filter in your native module

Add a method to register the video filter with `@stream-io/video-filters-react-native`:

<tabs groupId="current-os" queryString>

<tabs-item value="android" label="Android">

Create an [Android native module](https://reactnative.dev/docs/native-modules-android) if needed. Add a method to register the filter with `ProcessorProvider`:

```kotlin title="VideoEffectsModule.kt"
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.oney.WebRTCModule.videoEffects.ProcessorProvider
// Example import path based on a typical project structure. Update this to match your project's package name and directory structure.
import com.example.myapp.videofilters.GrayScaleVideoFilterFactory

class VideoEffectsModule (reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return NAME;
    }

    @ReactMethod
    fun registerVideoFilters(promise: Promise) {
        ProcessorProvider.addProcessor("grayscale", GrayScaleVideoFilterFactory())
        promise.resolve(true)
    }

    companion object {
        private const val NAME = "VideoEffectsModule"
    }
}
```

</tabs-item>

<tabs-item value="ios" label="iOS">

Add a method to your [iOS native module](https://reactnative.dev/docs/native-modules-ios) in Swift. Create one if needed:

```swift title="VideoEffectsModule.swift"
@objc(VideoEffectsModule)
class VideoEffectsModule: NSObject {

  @objc(registerVideoFilters:withRejecter:)
  func registerVideoFilters(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    ProcessorProvider.addProcessor(GrayScaleVideoFrameProcessor(), forName: "grayscale")
    resolve(true)
  }

}
```

<admonition type="warning">

Use `@objc` modifiers to export the class and functions to the Objective-C runtime.

</admonition>

Create a private implementation file to register with React Native:

```objc title="VideoEffectsModule.mm"
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoEffectsModule, NSObject)

RCT_EXTERN_METHOD(registerVideoFilters:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
```

</tabs-item>

</tabs>

<admonition type="info">

When calling `addProcessor`, provide a filter name (e.g., `grayscale`) to use later in JavaScript.

</admonition>

### Step 3 - Apply the video filter in JavaScript

Call `mediaStreamTrack._setVideoEffect(name)` to apply the filter. Use `disableAllFilter` from `useBackgroundFilters()` to disable filters. Example hook (media stream is in the `Call` instance from `useCall`):

```ts
import {
  useBackgroundFilters,
  useCall,
} from "@stream-io/video-react-native-sdk";
import { useRef, useCallback, useState } from "react";

import { MediaStream } from "@stream-io/react-native-webrtc";

import { NativeModules, Platform } from "react-native";

type CustomFilters = "GrayScale" | "MyOtherCustomFilter";

export const useCustomVideoFilters = () => {
  const call = useCall();
  const isFiltersRegisteredRef = useRef(false);
  const { disableAllFilters } = useBackgroundFilters();
  const [currentCustomFilter, setCustomFilter] = useState<CustomFilters>();

  const applyGrayScaleFilter = useCallback(async () => {
    if (!isFiltersRegisteredRef.current) {
      // registering is needed only once per the app's lifetime
      await NativeModules.VideoEffectsModule?.registerVideoFilters();
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

Complete code available in our [React Native CLI sample app](https://github.com/GetStream/stream-video-js/tree/main/sample-apps/react-native/dogfood).


---

This page was last updated at 2026-04-17T17:34:03.626Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/video-filters/custom-rn/](https://getstream.io/video/docs/react-native/advanced/video-filters/custom-rn/).