# Lobby

Pre-meeting component for testing setup before joining. Includes:

- **Call details** - ID and meeting information
- **Current participants** - Who's already in the meeting
- **Media controls** - Audio/video mute status before joining
- **Join button** - Handler for entering the meeting

![Preview of the Lobby component.](@video/react-native/_assets/ui-components/call/lobby/lobby.png)

## General usage

```tsx {9}
import { useCallback } from "react";
import { Lobby, useCall } from "@stream-io/video-react-native-sdk";

const LobbyComponent = () => {
  const onJoinCallHandler = () => {
    // Handle what should happen after the call is joined. Eg: navigation, etc.
  };

  return <Lobby onJoinCallHandler={onJoinCallHandler} />;
};
```

## Props

### `landscape`

Applies the landscape mode styles to the component, if true.

| Type                     |
| ------------------------ |
| `boolean` \| `undefined` |


### `onJoinCallHandler`

Handler to be called when the call is joined using the join button in the Lobby.

| Type                        |
| --------------------------- |
| `() => void` \| `undefined` |

### `LobbyControls`

Prop to customize the media controls in the Lobby component entirely.

| Type                          | Default Value                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ComponentType`\| `undefined` | [`LobbyControls`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/LobbyControls.tsx) |

### `JoinCallButton`

Prop to customize the Join call button in the Lobby component.

| Type                          | Default Value                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`JoinCallButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/Lobby/JoinCallButton.tsx) |

### `LobbyFooter`

Prop to customize the Lobby Footer in the Lobby component.

| Type                          | Default Value                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ComponentType`\| `undefined` | [`LobbyFooter`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/Lobby/LobbyFooter.tsx) |


---

This page was last updated at 2026-04-17T17:34:01.002Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/call/lobby/](https://getstream.io/video/docs/react-native/ui-components/call/lobby/).