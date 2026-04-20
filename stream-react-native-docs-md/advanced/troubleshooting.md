# Troubleshooting

This section covers common integration issues that prevent calls from establishing.

## Connection issues

Invalid tokens, network issues, or firewalls can prevent WebSocket connections. Always handle `call.join()` rejections:

```ts
try {
  await call.join();
} catch (err) {
  setError(err); // handle error
}
```

The SDK retries up to three times with exponential backoff. Customize or disable retries:

```ts
try {
  await call.join({ maxJoinRetries: 1 }); // disable retries
} catch (err) {
  setError(err); // handle error
}
```

Connection issues during calls (network switching, poor signal) trigger automatic reconnection. See [Network Disruption guide](/video/docs/react-native/ui-cookbook/network-disruption/).

### Expired tokens

Tokens have expiry dates. Verify token contents at [jwt.io](https://jwt.io).

Provide a `tokenProvider` when creating `StreamVideoClient` to automatically refresh expired tokens.

### Wrong secret for token generation

Tokens from docs won't work - they're generated with demo app secrets. Generate tokens using your app secret from the dashboard.

Verify token signatures at [jwt.io](https://jwt.io). For development, generate tokens [here](/chat/docs/javascript/tokens_and_authentication/). Production requires backend token generation.

### User-token mismatch

Ensure the token matches the user ID provided to `StreamVideoClient`.

## Ringing call issues

Issues typically manifest as missing incoming call screens or failed notification delivery.

### Members of a call

You cannot call yourself. Members must be different users who have connected to Stream at least once (required for device registration and notification delivery).

### Reusing a call id

Call IDs can be reused for joining, but ringing only works once per ID. For ringing calls, use unique IDs (e.g., UUIDs).

### Push notification integration issues

Troubleshooting steps:

- Verify no connection issues (see above)
- Confirm push provider names match `setPushConfig` configuration
- Check **Webhook & Push Logs** in [Stream dashboard](https://dashboard.getstream.io/) for failures

<disclosure label="Push Log Example">

1. Navigate to **Webhook & Push Logs** for Video & Audio.
2. Then filter with log level: "error" with your desired time frame. You should see a list like below.
   ![Preview of the dashboard push error log list](@video/react-native/_assets/advanced/push-notifications/dashboard-push-log-list.png)
3. Tap on a row item, then you should see the corresponding error message as in the example below.
   ![Preview of the dashboard push error log item popup](@video/react-native/_assets/advanced/push-notifications/dashboard-push-log-item.png)

</disclosure>

- Use unique call IDs for ringing calls
- Mount `StreamVideo` at root level for early event listening
- Use `StreamVideoClient.getOrCreateInstance()` instead of `new StreamVideoClient()`

<admonition type="info">

During development, you may be facing a situation where push notification is shown but its events like accepting or rejecting a call don't work. This is because, during hot module reloading the global event listeners may get de-registered. To properly test during development, make sure that you fully restart the app or test in release mode without the metro packager.

</admonition>

#### iOS specific

- Disable **Do Not Disturb** and other focuses that block CallKit
- Verify VoIP certificate matches dashboard bundle ID
- Confirm app uses correct bundle ID
- Add **Push Notifications Capability** in Xcode
- Enable background modes: processing, remote-notification, voip
- Test with [third-party VoIP notification service](https://apnspush.com/)

<admonition type="info">

Note that if you have failed to report a VoIP notification to `CallKit`, the operating system may stop sending you notifications. In those cases, you need to re-install the app and try again.

</admonition>

#### Android specific

- Grant notification permissions
- Disable **Do Not Disturb**
- Check OS battery/performance settings (e.g., **Deep Clear** on OnePlus) that block killed-app notifications

## Logging

### SDK logging

Enable verbose logging for debugging call flows. Default level is `warn`. Options: `trace`, `debug`, `info`, `error`.

```ts
import { StreamVideoClient, Logger } from "@stream-io/video-react-native-sdk";

const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  token,
  user,
  options: {
    logLevel: "info",
  },
});
```

### WebRTC behaviour logging

Enable native WebRTC logs for debugging media packets and peer connections. View in Android Studio or Xcode.

#### iOS

<tabs>

<tabs-item value="swift" label="Swift">

```swift title="AppDelegate.swift"
import stream_react_native_webrtc

override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
  let options = WebRTCModuleOptions.sharedInstance()
  options.enableMultitaskingCameraAccess = true
  options.loggingSeverity = .verbose

  // the rest
}
```

</tabs-item>

<tabs-item value="objc" label="Objective-C">

```objc title="AppDelegate.mm"
#import "WebRTCModuleOptions.h"

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  WebRTCModuleOptions *options = [WebRTCModuleOptions sharedInstance];
  options.loggingSeverity = RTCLoggingSeverityVerbose;
  // the rest
}
```

</tabs-item>

</tabs>

#### Android

```kt title="MainApplication.kt"
import com.oney.WebRTCModule.WebRTCModuleOptions
import org.webrtc.Logging

override fun onCreate() {
  val options: WebRTCModuleOptions = WebRTCModuleOptions.getInstance()
  options.loggingSeverity = Logging.Severity.LS_VERBOSE

  // the rest
}
```

## Common Errors

### Error: "Illegal State: call.join() shall be called only once"

`call.join()` invoked multiple times, often from component re-renders. Ensure single invocation.

### iOS Silent Mode / Audio Not Playing

Audio may not play on iOS when the device is in silent mode.

### Android: Incoming calls not ringing when app is in background/killed

Common fixes:

1. Use singleton client:

   ```tsx
   const client = StreamVideoClient.getOrCreateInstance({
     apiKey,
     user,
     token,
   });
   ```

2. Mount `<StreamVideo>` at app root level

3. Verify Firebase: FCM handlers, background handler, permissions (POST_NOTIFICATIONS, FOREGROUND_SERVICE)

4. Grant runtime notification permission on Android 13+

5. Enable notification channels in system settings

6. Manually launch [force-stopped](https://developer.android.com/reference/android/content/pm/ApplicationInfo#FLAG_STOPPED) apps - system limitation blocks push until user interaction. See [Ringing Setup guide](/video/docs/react-native/incoming-calls/ringing-setup/react-native/).

### Android: CallKeep doesn't work for ringing

CallKeep is iOS-only. Android uses FCM, Notifee, full-screen intents, and foreground service. See [Ringing Setup guide](/video/docs/react-native/incoming-calls/ringing-setup/react-native/).

## Platform-Specific Issues

### iOS Simulator Limitations

iOS Simulator lacks camera/microphone support. Test on physical devices.

### Android Battery Drain

Causes: background calls, persistent WebSocket connections, idle foreground services.

End calls when backgrounding:

```tsx
useEffect(() => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "background" && !isInCall) {
      client.disconnectUser();
    }
  });

  return () => subscription.remove();
}, [isInCall]);
```

Run foreground services only during active calls. See [Keeping Call Alive](/video/docs/react-native/guides/keeping-call-alive/).


---

This page was last updated at 2026-04-17T17:34:03.538Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/troubleshooting/](https://getstream.io/video/docs/react-native/advanced/troubleshooting/).