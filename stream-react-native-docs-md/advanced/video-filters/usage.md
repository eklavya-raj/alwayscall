# Usage

A common use case during video calls is applying background effects. The most popular options are blurring and static images. The SDK offers built-in background blurring and virtual backgrounds, plus support for custom filters. This guide shows how to apply video filters to a video stream.

## Using the background video filters provided by the SDK

### Step 1 - Install the video filters library

Add the `@stream-io/video-filters-react-native` library:

<tabs>

<tabs-item value="expo" label="Expo">

```bash title="Terminal"
npx expo install @stream-io/video-filters-react-native
```

</tabs-item>

<tabs-item value="rncli" label="React Native CLI">

```bash title="Terminal"
yarn add @stream-io/video-filters-react-native
npx pod-install
```

</tabs-item>

</tabs>

This library adds the native module for video stream processing and filter manipulation.

### Step 2 - Wrap under Provider component

Background filters use these APIs:

- **`<BackgroundFiltersProvider />`** - React context provider for the filters API
- **`useBackgroundFilters()`** - React hook to access the filters API

Basic integration:

```tsx
import {
  BackgroundFiltersProvider,
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

export default function App() {
  let client: StreamVideoClient; /* = ... */
  let call: Call; /* = ... */
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <BackgroundFiltersProvider>
          <MyCallContent />
          <MyBackgroundFilterUI />{" "}
          {/* your UI to enable or disable filters, for example a modal dialog */}
        </BackgroundFiltersProvider>
      </StreamCall>
    </StreamVideo>
  );
}
```

The `BackgroundFiltersProvider` holds filter state and must be wrapped under `StreamCall` to access the media stream.

### Step 2 - Use the hook to control the filters

With `BackgroundFiltersProvider` rendered, use `useBackgroundFilters()` to control filters:

<admonition type="warning">

iOS background video filters require iOS 15+. Custom filter support depends on the APIs you use.

</admonition>

```tsx
import { useBackgroundFilters } from '@stream-io/video-react-native-sdk';

export const MyBackgroundFilterUI = () => {
  const {
    isSupported, // checks if these filters can run on this device
    disableAllFilter, // disables all the video filters
    applyBackgroundBlurFilter, // applies the blur filter
    applyBackgroundImageFilter, // applies the image filter
    currentBackgroundFilter, // the currently applied filter
  } = useBackgroundFilters();

  if (!isSupported) {
    return null;
  }

  return (
    <SafeAreaView>
      <Button onPress={disableAllFilter} title="Disable"/>
      <Button onPress={() => applyBackgroundBlurFilter('heavy')} title="Blur Heavy"/>
      <Button onPress={() => applyBackgroundBlurFilter('medium')} title="Blur Medium">
      <Button onPress={() => applyBackgroundBlurFilter('light')} title="Blur Light"/>
      <Button onPress={() => applyBackgroundImageFilter(require('path/to/image/amsterdam.png'))} title="Amsterdam Local Image Background"/>
      <Button onPress={() => applyBackgroundImageFilter({uri: 'https://upload.wikimedia.org/wikipedia/commons/1/18/React_Native_Logo.png'})} title="React Native Remote Image Background"/>
    </SafeAreaView>
  );
};
```

| Preview of background blur filter                                                                                          | Preview of background image replacement filter                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ![Preview of the background blur filter](@video/react-native/_assets/advanced/apply-video-filters/preview-blur-filter.png) | ![Preview of background image replacement filter](@video/react-native/_assets/advanced/apply-video-filters/preview-image-filter.png) |

## Advanced: adding custom video filters

To add custom filters alongside or instead of built-in ones, follow these platform-specific guides:

- **[Expo](/video/docs/react-native/advanced/video-filters/custom-expo/)** - custom video filters in Expo
- **[React Native CLI](/video/docs/react-native/advanced/video-filters/custom-rn/)** - custom video filters in React Native Community CLI


---

This page was last updated at 2026-04-17T17:34:03.584Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/video-filters/usage/](https://getstream.io/video/docs/react-native/advanced/video-filters/usage/).