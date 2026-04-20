# Audio Volume Indicator

Build sound detection using the `useSpeechDetection()` hook.

## Best Practices

- **Test sensitivity** - Adjust audio level threshold based on your use case
- **Provide visual feedback** - Clear indication of microphone activity
- **Use in lobby** - Help users verify microphone works before joining
- **Handle edge cases** - Account for background noise and silence

## AudioVolumeIndicator component

The `useSpeechDetection()` hook returns audio level (0 to 1) and sound detection status.

The `SpeechIndicator` component displays:

- **isSpeaking=true** - Dynamically expanding/contracting vertical lines
- **isSpeaking=false** - Static dots

![Image of audio volume indicator](@video/react-native/_assets/ui-cookbook/audio-volume-indicator/audio-volume-indicator.png)

Useful in Lobby components for pre-call microphone verification.

Example:

```tsx
import {
  useSpeechDetection,
  SpeechIndicator,
} from "@stream-io/video-react-native-sdk";

export const AudioVolumeIndicator = () => {
  const { audioLevel, isSoundDetected } = useSpeechDetection();
  const isSpeaking = isSoundDetected && audioLevel > 0.1;

  return <SpeechIndicator isSpeaking={isSpeaking} />;
};
```


---

This page was last updated at 2026-04-17T17:34:03.292Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/audio-volume-indicator/](https://getstream.io/video/docs/react-native/ui-cookbook/audio-volume-indicator/).