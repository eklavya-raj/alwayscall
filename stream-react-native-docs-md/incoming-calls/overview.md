# Overview

## Incoming Calls

Build apps with ringing call support. Recipients receive incoming call notifications when a call is initiated.

For implementation details, see the [ringing guide](/video/docs/react-native/incoming-calls/ringing/).

## Best Practices

- **Configure push providers** - Set up Firebase (Android) and APNs/VoIP (iOS) for background notifications
- **Handle all app states** - Support foreground, background, and terminated states
- **Use unique call IDs** - Avoid reusing call IDs to prevent unexpected behavior
- **Request permissions early** - Request notification permissions at an appropriate point in your app flow
- **Test on real devices** - Push notifications require physical devices for testing

## Ringing Options

Incoming call presentation depends on app configuration and state (foreground, background, or terminated).

### In-app Incoming Calls

Display custom incoming call screens when the app is in the foreground. Triggered by ringing WebSocket events with full control over design and behavior. See [RingingCallContent](/video/docs/react-native/ui-components/call/ringing-call-content/) for customization.

<admonition type="info">
This method does not display an incoming call screen if the app is in the background or terminated. To handle such scenarios, proper VoIP push handling is required.
Additionally if VoIP push/CallKit is configured, the system displays a ringing notification alongside the in-app incoming screen when the app is in the foreground.
</admonition>

### CallKit Integration (iOS)

For iOS apps Apple's CallKit framework can be integrated. CallKit enables the app to handle system-level incoming call screens by sending a VoIP push notification from the server, which wakes up the app.
While CallKit provides limited UI customization, it ensures consistent behavior across iOS devices. To learn more about integrating Stream Video with CallKit, refer to the guide for your app below:

- [Vanilla React Native Guide](/video/docs/react-native/incoming-calls/ringing-setup/react-native/)
- [Expo Guide](/video/docs/react-native/incoming-calls/ringing-setup/expo/)

### Firebase & Telecom Integration (Android)

For Android apps running in the background or terminated, Firebase push notifications can be used to handle ringing. These notifications let users join or decline the call and can also launch the app if needed. Android Telecom framework allows to register a call on a system level providing additional capabilities for managing call state across several devices (Android Auto/Wear OS).  
For step-by-step integration instructions, refer to the guide according to your app below:

- [Vanilla React Native Guide](/video/docs/react-native/incoming-calls/ringing-setup/react-native/)
- [Expo Guide](/video/docs/react-native/incoming-calls/ringing-setup/expo/)

## Non-ringing push notifications

Use standard push notifications for non-ringing events like missed calls or livestream started notifications. Less interactive than ringing notifications but can trigger navigation or display modals. Setup guides:

- [Vanilla React Native Guide](/video/docs/react-native/incoming-calls/other-than-ringing-setup/react-native/)
- [Expo Guide](/video/docs/react-native/incoming-calls/other-than-ringing-setup/expo/)


---

This page was last updated at 2026-04-17T17:34:01.361Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/overview/](https://getstream.io/video/docs/react-native/incoming-calls/overview/).