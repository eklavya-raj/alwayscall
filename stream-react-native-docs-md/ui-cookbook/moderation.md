# Moderation

Handle moderation events in video call applications. Stream's moderation system automatically emits events when content violates configured policies. Configure policies via the [Stream Dashboard](/moderation/docs/node/) or moderation API.

## Best Practices

- **Display warnings clearly** - Show moderation warnings prominently to users
- **Handle blur gracefully** - Apply blur filters without disrupting call flow
- **Inform about termination** - Explain why a call ended due to violations
- **Log moderation events** - Track violations for review and policy adjustment

Stream API moderation events:

- **call.moderation_warning** - Warning issued to user
- **call.moderation_blur** - Blur effect should be applied to camera
- **call.ended** - Call terminated (with `reason: PolicyViolationModeration` for violations)

## Moderation Notification

Custom `ModerationNotification` component that listens for warnings and displays notifications:

Example:

```ts
import { useCall } from "@stream-io/video-react-native-sdk";
import { Alert } from "react-native";

export const ModerationNotification = () => {
  const call = useCall();
  useEffect(() => {
    if (!call) return;
    return call.on("call.moderation_warning", (e) => {
      Alert.alert("Call Moderation Warning", e.message);
    });
  }, [call]);
};
```

## Moderation Blur

The `useModeration` hook from `@stream-io/video-react-native-sdk` handles blur events automatically. When `call.moderation_blur` fires, the hook applies blur to the camera.

Setup video filters using `@stream-io/video-filters-react-native`. See [video filters setup](/video/docs/react-native/advanced/video-filters/usage/) for installation. Wrap components in `<BackgroundFiltersProvider />`.

### Behavior

- **With video filters package** - Full-screen blur applied to outgoing video, auto-removed after timeout
- **Without package or on error** - Camera disabled as fallback

### Usage

Import `useModeration` from `@stream-io/video-react-native-sdk` and call it in your custom call UI:

Example:

```tsx
import {
  StreamCall,
  StreamVideo,
  useModeration,
} from "@stream-io/video-react-native-sdk";

export const App = () => {
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CustomCallUI />
      </StreamCall>
    </StreamVideo>
  );
};

export const CustomCallUI = () => {
  // Enable moderation by plugging in the useModeration hook
  useModeration({ duration: 2000 }); // leave empty for default 5000ms

  // Render the actual component tree
};
```

## Handling Moderation Policy Violation

Multiple policy violations may terminate the call. The `call.ended` event carries `PolicyViolationModeration` as the reason.

Example:

```tsx
import { useCall } from "@stream-io/video-react-native-sdk";
import { Alert } from "react-native";

export const MyComponent = () => {
  const call = useCall();
  useEffect(() => {
    if (!call) return;
    return call.on("call.ended", (event) => {
      if (event.reason === "PolicyViolationModeration") {
        Alert.alert(
          "Call Terminated",
          "The video call was terminated due to multiple policy violations.",
        );
      }
    });
  }, [call]);
};
```


---

This page was last updated at 2026-04-17T17:34:03.395Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/moderation/](https://getstream.io/video/docs/react-native/ui-cookbook/moderation/).