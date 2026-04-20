# Joining & Creating Calls

This guide covers creating, joining, leaving, and ending calls.

## Best Practices

- **Reuse call IDs** - Use meaningful IDs (e.g., appointment IDs) to easily find calls later
- **Always dispose calls** - Call `call.leave()` when done to prevent memory leaks
- **Handle join errors** - Wrap `call.join()` in try-catch for error handling
- **Use unique IDs for ringing** - Generate unique call IDs (UUIDs) for ringing calls
- **Check permissions** - Verify user has required permissions before ending calls

## Call

`Call` is the main SDK building block. It abstracts user actions, join flows, and exposes call state.

### Create call

Create a call by specifying `callType` and `callId`:

The [Call Type](/video/docs/react-native/guides/configuring-call-types/) controls enabled features and permissions. Calls can be reused - for telemedicine apps, use appointment IDs as call IDs for easy lookup.

```typescript
const callType = "default";
const callId = "test-call";

const call = client.call(callType, callId);
await call.getOrCreate();

// or create it with options:
await call.getOrCreate({
  data: {
    /* call creation options */
  },
});
```

See [Call creation options](#call-creation-options) for all available options.

### Join call

```typescript
const callType = "default";
const callId = "test-call";

const call = client.call(callType, callId);
await call.join();
```

### Create and join a call

Create and join in one operation. Set `create: true` to create a new call, or `false` to join an existing call only.

See [Call creation options](#call-creation-options) for all available options.

```typescript
await call.join({
  create: true,
  data: {
    /* call creation options */
  },
});
```

### Leave call

Leave a call with the `leave` method:

```typescript
await call.leave();
```

### End call

Ending a call requires [special permissions](/video/docs/react-native/guides/permissions-and-moderation/) and terminates the call for all participants.

```typescript
await call.endCall();
```

Only users with a special permission (`OwnCapability.JOIN_ENDED_CALL`) can join an ended call.

### Load call

Load existing calls:

```typescript
const call = client.call(type, id);
await call.get(); // just load

await call.getOrCreate(); // create if not present and load it
```

These operations initialize `call.state` and subscribe to backend updates. The call instance receives real-time updates when modified elsewhere.

See [Call & Participant State](/video/docs/react-native/guides/call-and-participant-state/) for details.

### Update call

Update call properties after creation:

```typescript
import { RecordSettingsRequestModeEnum } from "@stream-io/video-react-sdk";

await call.update({
  custom: { color: "green" },
  settings_override: {
    recording: {
      mode: RecordSettingsRequestModeEnum.DISABLED,
    },
  },
});
```

## Call creation options

Options when creating a call:

| Option     | Description                                                     | Default |
| ---------- | --------------------------------------------------------------- | ------- |
| `members`  | Members to add with optional role and custom data               | -       |
| `custom`   | Custom data to store                                            | -       |
| `settings` | Override call type settings for this call                       | -       |
| `startsAt` | Scheduled start time for future calls, livestreams, audio rooms | -       |
| `team`     | Restrict call access to a specific team                         | -       |
| `ring`     | Ring each member                                                | `false` |
| `notify`   | Send push notification to each member                           | `false` |
| `video`    | Indicates video or audio-only call in ringing notification      | -       |

### Set call members

```typescript
const call = client.call(type, id);
await call.getOrCreate({
  data: {
    members: [{ user_id: "alice", role: "admin" }, { user_id: "bob" }],
  },
});
```

### Update call members

```typescript
await call.updateCallMembers({
  update_members: [{ user_id: "charlie", role: "admin" }],
  remove_members: ["alice"],
});
```

### Multi-tenant & teams

In multi-tenant applications, users who are part of a team must specify that team when creating calls, or the request fails:

```typescript
const call = client.call(type, id);
await call.getOrCreate({
  data: { team: "red" },
});
```

Ensure call IDs are unique by using UUIDs or prefixing with the team name.

### Custom call data

```typescript
await call.getOrCreate({
  data: {
    custom: { color: "blue" },
  },
});
```

### Settings override

Call instances inherit settings from the call type by default. Override settings per instance when needed:

```typescript
// at creation time
await call.getOrCreate({
  data: {
    settings_override: {
      audio: { mic_default_on: false },
      video: { camera_default_on: false },
    },
  },
});

// or later
await call.update({
  settings_override: {
    video: { camera_default_on: true },
  },
});
```

### Backstage setup

Backstage mode lets hosts set up cameras before going live. Regular users join only after `call.goLive()`.

Use `join_ahead_time_seconds` to allow users to join before the scheduled start time.

Example:

```typescript
await call.getOrCreate({
  data: {
    starts_at: new Date(Date.now() + 500 * 1000), // 500 seconds from now
    settings_override: {
      backstage: {
        enabled: true,
        join_ahead_time_seconds: 300,
      },
    },
  },
});
```

This creates a call starting in 500 seconds with backstage enabled. With `join_ahead_time_seconds: 300`, regular users can join 200 seconds from now.


---

This page was last updated at 2026-04-17T17:34:02.974Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/joining-and-creating-calls/](https://getstream.io/video/docs/react-native/guides/joining-and-creating-calls/).