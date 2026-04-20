# Custom Events

Send custom data between call participants using the real-time event layer.

## Best Practices

- **Limit payload size** - Maximum 5KB per custom event
- **Watch the call** - Recipients must be watching the call to receive events
- **Unsubscribe on cleanup** - Call the returned unsubscribe function when done
- **Define event types** - Use consistent type strings for event routing

## Sending custom events

Example: Collaborative drawing app sending coordinates:

```typescript
await call.sendCustomEvent({
  type: "draw",
  x: 10,
  y: 30,
});
```

Please note that the total payload for these events is limited to 5KB in size.

## Receiving custom events

Custom events are only delivered to clients that are [watching the call](/video/docs/react-native/guides/events/#call-events/).

To receive custom events, you need to subscribe to the `custom` event on the call instance:

```typescript
const unsubscribe = call.on("custom", (event: CustomVideoEvent) => {
  const payload = event.custom;
  if (payload.type === "draw") {
    console.log(`Received draw event: x=${payload.x}, y=${payload.y}`);
  }
});

// Unsubscribe when you no longer need to listen to custom events
unsubscribe();
```

For more information, check out our [Events guide](/video/docs/react-native/guides/events/).


---

This page was last updated at 2026-04-17T17:34:03.110Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/custom-events/](https://getstream.io/video/docs/react-native/guides/custom-events/).