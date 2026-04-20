# Network Disruptions

Connection problems occur during calls when switching networks or experiencing poor signal. The SDK automatically attempts reconnection.

## Best Practices

- **Set appropriate timeouts** - Balance between user experience and resource usage
- **Notify users during reconnection** - Show clear UI feedback about connection status
- **Provide manual reconnect option** - Allow users to trigger reconnection manually
- **Log connection events** - Track disconnection patterns for debugging

Use `call.setDisconnectionTimeout` to specify how long users can remain disconnected before removal. This handles short network interruptions gracefully.

## Setting the disconnection timeout

After creating a call, set the disconnection timeout:

```ts
call.setDisconnectionTimeout(30); // Try to reconnect for 30 seconds
call.setDisconnectionTimeout(0); // try to reconnect indefinitely (default)
```

Default timeout is `0`, allowing users to remain until reconnection or call end.

## Notify user after disconnection

The calling state reflects reconnection status. When reconnection fails after timeout, the state becomes `CallingState.RECONNECTING_FAILED`. Display appropriate UI:

Example:

```tsx
const { useCallCallingState } = useCallStateHooks();
const callingState = useCallCallingState();

if (callingState === CallingState.RECONNECTING_FAILED) {
  return <ConnectionError />; // display connection error UI
}
```


---

This page was last updated at 2026-04-17T17:34:01.236Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/network-disruption/](https://getstream.io/video/docs/react-native/ui-cookbook/network-disruption/).