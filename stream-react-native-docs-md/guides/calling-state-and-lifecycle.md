# Calling State and Lifecycle

The `call` object instance manages everything related to a particular call:

- **Creating and joining calls** - Initialize and connect to call sessions
- **Performing actions** - Mute, unmute, send reactions, etc.
- **Event subscriptions** - Handle events like `call.on('call.session_started', callback)`

## Best Practices

- **Create calls in effects** - Only create call instances inside `useEffect` hooks
- **Always clean up** - Include `call.leave()` in your effect cleanup function
- **Use state management** - Store call instances in React state for proper lifecycle handling
- **Handle all calling states** - Use exhaustive switch statements to catch new states
- **Don't reuse left calls** - Create a new call instance after calling `leave()`

Every `call` instance should be created through `client.call(type, id)`.

The `StreamVideoClient` maintains a WebSocket connection and handles API calls proxied from the `call` instance.

Call instance management example:

```ts
import { Call, StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient; // ...

const call: Call = client.call(type, id);

// load existing call information from our servers
await call.get();

// Creates the call on our servers in case it doesn't exist. Otherwise,
// loads the call information from our servers.
await call.getOrCreate();

// join the call
await call.join();

// leave the call and dispose all allocated resources
await call.leave();
```

Every `call` instance has a local state, exposed to integrators through:

- `call.state.callingState` - a getter that returns the current value
- `call.state.callingState$` - an observable that an integrator can subscribe to and be notified everytime the value changes
- `useCallCallingState()` - a [call state hook](/video/docs/react-native/guides/call-and-participant-state/#call-state-hooks/) that makes it easy to read and update the UI based on calling state values in React components.

## Call Instance

The call instance is a stateful resource acquired with `client.call()` that must be disposed with `call.leave()`. Improper disposal causes memory leaks and unexpected behavior.

**Key requirements:**

1. Create call instances only in effects
2. Include `call.leave()` cleanup in effects

```ts
const [call, setCall] = useState<Call | undefined>(undefined);

useEffect(() => {
  const myCall = client.call(callType, callId);
  myCall.join({ create: true }).then(
    () => setCall(myCall),
    () => console.error("Failed to join the call"),
  );

  return () => {
    myCall.leave().catch(() => console.error("Failed to leave the call"));
    setCall(undefined);
  };
}, [callType, callId]);
```

To join the same call again, you can reuse the same call instance, or create a new one using `client.call(type, id)`.

## Calling State

Every `call` instance has its own local state managed by the SDK.

These values are exposed through the `CallingState` enum:

```ts
import {
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const { useCallCallingState } = useCallStateHooks();
const callingState = useCallCallingState();

switch (callingState) {
  case CallingState.JOINED:
    // ...
    break;
  default:
    const exhaustiveCheck: never = callingState;
    throw new Error(`Unknown calling state: ${exhaustiveCheck}`);
}
```

<admonition type="note">

As `CallingState` is an enum that can be extended at any time by us, it would be good to make sure you
use it exhaustively. This way, if you use TypeScript, you can get a compile time error and be notified that
there are few more states that you should handle.

</admonition>

### Calling States

| State                              | Description                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CallingState.UNKNOWN`             | The state is unknown. This value is set when Calling State isn't initialized properly.                                                                                           |
| `CallingState.IDLE`                | A call instance is created on the client side but a WebRTC session isn't established yet.                                                                                        |
| `CallingState.RINGING`             | This is an incoming (ring) call. You are the callee.                                                                                                                             |
| `CallingState.JOINING`             | The call join flow is executing (typically right after `call.join()`). Our systems are preparing to accept the new call participant.                                             |
| `CallingState.JOINED`              | The join flow has finished successfully and the current participant is part of the call. The participant can receive and publish audio and video.                                |
| `CallingState.LEFT`                | The call has been left (`call.leave()`) and all allocated resources are released. Please create a new `call` instance if you want to re-join.                                    |
| `CallingState.RECONNECTING`        | A network connection has been lost (due to various factors) and the `call` instance attempts to re-establish a connection and resume the call.                                   |
| `CallingState.RECONNECTING_FAILED` | The SDK failed to recover the connection after a couple of consecutive attempts. You need to inform the user that he needs to go online and manually attempt to rejoin the call. |
| `CallingState.MIGRATING`           | The SFU node that is hosting the current participant is shutting down or tries to rebalance the load. This `call` instance is being migrated to another SFU node.                |
| `CallingState.OFFLINE`             | No network connection can be detected. Once the connection restores, the SDK will automatically attempt to recover the connection (signalled with `RECONNECTING` state).         |

### Calling State transitions: regular path

State transitions when joining a call as caller or callee:

<mermaid>

```text
stateDiagram-v2
  direction LR
  [*] --> IDLE
  IDLE --> RINGING: call.join({ ring })
  RINGING --> JOINING
  IDLE --> JOINING: call.join()
  JOINING --> JOINED
  JOINED --> LEFT: call.leave()
  LEFT --> [*]
```

</mermaid>

### Calling State transitions: reconnects and migration

State transitions after network interruptions or during SFU node shutdown/rebalancing:

<mermaid>

```text
stateDiagram-v2
  direction LR
  [*] --> JOINING
  JOINING --> JOINED: successful join

  JOINED --> RECONNECTING: network glitch/switch
  RECONNECTING --> JOINING: attempt to reconnect
  RECONNECTING --> RECONNECTING_FAILED

  JOINED --> LEFT: call.leave()
  LEFT --> [*]

  JOINED --> MIGRATING: initiate server migration
  MIGRATING --> JOINING: attempt to migrate

  JOINED --> OFFLINE: went offline
  OFFLINE --> RECONNECTING
```

</mermaid>


### Example handling

Mapping calling states to UI components:

```tsx
import {
  CallingState,
  useCall,
  useCallStateHooks,
  CallContent,
} from "@stream-io/video-react-native-sdk";

const call = useCall();
const isCallCreatedByMe = call?.isCreatedByMe;

const { useCallCallingState } = useCallStateHooks();
const callingState = useCallCallingState();

switch (callingState) {
  case CallingState.UNKNOWN:
  case CallingState.IDLE:
    return <LobbyScreen />;

  case CallingState.RINGING:
    return isCallCreatedByMe ? (
      <OutgoingCallFullScreenComponent />
    ) : (
      <IncomingCallFullScreenComponent />
    );

  case CallingState.JOINING:
    return <LoadingCallScreen />;

  case CallingState.JOINED:
    return <CallContent />;

  case CallingState.LEFT:
    return <CallLeftIndicatorFullScreenComponent />;

  case CallingState.RECONNECTING:
  case CallingState.MIGRATING:
    return <RestoringConnectionScreen />;

  case CallingState.RECONNECTING_FAILED:
    return <GeneralConnectionErrorScreen />;

  case CallingState.OFFLINE:
    return <NoConnectionScreen />;

  default:
    const exhaustiveCheck: never = callingState;
    throw new Error(`Unknown calling state: ${exhaustiveCheck}`);
}
```


---

This page was last updated at 2026-04-17T17:34:02.992Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/calling-state-and-lifecycle/](https://getstream.io/video/docs/react-native/guides/calling-state-and-lifecycle/).