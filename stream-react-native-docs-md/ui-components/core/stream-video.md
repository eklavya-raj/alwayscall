# StreamVideo

Provider making [client and state](/video/docs/react-native/guides/call-and-participant-state/) available to children and initializing [internationalization](/video/docs/react-native/advanced/i18n/).

## General usage

```tsx {10,12}
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

export const App = () => {
  const client = new StreamVideoClient(/* ... */);

  return (
    <StreamVideo client={client}>
      <MyUI />
    </StreamVideo>
  );
};
```

## Props

### `client`

`StreamVideoClient` instance propagated to the component's children as a part of `StreamVideoContext`. Children can access it with `useStreamVideoClient()` hook.

| Type                |
| ------------------- |
| `StreamVideoClient` |

### `i18nInstance`

The `StreamI18n` instance to use, if `undefined` is provided, a new instance will be created. For more information, see our [Internationalization guide](/video/docs/react-native/advanced/i18n/).

| Type                        |
| --------------------------- |
| `StreamI18n` \| `undefined` |

### `language`

The language to translate UI labels. For more information, see our [Internationalization guide](/video/docs/react-native/advanced/i18n/).

| Type                    | Default |
| ----------------------- | ------- |
| `string` \| `undefined` | en      |

### `translationsOverrides`

Custom translations that will be merged with the defaults provided by the library. For more information, see our [Internationalization guide](/video/docs/react-native/advanced/i18n/).

| Type                             |
| -------------------------------- |
| `TranslationsMap` \| `undefined` |

### `style`

Prop to apply [styles/theme](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/theme/theme.ts) to all of the inner components.

| Type                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- |
| [`Theme`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/theme/theme.ts) \| `undefined` |


---

This page was last updated at 2026-04-17T17:34:01.024Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/core/stream-video/](https://getstream.io/video/docs/react-native/ui-components/core/stream-video/).