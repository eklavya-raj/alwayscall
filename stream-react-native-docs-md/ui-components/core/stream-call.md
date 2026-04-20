# StreamCall

Declarative wrapper around `Call` objects. Uses `StreamCallProvider` to make [call and state](/video/docs/react-native/guides/call-and-participant-state/) available to child components.

## General usage

```tsx {9,11}
import {
  StreamCall,
} from '@stream-io/video-react-native-sdk';

export const App = () => {
  const call = /* ... */;

  return (
    <StreamCall call={call}>
      <MyUI />
    </StreamCall>
  );
};
```

## Props

### `call`

Stream's `Call` instance propagated to the component's children as a part of `StreamCallContext`. Children can access it with `useCall()` hook.

| Type   |
| ------ |
| `Call` |


---

This page was last updated at 2026-04-17T17:34:03.229Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/core/stream-call/](https://getstream.io/video/docs/react-native/ui-components/core/stream-call/).