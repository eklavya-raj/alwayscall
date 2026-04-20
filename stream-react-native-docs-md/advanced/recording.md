# Recording

Call recording supports legal compliance, quality assurance, and reference needs.

## Recording calls

Use `call.startRecording()` and `call.stopRecording()` for recording control. Check status with `useIsCallRecordingInProgress`.

Recording takes moments to start - create a loading state for the transition period.

```tsx
import React, { useCallback, useEffect, useState } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-native-sdk";

import { ActivityIndicator, Button } from "react-native";

export const CustomCallRecordButton = () => {
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isCallRecordingInProgress = useIsCallRecordingInProgress();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  useEffect(() => {
    if (!call) {
      return;
    }
    // we wait until call.recording_started/stopped event
    // to remove the loading indicator
    const eventHandlers = [
      call.on("call.recording_started", () => setIsAwaitingResponse(false)),
      call.on("call.recording_stopped", () => setIsAwaitingResponse(false)),
    ];
    return () => {
      eventHandlers.forEach((unsubscribe) => unsubscribe());
    };
  }, [call]);

  const toggleRecording = useCallback(async () => {
    try {
      setIsAwaitingResponse(true);
      if (isCallRecordingInProgress) {
        await call?.stopRecording();
      } else {
        await call?.startRecording();
      }
    } catch (e) {
      console.error("Failed start recording", e);
    }
  }, [call, isCallRecordingInProgress]);

  return isAwaitingResponse ? (
    <ActivityIndicator />
  ) : (
    <Button
      onPress={toggleRecording}
      title={`${isCallRecordingInProgress ? "Stop" : "Start"} Recording`}
    />
  );
};
```

### Permissions

Recording requires specific permissions. Use the [`Restricted`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-bindings/src/wrappers/Restricted.tsx) component to conditionally render controls based on permissions.

See [permissions guide](/video/docs/react-native/guides/permissions-and-moderation/).

## Acquiring call recordings data

Use `call.listRecordings()` to retrieve recordings. By default, returns all recordings for the call CID. Pass `callSessionId` to filter by session. Returns `ListRecordingsResponse` with `recordings` array of `CallRecording` objects.

```tsx
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CallRecording, useCall } from "@stream-io/video-react-native-sdk";

export const RecordingsList = () => {
  const call = useCall();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  useEffect(() => {
    if (!call) return;

    const loadRecordings = async () => {
      // callSessionId is optional:
      // - no argument => recordings across all sessions for this call CID
      const allRecordings = await call.listRecordings();
      setRecordings(allRecordings.recordings);

      // - with callSessionId => recordings for a specific session only
      const callSessionId = call.state.session?.id;
      if (callSessionId) {
        const currentSessionRecordings =
          await call.listRecordings(callSessionId);
        console.log(currentSessionRecordings.recordings);
      }
    };

    loadRecordings();
  }, [call]);

  return (
    <View>
      <Text>{recordings.length} recordings found</Text>
    </View>
  );
};
```

<admonition type="note">

Use the `listRecordings()` API for listing data. `queryRecordings()` is deprecated.

</admonition>

<admonition type="note">

Multiple calls can be recorded during a single call session, but a single call CID can be reused for multiple sessions, too.

</admonition>

<admonition type="note">

The call recording is not immediately available when the `call.recording_stopped` event is delivered.
It may take 30 or more seconds for a recording to be available, advertised by emitting `call.recording_ready` event.

</admonition>


---

This page was last updated at 2026-04-17T17:34:03.554Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/recording/](https://getstream.io/video/docs/react-native/advanced/recording/).