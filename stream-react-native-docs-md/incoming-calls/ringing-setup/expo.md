# Expo

<admonition type="info">

If you are on version `1.31.0` or below, you would need to upgrade to `1.32.0` or above to follow the setup. As `1.32.0` release had [breaking changes](/video/docs/react-native/migration-guides/1.32.0/) with respect to setting up of push notifications and CallKit integration. We recommend to update to the current latest version. Additionally, the ringing flow requires `@stream-io/react-native-webrtc` version `137.1.2` or higher.

</admonition>

Add push notifications for ringing calls to your Expo project. Covers both Android and iOS setup.

Users receive push notifications for incoming calls and can accept or reject directly from the notification.

| Android preview                                                                                                                   | iOS preview                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Android preview of the Firebase push notification](@video/react-native/_assets/advanced/push-notifications/android-preview.png) | ![iOS preview of VoIP notification using Apple Push Notification service (APNs)](@video/react-native/_assets/advanced/push-notifications/ios-preview.png) |

<admonition type="info">

Full-screen notifications are displayed when the phone screen is locked or the app is active (foreground state). However, when the app is terminated or in the background and the screen is awake, notifications may appear as heads-up notifications instead of a full-screen alerts.

</admonition>

## Add push provider credentials to Stream

Follow these guides to add push providers:

- **Android** - [Firebase Cloud Messaging](/video/docs/react-native/incoming-calls/push-providers/firebase/)
- **iOS** - [Apple Push Notification Service (APNs)](/video/docs/react-native/incoming-calls/push-providers/apn-voip/)


## Install Dependencies

```bash title=Terminal
npx expo install \
  @react-native-firebase/app \
  @react-native-firebase/messaging \
  @stream-io/react-native-callingx
```

**Package purposes:**

- `@react-native-firebase/app` and `@react-native-firebase/messaging` for handling incoming [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) notifications on Android.
- `@stream-io/react-native-callingx` for registering calls in [iOS CallKit](https://developer.apple.com/documentation/callkit) and [Android Telecom](https://developer.android.com/develop/connectivity/telecom).

## Add Firebase credentials

1. Create a Firebase project at [Firebase console](https://console.firebase.google.com/)
2. Add your Android app in **Project settings** > **Your apps**. Use the same package name as `android.package` in app.json
3. Download **google-services.json** to your project root
4. Add to **app.json**:

```json title="app.json"
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

5. For iOS, add your Apple app in **Project settings** > **Your apps**. Use the same bundle ID as `ios.bundleIdentifier` in app.json
6. Download **GoogleService-Info.plist** to your project root
7. Add to **app.json**:

```json title="app.json"
{
  "ios": {
    "googleServicesFile": "./GoogleService-Info.plist"
  }
}
```

<admonition type="info">

The **google-services.json** and **GoogleService-Info.plist** files contain unique and non-secret identifiers of your Firebase project. For more information, see [Understand Firebase Projects](https://firebase.google.com/docs/projects/learn-more#config-files-objects).

</admonition>

<admonition type="note">

We will not be using firebase for iOS. But it is necessary for the setup for react-native-firebase to have the **GoogleService-Info.plist** file.

</admonition>

### iOS - Notifications entitlement

For Expo SDK 51+, add the notifications entitlement to `app.json`:

```json title="app.json"
{
  "expo": {
    "ios": {
      "entitlements": {
        "aps-environment": "production"
      }
    }
  }
}
```

### Add the config plugin properties

In **app.json**, in the `plugins` field, add the `ringing` property to the `@stream-io/video-react-native-sdk` plugin.

```json title="app.json" {6,17,18,22-29}
{
  "plugins": [
    [
      "@stream-io/video-react-native-sdk",
      {
        "ringing": true
      }
    ],
    [
      "@config-plugins/react-native-webrtc",
      {
        "cameraPermission": "$(PRODUCT_NAME) requires camera access in order to capture and transmit video",
        "microphonePermission": "$(PRODUCT_NAME) requires microphone access in order to capture and transmit audio"
      }
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static",
          "forceStaticLinking": [
            "RNFBApp",
            "RNFBMessaging",
            "stream-react-native-webrtc"
          ]
        }
      }
    ]
    // your other plugins
  ]
}
```

<admonition type="note">

- For iOS only:
  - `firebase-ios-sdk` requires static frameworks then you want to configure `expo-build-properties` by adding `"useFrameworks": "static"`.
  - Since Expo 54, `forceStaticLinking` is [required](https://github.com/expo/expo/pull/39742) for certain libraries when `"useFrameworks": "static"` is used.

</admonition>

<admonition type="info">

The plugin adds a foreground service and the necessary permissions for Android. It shows incoming call notifications and keeps video/audio calls active when the app is in the background.

When uploading the app to the Play Store, declare these permissions in the Play Console and explain their usage, including a link to a video demonstrating the service. This is a one-time requirement. For more information, click [here](https://support.google.com/googleplay/android-developer/answer/13392821).

The added permissions are:

- `android.permission.FOREGROUND_SERVICE_PHONE_CALL` - To maintain active video and audio calls when app goes to background

</admonition>

<admonition type="tip">

If Expo EAS build is not used, please do `npx expo prebuild --clean` to generate the native directories again after adding the config plugins.

</admonition>

### Optional: Disable Firebase integration on iOS

Disable Firebase APNs registration since iOS uses VoIP push. Create `firebase.json`:

```json title="{projectRoot}/firebase.json"
{
  "react-native": {
    "messaging_ios_auto_register_for_remote_messages": false
  }
}
```

## Add Firebase message handlers

Add SDK utility functions to Firebase notification listeners:

```ts title="src/utils/setFirebaseListeners.ts"
import messaging from "@react-native-firebase/messaging";
import {
  isFirebaseStreamVideoMessage,
  firebaseDataHandler,
} from "@stream-io/video-react-native-sdk";

export const setFirebaseListeners = () => {
  // Set up the background message handler
  messaging().setBackgroundMessageHandler(async (msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      await firebaseDataHandler(msg.data);
    } else {
      // your other background notifications (if any)
    }
  });

  // Optionally: set up the foreground message handler
  messaging().onMessage((msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      firebaseDataHandler(msg.data);
    } else {
      // your other foreground notifications (if any)
    }
  });
};
```

**Firebase message handlers:**

- The `onMessage` handler should not be added if you do not want notifications to show up when the app is in the foreground. When the app is in foreground, you would automatically see the incoming call screen.
- The `isFirebaseStreamVideoMessage` method is used to check if this push message is a video related message. And only this needs to be processed by the SDK.
- The `firebaseDataHandler` method is the callback to be invoked to process the message. This callback reads the message and display push notifications.

<admonition type="tip">

If you have disabled the initialization of Firebase on iOS, add the above method only for Android using the Platform-specific extensions for React Native.

For example, say you add the following files in your project:

```shell
setFirebaseListeners.android.ts
setFirebaseListeners.ts
```

The method above must only be added to the file that `.android` extension. The other file must add the method but do nothing like below:

```ts title="setFirebaseListeners.ts"
export const setFirebaseListeners = () => {
  // do nothing
};
```

</admonition>

## Setup the push notifications configuration for the SDK

The SDK automatically processes the incoming push notifications once the setup above is done if the push notifications configuration has been set using `StreamVideoRN.setPushConfig`.
Also you can override the default notification texts and adjust ringtone for both iOS CallKit and Android Telecom.

Below is an example of how these methods can be called:

```ts title="src/utils/setPushConfig.ts"
import {
  StreamVideoClient,
  StreamVideoRN,
  User,
} from "@stream-io/video-react-native-sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STREAM_API_KEY } from "../../constants";

export function setPushConfig() {
  StreamVideoRN.setPushConfig({
    ios: {
      // add your push_provider_name for iOS that you have setup in Stream dashboard
      pushProviderName: __DEV__ ? "apn-video-staging" : "apn-video-production",
      supportsVideo: true,
      callsHistory: true,
      displayCallTimeout: 60000,
    },

    android: {
      // add your push_provider_name for Android that you have setup in Stream dashboard
      pushProviderName: __DEV__
        ? "firebase-video-staging"
        : "firebase-video-production",
      incomingChannel: {
        id: "incoming_call_channel",
        name: "Call notifications",
        vibration: true,
      },
      notificationTexts: {
        accepting: "Connecting...",
        rejecting: "Declining...",
      },
    },

    shouldRejectCallWhenBusy: true,
    enableOngoingCalls: true,

    // add the async callback to create a video client
    // for incoming calls in the background on a push notification
    createStreamVideoClient: async () => {
      const userId = await AsyncStorage.getItem("@userId");
      const userName = await AsyncStorage.getItem("@userName");
      if (!userId) return undefined;

      // an example promise to fetch token from your server
      const tokenProvider = async (): Promise<string> =>
        yourServerAPI.getTokenForUser(userId).then((auth) => auth.token);

      const user: User = { id: userId, name: userName };
      return StreamVideoClient.getOrCreateInstance({
        apiKey: STREAM_API_KEY, // pass your stream api key
        user,
        tokenProvider,
        options: { rejectCallWhenBusy: true },
      });
    },
  });
}
```

<admonition type="warning">

Always use `StreamVideoClient.getOrCreateInstance(..)` instead of `new StreamVideoClient(..)`. Reusing the client instance preserves call accept/decline states changed while the app was in the background. The `getOrCreateInstance` method ensures the same user reuses the existing instance.

</admonition>


**iOS calling experience options:**

- `supportsVideo` - tells CallKit that video calls should be supported. Affects system UI and routing. Default value is `true`.
- `callsHistory` - enables calls history. When enabled, all registered calls will be displayed in recent calls section in default dial app. Default value is `false`.
- `displayCallTimeout` – timeout value in ms which will be used to hide system UI if JS is not loaded during that time. Default value is `60000`.
- `sound` - ringtone resource name that will be used by CallKit. Detailed instructions are provided on [CallKit options](/video/docs/react-native/incoming-calls/callkit-optional-setup/) page.
- `imageName` - image resource name that will be used on CallKit dialer UI. Detailed instructions are provided on [CallKit options](/video/docs/react-native/incoming-calls/callkit-optional-setup/) page.

**Android calling experience options:**

- `incomingChannel.id` - notification channel id for incoming calls
- `incomingChannel.name` - notification channel name
- `incomingChannel.sound` - ringtone resource name that will be used for ringing notification. Detailed instructions are provided on [Android custom ringtone](/video/docs/react-native/incoming-calls/android-custom-ringtone/) page.
- `incomingChannel.vibration` - enables vibration for notification channel
- `notificationTexts` – allows to override default texts displayed in notifications for accepting/declining intermediate state. By default, `Connecting...` and `Declining...` will be displayed for corresponding state.
- `titleTransformer` - allows you to modify displayed notification title. Receives member name and `incoming` boolean flag as parameters. By default, just returns the member name value.

**General calling experience options:**

- `shouldRejectCallWhenBusy` – blocks new incoming calls in cases when there is an active ongoing call. Default value is `false`. For setting up call interruption behavior on a client level, please check [Reject call when busy](/video/docs/react-native/ui-cookbook/reject-call-when-busy/). **Note**: for consistent behavior, this flag should be defined both in the client constructor and in `setPushConfig` call.
- `enableOngoingCalls` – enables CallKit/Telecom support for outgoing calls. Default value is `false`.

<admonition type="info">
Please note that all described parameters are optional.
</admonition>


## Initialize SDK push notification methods

Call the methods we have created outside your application cycle. That is, alongside your `AppRegistry.registerComponent()` method call at the entry point of your application code. A root file `index.js` is a good place do this as the app can be opened from a dead state through a push notification, and in that case, we need to use the configuration and notification callbacks as soon as the JS bridge is initialized.

```js title="index.js"
import { setPushConfig } from "./utils/setPushConfig";
import { setFirebaseListeners } from "./utils/setFirebaseListeners";

setPushConfig();
setFirebaseListeners();

// always import expo-router/entry at the end of the file
import "expo-router/entry";
```

The `index.js` file must be made as the entry point file to your app. This can be done via editing the `main` property in the `package.json` file:

```json title="package.json"
{
  ...
  "main": "index.js",
  ...
}
```

## Disabling push notifications

Disable push on user logout or user switch:

```ts
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

await StreamVideoRN.onPushLogout();
```

## Android full-screen incoming call view on locked phone

<admonition type="info">

For apps installed on phones running versions Android 13 or lower, the `USE_FULL_SCREEN_INTENT` permission is enabled by default.

For all apps being installed on Android 14 and above, the Google Play Store revokes the `USE_FULL_SCREEN_INTENT` for apps that do not have calling or alarm functionalities. Which means, while submitting your app to the play store, if you do **declare that 'Making and receiving calls' is a 'core' functionality** in your app, this permission is granted by default on Android 14 and above.

If the `USE_FULL_SCREEN_INTENT` permission is not granted, the notification will show up as an expanded heads up notification on the lock screen.

</admonition>

## Incoming and Outgoing call UI in foreground

Show call UIs during ringing calls. See [watching for calls](/video/docs/react-native/incoming-calls/ringing#watch-for-incoming-and-outgoing-calls) for implementation.

## Testing Ringing calls

To test properly:

- Use a real physical device (APNs do not work in simulators).
- Ensure your Firebase/APNs credentials are correctly configured in the Stream Dashboard.
- Ensure your iOS provisioning profile includes Push Notifications capability and the `aps-environment` entitlement.

For the best experience, run the Android and iOS app without the metro bundler to the respective physical devices using the following command:

To generate native code directories:

```bash
npx expo prebuild --clean
```

For iOS:

```bash
npx expo run:ios --no-bundler --device --configuration Release
```

For Android:

```bash
npx expo run:android --no-bundler --device --variant release
```

## Troubleshooting

See the [Troubleshooting guide](/video/docs/react-native/advanced/troubleshooting/) for common issues.


---

This page was last updated at 2026-04-17T17:34:03.467Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/ringing-setup/expo/](https://getstream.io/video/docs/react-native/incoming-calls/ringing-setup/expo/).