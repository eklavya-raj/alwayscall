# React Native

<admonition type="info">

If you are on version `1.2` or below, you would need to upgrade to `1.3` or above to follow the setup. As `1.3` release had [breaking changes](/video/docs/react-native/migration-guides/1.3.0/) with respect to setting up of push notifications. We recommend to update to the current latest version.

</admonition>

Set up push notifications for non-ringing events (missed calls, livestream started, etc.) in your React Native app.

## Add push provider credentials to Stream

Follow these guides to add push providers:

- **Android** - [Firebase Cloud Messaging](/video/docs/react-native/incoming-calls/push-providers/firebase/)
- **iOS** - [Apple Push Notification Service (APNs)](/video/docs/react-native/incoming-calls/push-providers/apn-voip/)


## Install Dependencies

```bash title=Terminal
yarn add @react-native-firebase/app \
  @react-native-firebase/messaging \
  @notifee/react-native \
  @react-native-community/push-notification-ios

npx pod-install
```

**Package purposes:**

- **@react-native-firebase/app, @react-native-firebase/messaging** - Handle [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) on Android
- **@notifee/react-native** - Customize and display push notifications
- **@react-native-community/push-notification-ios** - Handle [APNs](https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns) notifications on iOS

## Android-specific setup

1. Create a Firebase project at [Firebase console](https://console.firebase.google.com/)
2. Add your Android app in **Project settings** > **Your apps**. Use the same package name as `android.package` in app.json
3. Download **google-services.json** to `/android/app/google-services.json`
4. Enable the `google-services` plugin:

```groovy title="/android/build.gradle" {4}
buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

```groovy title="/android/build.gradle" {2}
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'
```

<admonition type="note">

The **google-services.json** file contains unique and non-secret identifiers of your Firebase project. For more information, see [Understand Firebase Projects](https://firebase.google.com/docs/projects/learn-more#config-files-objects).

</admonition>

## iOS-specific setup

### Disable Firebase installation

Firebase Cloud Messaging is not used for iOS. Disable auto-linking unless Firebase is needed for other purposes. Create `react-native.config.js`:

```js title="react-native.config.js"
module.exports = {
  dependencies: {
    "@react-native-firebase/app": {
      platforms: {
        ios: null,
      },
    },
    "@react-native-firebase/messaging": {
      platforms: {
        ios: null,
      },
    },
  },
};
```

Then run `pod install` to remove the installed pods.

### Add background modes

In Xcode, open `Info.plist` and add `UIBackgroundModes`:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Enable push notifications capability

Enable Push Notifications in Xcode: `Project` > `Signing & Capabilities`.

### Update `AppDelegate.h`

Add imports:

```objc
#import <UserNotifications/UNUserNotificationCenter.h>
```

Add `UNUserNotificationCenterDelegate`. For React-Native v0.71+:

```objc
@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>
```

For React-Native v0.70 and earlier:

```objc
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCen
```

### Update `AppDelegate.m` or `AppDelegate.mm`

#### Add headers

```objc
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
```

#### Add methods

Add notification handling methods:

```objc
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}
//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}
```

Add to `didFinishLaunchingWithOptions`:

```objc {3,4}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  // ...rest
}
```

### Enable push notifications

Enable Push Notifications in Xcode: `Project` > `Signing & Capabilities`.

## Add Push message handlers

Add SDK utility functions to notification listeners.

### Add callbacks to process notifications

Process Firebase messages and display via `@notifee/react-native`:

```ts title="src/utils/setPushMessageHandlers.ts"
import messaging from "@react-native-firebase/messaging";
import {
  isFirebaseStreamVideoMessage,
  firebaseDataHandler,
} from "@stream-io/video-react-native-sdk";

export const setFirebaseListeners = () => {
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
};
```

**Firebase message handlers:**

- **isFirebaseStreamVideoMessage** - Checks if push message is video-related
- **firebaseDataHandler** - Processes message and displays notification via `@notifee/react-native`

<admonition type="tip">

If you had disabled the installation of Firebase on iOS, add the above method only for Android using the Platform-specific extensions for React Native.

For example, say you add the following files in your project:

```shell
setFirebaseListeners.android.ts
setFirebaseListeners.ts
```

The method above must only be added to the file that `.android` extension. The other file must add the method but do nothing like below:

```ts title="setPushMessageListeners.ts"
export const setFirebaseListeners = () => {
  // do nothing
};
```

This is to ensure that `@react-native-firebase/messaging` is only imported on the Android platform.

</admonition>

### Add notification onPress listeners

Android notification press handlers using `@notifee/react-native`:

```tsx title="src/utils/setNotifeeListeners.ts"
import {
  isNotifeeStreamVideoEvent,
  onAndroidNotifeeEvent,
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
    if (isNotifeeStreamVideoEvent(event)) {
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

Add notification listener in your root component using `@react-native-community/push-notification-ios`:

```tsx
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import {
  isPushNotificationiOSStreamVideoEvent,
  onPushNotificationiOSStreamVideoEvent,
} from "@stream-io/video-react-native-sdk";

useEffect(() => {
  PushNotificationIOS.addEventListener("notification", (notification) => {
    if (isPushNotificationiOSStreamVideoEvent(notification)) {
      onPushNotificationiOSStreamVideoEvent(notification);
    } else {
      // any other APN notifications
    }
  });
  return () => {
    PushNotificationIOS.removeEventListener("notification");
  };
}, []);
```

## Setup the push config for the SDK

Configure push via `StreamVideoRN.setPushConfig`.

### Add static navigation

Enable navigation when tapped from push notification before JS is ready. See [navigating without navigation prop](https://reactnavigation.org/docs/navigating-without-navigation-prop/):

```ts title="src/utils/staticNavigation.ts" {14,15,16,17,18,19,20}
import { createNavigationContainerRef } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * This is used to run the navigation logic from root level even before the navigation is ready
 */
export const staticNavigate = (
  ...navigationArgs: Parameters<typeof navigationRef.navigate>
) => {
  // note the use of setInterval, it is responsible for constantly checking if requirements are met and then navigating
  const intervalId = setInterval(async () => {
    // run only when the navigation is ready and add any other requirements (like authentication)
    if (navigationRef.isReady() && GlobalState.hasAuthentication) {
      clearInterval(intervalId);
      navigationRef.navigate(...navigationArgs);
    }
  }, 300);
};
```

Set `navigationRef` in your navigation container:

```ts {3}
import { navigationRef } from './src/utils/staticNavigationUtils';

<NavigationContainer ref={navigationRef}>
  <MyAppNavigator />
</NavigationContainer>;
```

### Setup the push config

Configure push settings. Override notification texts, set push provider names, and customize navigation:

```ts title="src/utils/setPushConfig.ts"
import {
  StreamVideoClient,
  StreamVideoRN,
} from "@stream-io/video-react-native-sdk";
import { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STREAM_API_KEY } from "../../constants";
import { staticNavigate } from "./staticNavigationUtils";

export function setPushConfig() {
  StreamVideoRN.setPushConfig({
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
        staticNavigate({ name: "LiveStreamCallScreen", params: undefined });
      } else {
        staticNavigate({ name: "ActiveCallScreen", params: undefined });
      }
    },
    // add the async callback to create a video client
    // for incoming calls in the background on a push notification
    createStreamVideoClient: async () => {
      // note that since the method is async,
      // you can call your server to get the user data or token or retrieve from offline storage.
      const userId = await AsyncStorage.getItem("@userId");
      const userName = await AsyncStorage.getItem("@userName");
      if (!userId) return undefined;
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

Set `android.smallIcon` for best results. Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-notification.html#source.type=clipart&source.clipart=ac_unit&source.space.trim=1&source.space.pad=0&name=ic_notification) to generate icons with correct settings.

</admonition>


## Call the created methods outside of the application lifecycle

Call configuration methods alongside `AppRegistry.registerComponent()`. This ensures configuration is available when the app opens from a push notification:

```js title="index.js" {2,3,4,7,8,9}
import { AppRegistry } from "react-native";
import { setPushConfig } from "src/utils/setPushConfig";
import { setNotifeeListeners } from "src/utils/setNotifeeListeners";
import { setFirebaseListeners } from "src/utils/setFirebaseListeners";
import App from "./App";

setPushConfig();
setNotifeeListeners();
setFirebaseListeners();
AppRegistry.registerComponent("app", () => App);
```

## Request for notification permissions

Request permissions using [`react-native-permissions`](https://github.com/zoontek/react-native-permissions):

```js
import { requestNotifications } from "react-native-permissions";

// This will request POST_NOTIFICATION runtime permission for Anroid 13+
await requestNotifications(["alert", "sound"]);
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

This page was last updated at 2026-04-17T17:34:01.496Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/other-than-ringing-setup/react-native/](https://getstream.io/video/docs/react-native/incoming-calls/other-than-ringing-setup/react-native/).