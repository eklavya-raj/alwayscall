# Landscape Mode

Landscape mode provides a larger viewing area for participants on mobile devices. The SDK includes built-in support for responsive design between portrait and landscape orientations.

## Best Practices

- **Listen for orientation changes** - Update the layout when device orientation changes
- **Test both orientations** - Verify UI elements position correctly in each mode
- **Consider safe areas** - Account for notches and system UI in landscape mode
- **Optimize video layouts** - Adjust grid layouts for horizontal space

## Passing the landscape mode styles

Pass `landscape={true}` to SDK components to apply landscape styling. Supported components:

- **[`CallContent`](/video/docs/react-native/ui-components/call/call-content/)** - Main call UI
- **[`RingingCallContent`](/video/docs/react-native/ui-components/call/ringing-call-content/)** - Incoming/outgoing call UI
- **[`Lobby`](/video/docs/react-native/ui-components/call/lobby/)** - Pre-call lobby

Example:

```tsx {13}
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <CallContent landscape={true} />
    </StreamCall>
  );
};
```

## Updating the orientation styles dynamically

Detect orientation changes using the [`Dimensions API`](https://reactnative.dev/docs/dimensions) or packages like [react-native-orientation](https://www.npmjs.com/package/react-native-orientation) or [expo-screen-orientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/).

<gallery>

![Call Content Portrait Mode](@video/react-native/_assets/ui-cookbook/landscape-mode/portrait.png)

![Call Content Landscape Mode](@video/react-native/_assets/ui-cookbook/landscape-mode/landscape.png)

</gallery>

Example using the Dimensions API without external packages:

### Creating the `useOrientation` hook

```tsx title="src/hooks/useOrientation.ts"
import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

type Orientation = "portrait" | "landscape";

const getOrientation = (): Orientation => {
  const dimensions = Dimensions.get("screen");
  return dimensions.height >= dimensions.width ? "portrait" : "landscape";
};

/**
 * A hook that returns device orientation.
 * @returns 'portrait' : 'landscape'
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ screen }) => {
      setOrientation(screen.height >= screen.width ? "portrait" : "landscape");
    });
    return () => subscription?.remove();
  }, []);

  return orientation;
};
```

### Passing the orientation to the SDK components

Check if the orientation is `landscape` and pass it to SDK components:

```tsx
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";
import { useOrientation } from "../hooks/useOrientation";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call
  const orientation = useOrientation();
  const isLandscape = orientation === "landscape";

  return (
    <StreamCall call={call}>
      <CallContent landscape={isLandscape} />
    </StreamCall>
  );
};
```


---

This page was last updated at 2026-04-17T17:34:03.323Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/landscape-mode/](https://getstream.io/video/docs/react-native/ui-cookbook/landscape-mode/).