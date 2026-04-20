# Network Quality Indicator

Network conditions vary, affecting video quality. The default [`ParticipantView`](/video/docs/react-native/ui-components/participants/participant-view/) includes a network quality indicator showing participant connection states:

- **UNSPECIFIED** - Connection quality unknown
- **POOR** - Degraded connection
- **GOOD** - Stable connection
- **EXCELLENT** - Optimal connection

## Best Practices

- **Use clear visual indicators** - Icons or colors that instantly convey quality levels
- **Position consistently** - Place indicators in the same location for all participants
- **Avoid overloading UI** - Show quality only when relevant or on demand
- **Consider accessibility** - Use color and shape for quality indication

![Preview of the Default Network quality indicator](@video/react-native/_assets/ui-cookbook/network-quality-indicator/network-quality-indicator-default.png)

This guide covers building a custom network quality indicator.

## Custom Network Quality Indicator

Display this indicator inside each [ParticipantView](/video/docs/react-native/ui-components/participants/participant-view/) within your call layout.

![Preview of the Custom Network quality indicator](@video/react-native/_assets/ui-cookbook/network-quality-indicator/network-quality-indicator-custom.png)

Example:

```tsx
import { Text, View } from "react-native";
import {
  useParticipants,
  ParticipantNetworkQualityIndicatorProps,
} from "@stream-io/video-react-native-sdk";

const CustomNetworkQualityIndicator = ({
  participant,
}: ParticipantNetworkQualityIndicatorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.connection}>
        {"⭐️".repeat(participant.connectionQuality)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "gray",
    borderRadius: 5,
    alignSelf: "center",
    padding: 5,
  },
  connection: {
    fontSize: 10,
  },
});
```

## Final Steps

Pass the custom component to the [`ParticipantNetworkQualityIndicator`](/video/docs/react-native/ui-components/call/call-content/#participantnetworkqualityindicator/) prop of [`CallContent`](/video/docs/react-native/ui-components/call/call-content/):

```tsx {13-15}
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";

const VideoCallUI = () => {
  let call: Call;
  // your logic to create a new call or get an existing call

  return (
    <StreamCall call={call}>
      <CallContent
        ParticipantNetworkQualityIndicator={CustomNetworkQualityIndicator}
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

This page was last updated at 2026-04-17T17:34:03.333Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/network-quality-indicator/](https://getstream.io/video/docs/react-native/ui-cookbook/network-quality-indicator/).