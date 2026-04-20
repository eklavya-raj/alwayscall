# Reactions

Reactions enable communication between users when speakers are limited or users are muted.

## Best Practices

- **Keep reactions visible** - Display reactions prominently but non-intrusively
- **Support common emojis** - Include universally understood reactions
- **Auto-dismiss reactions** - Remove reactions after a reasonable duration
- **Allow customization** - Let users choose from multiple reaction options

Send an emoji to the call:

```tsx
const reaction = {
  type: "reaction",
  emoji_code: ":like:",
  custom: {},
};
const call = useCall();
call?.sendReaction(reaction);
```

## Reaction Mapper

The SDK provides a default reaction mapper for emojis. Customize emoji maps by passing your own mapper to the [`supportedReactions`](/video/docs/react-native/ui-components/call/call-content/#supportedreactions/) prop of `CallContent`.

The [`ParticipantReaction`](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Participant/ParticipantView/ParticipantReaction.tsx) component handles the reaction map automatically.

Example:

```tsx
import {
  StreamReactionType,
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const reactions: StreamReactionType[] = [
  {
    type: "reaction",
    emoji_code: ":rolling_on_the_floor_laughing:",
    custom: {},
    icon: "🤣",
  },
  {
    type: "reaction",
    emoji_code: ":like:",
    custom: {},
    icon: "👍",
  },
  {
    type: "reaction",
    emoji_code: ":rocket:",
    custom: {},
    icon: "🚀",
  },
  {
    type: "reaction",
    emoji_code: ":dislike:",
    custom: {},
    icon: "👎",
  },
  {
    type: "reaction",
    emoji_code: ":fireworks:",
    custom: {},
    icon: "🎉",
  },
  {
    type: "reaction",
    emoji_code: ":raised-hands:",
    custom: {},
    icon: "🙌",
  },
  {
    type: "raised-hand",
    emoji_code: ":raised-hand:",
    custom: {},
    icon: "✋",
  },
];

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <CallContent supportedReactions={reactions} />
    </StreamCall>
  );
};
```

Use in [ReactionsControls](https://github.com/GetStream/stream-video-js/blob/main/packages/react-native-sdk/src/components/Call/CallControls/ReactionsButton.tsx) to list and send supported reactions:

```tsx
import {
  StreamReactionType,
  Call,
  CallContent,
  StreamCall,
  ReactionsButton,
} from "@stream-io/video-react-native-sdk";
import { View, StyleSheet } from "react-native";

const reactions: StreamReactionType[] = [
  {
    type: "reaction",
    emoji_code: ":rolling_on_the_floor_laughing:",
    custom: {},
    icon: "🤣",
  },
  {
    type: "reaction",
    emoji_code: ":like:",
    custom: {},
    icon: "👍",
  },
  {
    type: "reaction",
    emoji_code: ":rocket:",
    custom: {},
    icon: "🚀",
  },
  {
    type: "reaction",
    emoji_code: ":dislike:",
    custom: {},
    icon: "👎",
  },
  {
    type: "reaction",
    emoji_code: ":fireworks:",
    custom: {},
    icon: "🎉",
  },
  {
    type: "reaction",
    emoji_code: ":raised-hands:",
    custom: {},
    icon: "🙌",
  },
  {
    type: "raised-hand",
    emoji_code: ":raised-hand:",
    custom: {},
    icon: "✋",
  },
];

const CustomCallControls = () => {
  return (
    <View style={styles.buttonGroup}>
      <ReactionsButton supportedReactions={supportedReactions} />
      {/* Other Call Controls */}
    </View>
  );
};

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <CallContent CallControls={CustomCallControls} />
    </StreamCall>
  );
};

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
  },
});
```

## Custom Participant Reaction

Customize participant reactions by passing your own component to [`CallContent`](/video/docs/react-native/ui-components/call/call-content/).

![Preview of the Custom Participant reaction](@video/react-native/_assets/ui-cookbook/reactions/reaction-custom.png)

Example:

```tsx
import { ParticipantReactionProps } from "@stream-io/video-react-native-sdk";
import { StyleSheet, Text, View } from "react-native";

const CustomParticipantReaction = ({
  participant,
  supportedReactions,
}: ParticipantReactionProps) => {
  const { reaction } = participant;

  const currentReaction =
    reaction &&
    supportedReactions.find(
      (supportedReaction) =>
        supportedReaction.emoji_code === reaction.emoji_code,
    );

  return (
    <View style={styles.background}>
      <Text style={styles.reaction}>{currentReaction?.icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: Z_INDEX.IN_FRONT,
  },
  reaction: {
    fontSize: 50,
  },
});
```

## Final Steps

Pass the custom component to the [`ParticipantReaction`](/video/docs/react-native/ui-components/call/call-content/#participantreaction/) prop of [`CallContent`](/video/docs/react-native/ui-components/call/call-content/):

```tsx {35,36}
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  const reactions: StreamReactionType[] = [
    {
      type: "reaction",
      emoji_code: ":rolling_on_the_floor_laughing:",
      custom: {},
      icon: "🤣",
    },
    {
      type: "reaction",
      emoji_code: ":like:",
      custom: {},
      icon: "👍",
    },
    {
      type: "reaction",
      emoji_code: ":rocket:",
      custom: {},
      icon: "🚀",
    },
    {
      type: "reaction",
      emoji_code: ":dislike:",
      custom: {},
      icon: "👎",
    },
    {
      type: "reaction",
      emoji_code: ":fireworks:",
      custom: {},
      icon: "🎉",
    },
    {
      type: "reaction",
      emoji_code: ":raised-hands:",
      custom: {},
      icon: "🙌",
    },
    {
      type: "raised-hand",
      emoji_code: ":raised-hand:",
      custom: {},
      icon: "✋",
    },
  ];

  return (
    <StreamCall call={call}>
      <CallContent
        supportedReactions={reactions}
        ParticipantReaction={CustomParticipantReaction}
      />
    </StreamCall>
  );
};
```

<admonition type="note">

Access participant data using hooks from `useCallStateHooks`:

- **useParticipants** - Returns details for all participants
- **useRemoteParticipants** - Returns details for remote participants only
- **useConnectedUser / useLocalParticipant** - Returns local participant details

</admonition>


---

This page was last updated at 2026-04-17T17:34:01.296Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/reactions/](https://getstream.io/video/docs/react-native/ui-cookbook/reactions/).