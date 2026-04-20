# Overview

Build video calling, audio rooms, and live streams easily with Stream SDK. Use the low-level client, our guides, or pre-built UI components to add calling to your app in under an hour.

## Best Practices

- **Start with built-in components** - Use `CallContent` and `RingingCallContent` for quick implementation
- **Customize incrementally** - Override specific props before building from scratch
- **Use ParticipantView** - Includes label, network indicator, mute state, fallback, and reactions
- **Mix and match** - Combine built-in components with custom ones

### Rendering Participant

Render participant video with label, network indicator, mute state, fallback, and reactions using [ParticipantView](/video/docs/react-native/ui-components/participants/participant-view/):

```tsx
<ParticipantView participant={participant} />
```

You will see the result as below:

<gallery>

![Participant Camera On](@video/react-native/_assets/ui-components/participants/participant-view/participant-camera-on.png)

![Participant Camera Off](@video/react-native/_assets/ui-components/participants/participant-view/participant-camera-off.png)

</gallery>

### Video Call UI

Use [`CallContent`](/video/docs/react-native/ui-components/call/call-content/) for:

- **Call Participants Layout** - Renders all participants
- **Controls** - Actions to control a joined call

```tsx
const App = () => {
  return (
    <View style={styles.container}>
      <CallContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

![Preview of Video Call UI](@video/react-native/_assets/ui-components/call/call-content/call-content-grid-3-participants.png)

### Ringing (Incoming/Outgoing calls)

Implement incoming/outgoing screens with [`RingingCallContent`](/video/docs/react-native/ui-components/call/ringing-call-content/):

- **Incoming/Outgoing** - Displays [`IncomingCall`](/video/docs/react-native/ui-components/call/incoming-call/) or [`OutgoingCall`](/video/docs/react-native/ui-components/call/outgoing-call/) based on state
- **After accept** - Shows [`CallContent`](/video/docs/react-native/ui-components/call/call-content/)
- **Joining state** - Shows `JoiningCallIndicator`

<gallery>

![Incoming Call](@video/react-native/_assets/ui-components/call/ringing-call-content/incoming-call.png)

![Outgoing Call](@video/react-native/_assets/ui-components/call/ringing-call-content/outgoing-call.png)

</gallery>

```tsx
const App = () => {
  return (
    <View style={styles.container}>
      <RingingCallContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### UI Component Customization

Customize Stream SDK UI components by:

- **Building from scratch** - Use low-level components via UI Cookbook
- **Using built-in components** - Ready-to-use component library
- **Mixing approaches** - Combine custom and built-in components


---

This page was last updated at 2026-04-17T17:34:03.170Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-components/overview/](https://getstream.io/video/docs/react-native/ui-components/overview/).