# Screenshots

## Screenshots

Capture high-resolution screenshots of participant video or screen shares using `useScreenshot`.

Dominant speaker screenshot example:

```tsx
import { Image } from "react-native";
import {
  useCallStateHooks,
  useScreenshot,
} from "@stream-io/video-react-native-sdk";

// get the speaker that needs to be screenshot
const { useDominantSpeaker } = useCallStateHooks();
const dominantSpeaker = useDominantSpeaker();

const { takeScreenshot } = useScreenshot();
const base64PngImage = await takeScreenshot(dominantSpeaker, "videoTrack");

// Display the screenshot
<Image
  source={{ uri: `data:image/png;base64,${base64PngImage}` }}
  resizeMode="contain"
/>;
```

### Screenshot Options

#### Video Track Screenshots

Capture video feed:

```tsx
import { useScreenshot } from "@stream-io/video-react-native-sdk";

const { takeScreenshot } = useScreenshot();
const base64PngImage = await takeScreenshot(participant, "videoTrack");
```

#### Screen Sharing Screenshots

Capture screen share:

```tsx
import { useScreenshot } from "@stream-io/video-react-native-sdk";

const { takeScreenshot } = useScreenshot();
const base64PngImage = await takeScreenshot(participant, "screenShareTrack");
```

<admonition type="note">

The SDK captures screenshots but does not store them. Implement gallery/cloud storage separately.

</admonition>


---

This page was last updated at 2026-04-17T17:34:01.681Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/screenshots/](https://getstream.io/video/docs/react-native/advanced/screenshots/).