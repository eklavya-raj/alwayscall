# Avatar

![Preview of the Avatar component.](@video/react-native/_assets/ui-components/avatar.png)

Displays participant image and/or name. Falls back to name display when no image is provided. Use in video calls, user lists, profiles, and more.

## General usage

```tsx {5}
import { Avatar, useLocalParticipant } from "@stream-io/video-react-native-sdk";

export function AvatarExample() {
  const localParticipant = useLocalParticipant();
  return <Avatar size={80} participant={localParticipant} />;
}
```

## Props

### `participant`

| Type                     |
| ------------------------ |
| `StreamVideoParticipant` |

The participant object to display.

### `size`

| Type                    | Default Value |
| ----------------------- | ------------- |
| `number` \| `undefined` | 100           |

Avatar dimensions (width and height) in pixels.

### `style`

| Type                                                       |
| ---------------------------------------------------------- |
| `{container:ViewStyle; image:ImageStyle; text: TextStyle}` |


---

This page was last updated at 2026-04-17T17:34:01.071Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/utility/avatar/](https://getstream.io/video/docs/react-native/ui-components/utility/avatar/).