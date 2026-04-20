# Ringing

The `Call` object provides options to ring and notify users about calls.

## Best Practices

- **Use unique call IDs** - Reusing call IDs may cause unexpected behavior
- **Include caller in members** - The caller must be in the member list
- **Handle multiple ringing calls** - Filter and manage concurrent ringing calls
- **Clean up on reject/cancel** - Use `call.leave({ reject: true })` with appropriate reason
- **Check permissions before ending** - `endCall()` requires special permissions

## Create call

Set `ring: true` and provide the member list. Include the caller in the member list.

```typescript {3,5}
const call = client.call("default", crypto.randomUUID());
await call.getOrCreate({
  ring: true,
  video: true,
  data: {
    members: [{ user_id: "myself" }, { user_id: "my friend" }],
  },
});
```

<admonition type="note">
  When using ringing calls, it is recommended to use unique call IDs, as reusing the same call ID may lead to unexpected behavior.
</admonition>

### Call creation options

Supported options:

| Option     | Description                                                                                                                                                     | Default |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `members`  | A list of members to add to this call. You can specify the role and custom data on these members                                                                | -       |
| `custom`   | Any custom data you want to store                                                                                                                               | -       |
| `settings` | You can overwrite certain call settings for this specific call. This overwrites the call type standard settings                                                 | -       |
| `startsAt` | When the call will start. Used for calls scheduled in the future, livestreams, audio rooms etc                                                                  | -       |
| `team`     | Restrict the access to this call to a specific team                                                                                                             | -       |
| `ring`     | If you want the call to ring for each member                                                                                                                    | `false` |
| `notify`   | If you want the call to notify each member by sending push notification.                                                                                        | `false` |
| `video`    | When ringing, the notification will indicate whether it’s a video call or an audio-only call, depending on whether you set the video parameter to true or false | -       |

This starts the signaling flow. The caller auto-joins when the first callee accepts. The call stops if all callees reject.

<admonition type="note">

When `ring` is `true`, a **push notification** will be sent to the members, provided their app have the required setup.
For more details around push notifications, please check [this page](/video/docs/react-native/incoming-calls/overview).

</admonition>

## Watch for incoming and outgoing calls

Use the `useCalls` hook with [`RingingCallContent`](/video/docs/react-native/ui-components/call/ringing-call-content) component.

**Important**: Watch ringing calls in your app's root component. This ensures calls display regardless of current screen or if opened from a push notification.

```tsx {20,38-42}
import { SafeAreaView, StyleSheet } from "react-native";
import {
  StreamCall,
  StreamVideo,
  useCalls,
  RingingCallContent,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-native-sdk";

const user: User = { id: "sara" };
const client = StreamVideoClient.getOrCreateInstance({
  apiKey: "<STREAM-API-KEY>",
  tokenProvider: () => Promise.resolve("<USER-TOKEN>"),
  user,
});

const RingingCalls = () => {
  // collect all ringing kind of calls managed by the SDK
  const calls = useCalls().filter((c) => c.ringing);

  // for simplicity, we only take the first one but
  // there could be multiple calls ringing at the same time
  const ringingCall = calls[0];
  if (!ringingCall) return null;

  return (
    <StreamCall call={ringingCall}>
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <RingingCallContent />
      </SafeAreaView>
    </StreamCall>
  );
};

export const App = () => {
  return (
    <StreamVideo client={client}>
      {/* MyApp - your parent navigator or equivalent */}
      <MyApp />
      <RingingCalls />
    </StreamVideo>
  );
};
```

The `RingingCalls` component renders over the app during incoming/outgoing calls. Alternatively, use a Modal or Dialog.

<admonition type="warning">

Always use `StreamVideoClient.getOrCreateInstance(..)` instead of `new StreamVideoClient(..)`. Reusing the client instance preserves call accept/decline states changed while the app was in the background. The `getOrCreateInstance` method ensures the same user reuses the existing instance.

</admonition>


### Optional: Adding ringing sound without push notifications

Push notifications include ringing sounds automatically. Without push notifications, add sounds manually using `react-native-sound-player` or similar:

Install the library:

```bash
npm install react-native-sound-player
cd ios && bundle exec pod install  # For iOS only
```

Add your sound files:

- **Android**: Place `outgoing_call.mp3` and `incoming_call.mp3` in `android/app/src/main/res/raw/`
- **iOS**: Add the sound files to your Xcode project bundle

```tsx {15-30}
import {
  useCallStateHooks,
  CallingState,
  useCall,
  RingingCallContent,
} from "@stream-io/video-react-native-sdk";
import SoundPlayer from "react-native-sound-player";

const RingingSound = () => {
  const call = useCall();
  const isCallCreatedByMe = call?.isCreatedByMe;
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState !== CallingState.RINGING) {
      return;
    }

    if (isCallCreatedByMe) {
      // play outgoing call sound
      SoundPlayer.playSoundFile("outgoing_call", "mp3");
    } else {
      // play incoming call sound
      SoundPlayer.playSoundFile("incoming_call", "mp3");
    }

    // stop the sound when the calling state changes
    return () => {
      SoundPlayer.stop();
    };
  }, [callingState, isCallCreatedByMe]);

  // renderless component
  return null;
};

// ... later add the above component anywhere below StreamCall
<StreamCall call={call}>
  <RingingSound />
  <SafeAreaView style={StyleSheet.absoluteFill}>
    <RingingCallContent />
  </SafeAreaView>
</StreamCall>;
```

## Canceling an outgoing call

Cancel before the first callee accepts. This stops the signaling flow.

```typescript
await call.leave({ reject: true, reason: "cancel" });
```

Note: `call.leave()` after joining won't stop the signaling flow.

## Rejecting an incoming call

Reject an incoming call:

```typescript
await call.leave({ reject: true, reason: "decline" });
```

## Accepting a call

Accept and join:

```typescript
await call.join();
```

Note: Multiple calls can be joined simultaneously. Leave existing calls before accepting new ones if only one active call is allowed.

## Leave call

Leave a joined call:

```typescript
await call.leave();
```

## End call

Requires [special permission](/video/docs/react-native/guides/permissions-and-moderation/). Terminates the call for all participants.

```typescript
await call.endCall();
```

## Notifying

Notify users about a call without ringing using the `notify` option:

```typescript
await call.getOrCreate({ notify: true });
```

Sends a regular push notification to all members. Useful for livestreams or huddles.

If the call exists, use the get method:

```typescript
await call.get({ notify: true });
```

## Ringing individual members

Ring specific members instead of the entire call, or ring members into an existing call using the `ring` method:

```typescript
const call = client.call("default", crypto.randomUUID());
await call.getOrCreate({
  ring: false,
  data: {
    members: [{ user_id: "myself" }, { user_id: "my-friend" }],
  },
});

// note: my-friend needs to be a member of the call
await call.ring({ members_ids: ["my-friend"] });

// to invite a new member and ring them
await call.updateCallMembers({
  update_members: [{ members_ids: "my-other-friend" }],
});
await call.ring({ members_ids: ["my-other-friend"] });

// to ring all members
await call.ring();
```


## Keeping track of the ringing state

Track `accepted_by`, `rejected_by`, and `missed_by` states for all rung members. Useful for displaying detailed member status in your UI.

Access this data through the call's `session` state:

```tsx
const { useCallSession } = useCallStateHooks();
const session = useCallSession();
const { accepted_by = {}, rejected_by = {}, missed_by = {} } = session ?? {};

if (accepted_by[sara.user_id]) {
  console.log("sara accepted the call");
}

if (rejected_by[john.user_id]) {
  console.log("john rejected the call");
}

if (missed_by[mary.user_id]) {
  console.log("mary missed the call");
}
```



---

This page was last updated at 2026-04-17T17:34:03.419Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/ringing/](https://getstream.io/video/docs/react-native/incoming-calls/ringing/).