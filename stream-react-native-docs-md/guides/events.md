# Events

Use the [reactive state store](/video/docs/react-native/guides/call-and-participant-state/) for most state change notifications. Subscribe to WebSocket events for advanced use cases.

## Best Practices

- **Prefer state hooks** - Use reactive state store for most use cases
- **Unsubscribe properly** - Always call the returned unsubscribe function
- **Watch calls for events** - Call events require watching via `queryCalls`, `join`, or `get/getOrCreate`
- **Limit custom event size** - Maximum 5KB payload for custom events

## List of events

### Client events

Client events are always delivered if a user is connected to the client using the `connectUser` method.

The list of client events:

| Name               | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `connection.ok`    | Fired when the authentication process finished successfully |
| `connection.error` | Fired when the WS connections fails                         |

### Call events

Call events are delivered only to clients watching the call. Three ways to watch:

1. Call the `queryCalls` method with the `watch` option set to `true`:

```typescript
import { StreamVideoClient } from '@stream-io/video-react-native-sdk';

let client: StreamVideoClient;

client.queryCalls({
    ...
    watch: true
});
```

2. Join a call:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

client.call("default", "test-call").join();
```

3. Watch a call:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

client.call("default", "test-call").getOrCreate();
// or
client.call("default", "test-call").get();
```

The list of call events:

| Name                              | Description                                                    | Delivered to     |
| --------------------------------- | -------------------------------------------------------------- | ---------------- |
| `call.accepted`                   | A user accepts a notification to join a call                   | All call members |
| `call.blocked_user`               | A user is blocked from the call                                | Call watchers    |
| `call.created`                    | The call was created                                           | All call members |
| `call.ended`                      | The call was ended                                             | All call members |
| `call.hls_broadcasting_failed`    | The call failed to broadcast                                   | Call watchers    |
| `call.hls_broadcasting_started`   | The call started to broadcast                                  | Call watchers    |
| `call.hls_broadcasting_stopped`   | The call stopped broadcasting                                  | Call watchers    |
| `call.live_started`               | The call left backstage mode                                   | Call watchers    |
| `call.member_added`               | One or more members were added to the call                     | All call members |
| `call.member_removed`             | One or more members were removed from the call                 | All call members |
| `call.member_updated`             | One or more members were updated                               | All call members |
| `call.member_updated_permission`  | One or more members' role was updated                          | All call members |
| `call.notification`               | A user is calling all call members                             | All call members |
| `call.permission_request`         | A user is requesting permissions                               | Call watchers    |
| `call.permissions_updated`        | A member's permissions were updated                            | Call watchers    |
| `call.reaction_new`               | A new reaction was sent                                        | Call watchers    |
| `call.recording_failed`           | A recording failed                                             | Call watchers    |
| `call.recording_ready`            | A recording is ready                                           | Call watchers    |
| `call.recording_started`          | A recording has been started                                   | Call watchers    |
| `call.recording_stopped`          | The recording was stopped                                      | Call watchers    |
| `call.rejected`                   | A user declined to join the call                               | All call members |
| `call.ring`                       | A user is calling all call members                             | All call members |
| `call.session_ended`              | A call session ended (all participants have left the call)     | Call watchers    |
| `call.session_participant_joined` | A participant joined to the call sessions                      | Call watchers    |
| `call.session_participant_left`   | A participant left a call session                              | Call watchers    |
| `call.session_started`            | A call session started (the first participant joined the call) | Call watchers    |
| `call.unblocked_user`             | A user is unblocked                                            | Call watchers    |
| `call.updated`                    | The call was updated                                           | Call watchers    |
| `custom`                          | Custom event                                                   | All call members |

## Listening to client and call events

Use `on` method on `StreamVideoClient` to subscribe to events. Pass event type or `'all'` for all events. Returns an unsubscribe function.

Event handler receives [`StreamVideoEvent`](https://github.com/GetStream/stream-video-js/blob/main/packages/client/src/coordinator/connection/types.ts) with `type` attribute.

Subscribe to all events:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

// Subscribe to all events
const unsubscribe = client.on("all", (event: StreamVideoEvent) => {
  console.log(event);
});

// Unsubscribe
unsubscribe();
```

Subscribing to `call.created` events:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

// Subscribe to all events
const unsubscribe = client.on("call.created", (event: StreamVideoEvent) => {
  if (event.type === "call.created") {
    console.log(`Call created: ${event.call_cid}`);
  }
});

// Unsubscribe
unsubscribe();
```

## Listening to call events

Use `on` method on `Call` instance for call-specific events. Event handler receives [`StreamCallEvent`](https://github.com/GetStream/stream-video-js/blob/main/packages/client/src/coordinator/connection/types.ts). Returns an unsubscribe function.

Subscribe to `call.reaction_new` event:

```typescript
import { Call } from "@stream-io/video-react-native-sdk";

let call: Call;

// Subscribe to new reactions event
const unsubscribe = call.on("call.reaction_new", (event: StreamVideoEvent) => {
  if (event.type === "call.reaction_new") {
    console.log(`New reaction: ${event.reaction}`);
  }
});

// Unsubscribe
unsubscribe();
```

## Custom events

Send custom events using `sendCustomEvent` (5KB payload limit):

```typescript
import {
  Call,
  CustomVideoEvent,
  StreamVideoEvent,
} from "@stream-io/video-react-native-sdk";

let call: Call;

// sending a custom event
await call.sendCustomEvent({
  type: "my-event-type",
  payload: {
    foo: "bar",
  },
});

// listening to or receiving a custom event
call.on("custom", (event: StreamVideoEvent) => {
  const customEvent = event as CustomVideoEvent;
  const payload = customEvent.custom;
  if (payload.type === "my-event-type") {
    console.log(payload.foo);
  }
});
```


---

This page was last updated at 2026-04-17T17:34:00.835Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/events/](https://getstream.io/video/docs/react-native/guides/events/).