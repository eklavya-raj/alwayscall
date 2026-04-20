# Transcriptions

Transcription provides call transcripts for users. The Stream React Native Video SDK includes built-in transcription support.

## Best Practices

- **Check feature availability** - Hide transcription UI when feature is disabled
- **Show transcription status** - Indicate when transcription is active
- **Handle permissions** - Verify user has permission to control transcription
- **Consider privacy** - Inform participants when transcription is enabled

The `Call` object provides transcription control via `call.state.settings.transcription`:

- **available** - Feature can be enabled
- **disabled** - Feature unavailable (hide related UI)
- **auto-on** - Automatically enabled when user connects

Check current transcription status via `call.state.transcribing`.

Use the utility hooks:

```typescript
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallSettings, useIsCallTranscribingInProgress } =
  useCallStateHooks();

// access to the transcription settings
const { transcription } = useCallSettings();

// whether transcription is on or off
const isTranscribing = useIsCallTranscribingInProgress();
```

Build a toggle button that shows/hides based on feature availability:

Example:

```tsx
import { Pressable, Text } from "react-native";
import {
  useCall,
  useCallStateHooks,
  TranscriptionSettingsModeEnum,
} from "@stream-io/video-react-native-sdk";

export const MyToggleTranscriptionButton = () => {
  const call = useCall();
  const { useCallSettings, useIsCallTranscribingInProgress } =
    useCallStateHooks();

  const { transcription } = useCallSettings() || {};
  if (transcription?.mode === TranscriptionSettingsModeEnum.DISABLED) {
    // transcriptions are not available, render nothing
    return null;
  }

  const isTranscribing = useIsCallTranscribingInProgress();
  return (
    <Pressable
      onPress={() => {
        if (isTranscribing) {
          call?.stopTranscription().catch((err) => {
            console.log("Failed to stop transcriptions", err);
          });
        } else {
          call?.startTranscription().catch((err) => {
            console.error("Failed to start transcription", err);
          });
        }
      }}
    >
      <Text>
        {isTranscribing ? "Stop transcription" : "Start transcription"}
      </Text>
    </Pressable>
  );
};
```


---

This page was last updated at 2026-04-17T17:34:03.364Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/transcriptions/](https://getstream.io/video/docs/react-native/ui-cookbook/transcriptions/).