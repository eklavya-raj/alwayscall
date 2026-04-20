# Speaking while muted

Showing visual feedback when users speak while muted improves UX. Observe this state via `call.state.speakingWhileMuted`.

## Best Practices

- **Display prominently** - Make the notification clearly visible but non-intrusive
- **Provide quick action** - Include an unmute button in the notification
- **Auto-dismiss wisely** - Hide notification when user stops speaking or unmutes
- **Use appropriate styling** - Warning colors help draw attention

### Custom Speaking while muted Component

Read the `isSpeakingWhileMuted` state from `useMicrophoneState` hook in `useCallStateHooks`. Render UI only when true.

![Preview of the Speaking While Muted notification component](@video/react-native/_assets/ui-cookbook/speaking-while-muted/speaking-while-muted.png)

Example:

```tsx
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const SpeakingWhileMutedNotification = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { isSpeakingWhileMuted } = useMicrophoneState();

  if (!isSpeakingWhileMuted) return null;
  return <Text>You are muted. Unmute to speak.</Text>;
};
```


---

This page was last updated at 2026-04-17T17:34:03.287Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/speaking-while-muted/](https://getstream.io/video/docs/react-native/ui-cookbook/speaking-while-muted/).