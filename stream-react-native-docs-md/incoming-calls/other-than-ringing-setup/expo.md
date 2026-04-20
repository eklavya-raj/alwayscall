# Expo

<admonition type="info">

If you are on version `1.2` or below, you would need to upgrade to `1.3` or above to follow the setup. As `1.3` release had [breaking changes](/video/docs/react-native/migration-guides/1.3.0/) with respect to setting up of push notifications. We recommend to update to the current latest version.

</admonition>

Set up push notifications for non-ringing events (missed calls, livestream started, etc.) in your Expo app.

## Add push provider credentials to Stream

Follow these guides to add push providers:

- **Android** - [Firebase Cloud Messaging](/video/docs/react-native/incoming-calls/push-providers/firebase/)
- **iOS** - [Apple Push Notification Service (APNs)](/video/docs/react-native/incoming-calls/push-providers/apn-voip/)


## Install Dependencies

```bash title=Terminal
npx expo install expo-notifications
npx expo install expo-task-manager
npx expo install @notifee/react-native
```

**Package purposes:**

- **expo-notifications, expo-task-manager** - Handle [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) on Android and iOS
- **@notifee/react-native** - Customize and display push notifications

## Add Firebase credentials

1. Create a Firebase project at [Firebase console](https://console.firebase.google.com/)
2. Add your Android app in **Project settings** > **Your apps**. Use the same package name as `android.package` in app.json
3. Download **google-services.json** to your project root
4. Add to **app.json**:

```js title="app.json"
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

<admonition type="note">

The **google-services.json** file contains unique and non-secret identifiers of your Firebase project. For more information, see [Understand Firebase Projects](https://firebase.google.com/docs/projects/learn-more#config-files-objects).

</admonition>

## iOS - Notifications entitlement

For Expo SDK 51+, add the notifications entitlement to `app.json`:

```js title="app.json"
{
  "expo": {
    "ios": {
      "entitlements": {
        "aps-environment": “production”
      }
    }
  }
}
```

## Add the config plugin property

Enable non-ringing push notifications in `app.json`:

```js title="app.json" {6}
{
 "plugins": [
      [
        "@stream-io/video-react-native-sdk",
        {
           "enableNonRingingPushNotifications": true
        }
      ],
      // your other plugins
  ]
}
```

Without Expo EAS build, run `npx expo prebuild --clean` after adding config plugins.

## Setup the push config for the SDK

Configure push via `StreamVideoRN.setPushConfig`.

### Add static navigation

Enable navigation when tapped from push notification before JS is ready. Use [imperative navigation in expo router](https://docs.expo.dev/routing/navigating-pages/#imperative-navigation):

```ts title="src/utils/staticNavigation.ts"
import { User } from "@stream-io/video-react-native-sdk";
import { router } from "expo-router";

/**
 * This is used to run the navigation logic from root level
 */
export const staticNavigateToActiveCall = () => {
  const intervalId = setInterval(async () => {
    // add any requirements here (like authentication)
    if (GlobalState.hasAuthentication) {
      clearInterval(intervalId);
      router.push("/activecall");
    }
  }, 300);
};

export const staticNavigateToLivestreamCall = () => {
  const intervalId = setInterval(async () => {
    // add any requirements here (like authentication)
    if (GlobalState.hasAuthentication) {
      clearInterval(intervalId);
      router.push("/livestream");
    }
  }, 300);
};
```

## Add Push message handlers

Add SDK utility functions to notification listeners.

### Add callbacks to process notifications

For Android, choose between `@react-native-firebase` (recommended, handles killed state) or `expo-task-manager` (does not handle killed state). iOS uses `expo-notifications`.

<tabs>

<tabs-item value="react-native-firebase" label="@react-native-firebase" default>

Install the library:

```bash title=Terminal
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging
```

Add message handlers:

```ts title="src/utils/setPushMessageHandlers.ts"
import messaging from "@react-native-firebase/messaging";
import {
  isFirebaseStreamVideoMessage,
  firebaseDataHandler,
} from "@stream-io/video-react-native-sdk";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const setPushMessageListeners = () => {
  // Set up the background message handler for Android
  messaging().setBackgroundMessageHandler(async (msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      await firebaseDataHandler(msg.data);
    } else {
      // your other messages (if any)
    }
  });
  // Set up the foreground message handler for Android
  messaging().onMessage((msg) => {
    if (isFirebaseStreamVideoMessage(msg)) {
      firebaseDataHandler(msg.data);
    } else {
      // your other messages (if any)
    }
  });

  if (Platform.OS === "ios") {
    // show notification on foreground on iOS
    Notifications.setNotificationHandler({
      // example configuration below to show alert and play sound
      handleNotification: async (notification) => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
};
```

**Firebase message handlers:**

- **isFirebaseStreamVideoMessage** - Checks if push message is video-related
- **firebaseDataHandler** - Processes message and displays notification via `@notifee/react-native`

**Disable Firebase on iOS**

Disable APNs registration. Create `firebase.json`:

```js title="{projectRoot}/firebase.json"
{
  "react-native": {
    "messaging_ios_auto_register_for_remote_messages": false
  }
}
```

</tabs-item>

<tabs-item value="expo-task-manager" label="expo-task-manager">

Install the library:

```bash title=Terminal
npx expo install expo-task-manager
```

Add message handlers:

```ts title="src/utils/setPushMessageHandlers.ts"
const BACKGROUND_NOTIFICATION_TASK =
    'STREAM-VIDEO-BACKGROUND-NOTIFICATION-TASK';

import {
  isFirebaseStreamVideoMessage,
  firebaseDataHandler,
  isExpoNotificationStreamVideoEvent,
} from '@stream-io/video-react-native-sdk';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const setPushMessageListeners = () => {
  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    ({ data, error }) => {
      if (error) {
        return;
      }
      // @ts-ignore
      const dataToProcess = data.notification?.data;
      if (data?.sender === 'stream.video'} {
        firebaseDataHandler(dataToProcess);
      }
    }
  );
  // background handler (does not handle on app killed state)
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  // foreground handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      if (Platform.OS === 'android' && isExpoNotificationStreamVideoEvent(notification)) {
        const data = notification.request.trigger.remoteMessage?.data!;
        await firebaseDataHandler(data, pushConfig);
        // do not show this message, it processed by the above handler
        return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false };
      } else {
        // configuration for iOS call notification && your other messages, example below to show alert and play sound
        return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false };
      }
    },
  });
};
```

The `firebaseDataHandler` processes the message and displays notifications via `@notifee/react-native`.

  </tabs-item>

</tabs>

### Add notification button listeners

Add notification press handlers:

```ts title="src/utils/setNotifeeListeners.ts"
import {
  isNotifeeStreamVideoEvent,
  onAndroidNotifeeEvent,
  oniOSNotifeeEvent,
} from "@stream-io/video-react-native-sdk";
import { Platform } from "react-native";
import notifee from "@notifee/react-native";

export const setNotifeeListeners = () => {
  // on press handlers of background notifications for Android
  notifee.onBackgroundEvent(async (event) => {
    if (isNotifeeStreamVideoEvent(event)) {
      await onAndroidNotifeeEvent({ event, isBackground: true });
    } else {
      // your other notifications (if any)
    }
  });
  // on press handlers of foreground notifications for Android
  notifee.onForegroundEvent((event) => {
    if (Platform.OS === "android" && isNotifeeStreamVideoEvent(event)) {
      onAndroidNotifeeEvent({ event, isBackground: false });
    } else {
      // your other notifications (if any)
    }
  });
};
```

**Notifee event handlers:**

- **isNotifeeStreamVideoEvent** - Checks if event is video-related
- **onAndroidNotifeeEvent** - Processes accept/decline actions

**iOS handler**

Add in your root component:

```tsx title="App.tsx"
import * as Notifications from "expo-notifications";

useEffect(() => {
  if (Platform.OS === "ios") {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (isExpoNotificationStreamVideoEvent(notification)) {
          oniOSExpoNotificationEvent(notification);
        } else {
          // your other notifications (if any)
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }
}, []);
```

## Setup the push config

Configure push settings. Override notification texts, set push provider names, and customize navigation:

```ts title="src/utils/setPushConfig.ts"
import {
  StreamVideoClient,
  StreamVideoRN,
} from "@stream-io/video-react-native-sdk";
import { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STREAM_API_KEY } from "../../constants";
import {
  staticNavigateToRingingCall,
  staticNavigateToLivestreamCall,
} from "./staticNavigationUtils";

export function setPushConfig() {
  StreamVideoRN.setPushConfig({
    // pass true to inform the SDK that this is an expo app
    isExpo: true,
    ios: {
      // add your push_provider_name for iOS that you have setup in Stream dashboard
      pushProviderName: __DEV__ ? "apn-video-staging" : "apn-video-production",
    },
    android: {
      // the name of android notification icon (Optional, defaults to 'ic_launcher')
      smallIcon: "ic_notification",
      // add your push_provider_name for Android that you have setup in Stream dashboard
      pushProviderName: __DEV__
        ? "firebase-video-staging"
        : "firebase-video-production",
      // configure the notification channel to be used for non ringing calls for Android.
      callChannel: {
        id: "stream_call_notifications",
        name: "Call notifications",
        // This importance will ensure that the notification will appear on-top-of applications.
        importance: AndroidImportance.HIGH,
        sound: "default",
      },
      // configure the functions to create the texts shown in the notification
      // for non ringing calls in Android.
      callNotificationTextGetters: {
        getTitle(type, createdUserName) {
          if (type === "call.live_started") {
            return `Call went live, it was started by ${createdUserName}`;
          } else {
            return `${createdUserName} is notifying you about a call`;
          }
        },
        getBody(_type, createdUserName) {
          return "Tap to open the call";
        },
      },
    },
    // optional: add the callback to be executed when a non ringing call notification is tapped
    onTapNonRingingCallNotification: () => {
      const [callType, callId] = call_cid.split(":");
      if (callType === "livestream") {
        staticNavigateToLivestreamCall();
      } else {
        staticNavigateToActiveCall();
      }
    },
    // add the async callback to create a video client
    // for incoming calls in the background on a push notification
    createStreamVideoClient: async () => {
      // note that since the method is async,
      // you can call your server to get the user data or token or retrieve from offline storage.
      const userId = await AsyncStorage.getItem("@userId");
      const userName = await AsyncStorage.getItem("@userName");
      // an example promise to fetch token from your server
      const tokenProvider = () =>
        yourServer.getTokenForUser(userId).then((auth) => auth.token);
      const user = { id: userId, name: userName };
      return StreamVideoClient.getOrCreateInstance({
        apiKey: STREAM_API_KEY, // pass your stream api key
        user,
        tokenProvider,
      });
    },
  });
}
```

<admonition type="warning">

Always use `StreamVideoClient.getOrCreateInstance(..)` instead of `new StreamVideoClient(..)`. Reusing the client instance preserves call accept/decline states changed while the app was in the background. The `getOrCreateInstance` method ensures the same user reuses the existing instance.

</admonition>


<admonition type="info">

Set `android.smallIcon` for best results. Expo prebuild auto-generates a notification icon named `notification_icon.png` from the app icon. Override it via [`notification.icon`](https://docs.expo.dev/versions/latest/config/app/#notification) in `app.json` or `app.config.js`. Custom icons should be 96x96 PNG grayscale with transparency.

</admonition>


## Call the created methods outside of the application lifecycle

Call configuration methods in `index.js`. This ensures configuration is available when the app opens from a push notification:

```js title="index.js" {6,7,8}
import "expo-router/entry";
import { setPushConfig } from "src/utils/setPushConfig";
import { setNotifeeListeners } from "src/utils/setNotifeeListeners";
import { setPushMessageListeners } from "src/utils/setPushMessageListeners";

setPushConfig();
setNotifeeListeners();
setPushMessageListeners();
```

## Request for notification permissions

Request permissions using Expo:

```js
import * as Notifications from "expo-notifications";

await Notifications.requestPermissionsAsync();
```

## Disabling push - usually on logout

Disable push on user logout or user switch:

```js
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

await StreamVideoRN.onPushLogout();
```

## Troubleshooting

See the [Troubleshooting guide](/video/docs/react-native/advanced/troubleshooting/) for common issues.


---

This page was last updated at 2026-04-17T17:34:03.519Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/other-than-ringing-setup/expo/](https://getstream.io/video/docs/react-native/incoming-calls/other-than-ringing-setup/expo/).