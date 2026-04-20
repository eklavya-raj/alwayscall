# Call Duration

## Introduction

Build a call duration component showing elapsed time since call start.

## Best Practices

- **Update frequently** - Refresh timer every second for accuracy
- **Format consistently** - Use HH:MM:SS format for clarity
- **Handle edge cases** - Account for missing start times
- **Position strategically** - Place timer where it doesn't obstruct content

![Preview of the Call Duration component](@video/react-native/_assets/ui-cookbook/call-duration/call-duration.png)

## Implementation

Example:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCallStateHooks } from "@stream-io/video-react-bindings";
import { CallDuration } from "./icons/CallDuration";

const formatTime = (seconds: number) => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const format = date.toISOString();
  const hours = format.substring(11, 13);
  const minutes = format.substring(14, 16);
  const seconds_str = format.substring(17, 19);
  return `${hours !== "00" ? hours + ":" : ""}${minutes}:${seconds_str}`;
};

const CallDurationBadge = () => {
  const [elapsed, setElapsed] = useState<string>("00:00");
  const { useCallSession } = useCallStateHooks();
  const session = useCallSession();
  const startedAt = session?.started_at;
  const startedAtDate = useMemo(() => {
    if (!startedAt) {
      return Date.now();
    }
    const date = new Date(startedAt).getTime();
    return isNaN(date) ? Date.now() : date;
  }, [startedAt]);

  useEffect(() => {
    const initialElapsedSeconds = Math.max(
      0,
      (Date.now() - startedAtDate) / 1000,
    );

    setElapsed(formatTime(initialElapsedSeconds));

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAtDate) / 1000;
      setElapsed(formatTime(elapsedSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAtDate]);

  return (
    <View style={styles.container}>
      <CallDuration
        color={theme.colors.iconAlertSuccess}
        size={theme.variants.iconSizes.md}
      />
      <Text style={styles.text}>{elapsed}</Text>
    </View>
  );
};
```

## Features

The CallDurationBadge provides:

- **Real-time display** - Call duration in HH:MM:SS format
- **Auto-start** - Timer begins when call starts
- **Clean UI** - Minimal icon and timer display

## Customization

Customize the CallDurationBadge by:

- **Modifying styles** - Update the styles object
- **Changing icon** - Adjust size or use custom icon
- **Format adjustment** - Modify time display format

<admonition type="note">

For simplicity, the StyleSheet is not included in this guide.

</admonition>


---

This page was last updated at 2026-04-17T17:34:03.375Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/call-duration/](https://getstream.io/video/docs/react-native/ui-cookbook/call-duration/).