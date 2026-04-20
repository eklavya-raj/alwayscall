# Reactions

Reactions allow call participants to send emojis in real-time. Custom events enable sending arbitrary WebSocket messages between participants (e.g., drawing board synchronization).

## Best Practices

- **Use built-in components** - `CallControls` includes `ReactionsButton` for standard use cases
- **Include emoji_code** - SDK components use this to display the correct emoji
- **Clear reactions locally** - Use `resetReaction` for timed reaction displays
- **Watch the call** - Reactions are only delivered to clients watching the call

## Reactions

<admonition type="tip">

[`CallControls`](/video/docs/react-native/ui-components/call/call-controls/) includes [`ReactionsButton`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ReactionsButton.tsx) for out-of-the-box support. Build custom systems for advanced use cases.

</admonition>

### Sending reactions

Send reactions via the `sendReaction` method:

```typescript
const call: Call;

await call.sendReaction({ type: "raised-hand" });
```

The value of the `type` attribute can be any string.

Add additional data to reactions:

```typescript
const call: Call;

await call.sendReaction({
  type: "raised-hand",
  emoji_code: ":raise-hand:",
  custom: { clearAfterTimeout: true },
});
```

The `emoji_code` attribute is used by the SDK components to decide which emoji to display on the UI.

The `custom` property can contain any data.

### Receiving reactions

Reactions are only delivered to clients that are [watching the call](/video/docs/react-native/guides/events/#call-events/).

The [participant state](/video/docs/react-native/guides/call-and-participant-state/#observe-participant-state/) will contain the latest reaction of each participant:

```typescript
const { useParticipants } = useCallStateHooks();
const participants = useParticipants();

const reactions = participants.map((p) => p.reaction);
```

You can also subscribe to the `call.reaction_new` WebSocket event to receive reactions. For more information, check out our [Events guide](/video/docs/react-native/guides/events/).

### Clearing reactions

Clear the latest reaction using `resetReaction` (local action, no WebSocket message):

```typescript
const call: Call;
const { useParticipants } = useCallStateHooks();
const participants = useParticipants();

call.resetReaction(participants[0].sessionId);
```

Useful for displaying reactions for a limited time period.


---

This page was last updated at 2026-04-17T17:34:03.105Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/reactions/](https://getstream.io/video/docs/react-native/guides/reactions/).