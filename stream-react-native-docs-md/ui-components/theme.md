# Theme

The React Native Video SDK includes a default UI theme. Customize it to match your app's design.

## Best Practices

- **Use exported types** - Ensure correct theme object keys with TypeScript
- **Override selectively** - Deep merge only overwrites specified styles
- **Use DeepPartial** - All keys at every depth are optional
- **Apply via StreamVideo** - Pass theme to the `style` prop

See the [default theme](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/theme/theme.ts).

### Usage

Use exported types for accurate theme creation. Theme props are deep merged with defaults:

```tsx
import type { DeepPartial, Theme } from "@stream-io/video-react-native-sdk";

const theme: DeepPartial<Theme> = {
  callControls: {
    container: {
      backgroundColor: "red",
    },
  },
};
```

Pass the theme to [`StreamVideo`](/video/docs/react-native/ui-components/core/stream-video/#style/) `style` prop:

```tsx
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

export const App = () => {
  const client = new StreamVideoClient(/* ... */);

  return (
    <StreamVideo client={client} style={theme}>
      <MyUI />
    </StreamVideo>
  );
};
```

Alternatively, you can pass the same prop to `StreamTheme` and then wrap any components that need the custom theme.

```tsx
// ... same code

return (
  <StreamVideo client={client}>
    <StreamTheme style={theme}>
      <MyUI />
    </StreamTheme>
  </StreamVideo>
);
```

![Preview of the added Call Controls theme](@video/react-native/_assets/ui-components/theme-preview.png)

You can change the default button, icon and avatar variants using the `buttonSizes`, `iconSizes` and the `avatarSizes` under the `variants` property.

The font style and the colors can be changed as well for different font and color usages within the SDK using the `typefaces` and the `colors` property.


---

This page was last updated at 2026-04-17T17:34:00.941Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/theme/](https://getstream.io/video/docs/react-native/ui-components/theme/).