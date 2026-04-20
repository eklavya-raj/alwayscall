# Permissions & Moderation

Control participant permissions and capabilities in calls. Common use case: webinars where hosts control who can speak or share screen.

## Best Practices

- **Use roles appropriately** - Assign call-level roles for granular control
- **Configure call types** - Enable/disable features at the call type level
- **Check capabilities first** - Use `useOwnCapabilities` before showing permission-dependent UI
- **Handle permission requests** - Listen for `call.permission_request` events
- **Revoke permissions carefully** - SDK auto-stops publishing when permissions are revoked

## Conceptual overview

### Roles

Assign global and call-level roles to users. Use predefined roles or create custom ones.

### Call types

[Call types](/video/docs/react-native/guides/configuring-call-types/) provide granular control:

- **Enable/disable features** - Configure at call type level
- **Role configuration** - Define call-level role behavior per call type

### Capabilities

User roles and call type settings determine allowed actions. Access local user capabilities from the `call` instance state.

Use `useOwnCapabilities` hook:

```tsx
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useOwnCapabilities } = useCallStateHooks();
const ownCapabilities = useOwnCapabilities();
```

## Permissions

After joining a call, the `Call` instance provides permission checking and actions:

### Check permissions

```ts
import { OwnCapability } from "@stream-io/video-react-native-sdk";

const call = streamVideoClient.call(type, id);
const canSendAudio = call.permissionsContext.hasPermission(
  OwnCapability.SEND_AUDIO,
);
```

In our React Native Video SDK, you can use the `useHasPermissions` hook to check for permissions.

```tsx
import {
  useCallStateHooks,
  OwnCapability,
} from "@stream-io/video-react-native-sdk";

const { useHasPermissions } = useCallStateHooks();
const canSendAudio = useHasPermissions(OwnCapability.SEND_AUDIO);
```

### Request permissions

Users can request permissions based on call type and settings. Example: In audio-room calls, only hosts have `send-audio` by default; others must request permission.

```ts
import { OwnCapability } from "@stream-io/video-react-native-sdk";

const call = streamVideoClient.call(type, id);
if (!call.permissionsContext.canRequest(OwnCapability.SEND_AUDIO)) {
  console.log("The host has disabled the ability to request this permission");
  return;
}
await call.requestPermissions({
  permissions: [OwnCapability.SEND_AUDIO],
});
```

### Approving permission requests

Hosts and moderators can approve permission requests. Listen for `call.permission_request` events:

```ts
import {
  PermissionRequestEvent,
  StreamCallEvent,
} from "@stream-io/video-react-native-sdk";

const call = streamVideoClient.call(type, id);
call.on("call.permission_request", async (event: StreamCallEvent) => {
  const request = event as PermissionRequestEvent;
  if (shouldApproveRequest(request)) {
    await call.grantPermissions(request.user.id, request.permissions);
  }
});
```

### Moderation

Moderators and hosts can grant or revoke permissions at any time:

```ts
import { OwnCapability } from "@stream-io/video-react-native-sdk";

const call = streamVideoClient.call(type, id);
await call.updateUserPermissions({
  user_id: "demo-user",
  grant_permission: [OwnCapability.SEND_AUDIO, OwnCapability.SEND_VIDEO],
  revoke_permissions: [OwnCapability.SCREENSHARE],
});

// alternate API for granting user permissions:
await call.grantPermissions("demo-user", [
  OwnCapability.SEND_AUDIO,
  OwnCapability.SEND_VIDEO,
]);

// alternate API for revoking user permissions:
await call.revokePermissions("demo-user", [OwnCapability.SCREENSHARE]);
```

Users receive a `call.permissions_updated` WebSocket event. The SDK automatically stops publishing tracks when permissions are revoked.

### Ending call for everyone

End the call for all participants (requires permission):

```ts
const call = streamVideoClient.call(type, id);
await call.endCall();
```

Emits `call.ended` event to all participants. SDK stops publishing and leaves the call. Ended calls cannot be re-joined.

## Users

### Blocking and Unblocking

Block a participant from joining the call:

```ts
const call = client.call(type, id);
await call.blockUser("user-id");

// to unblock
await call.unblockUser("user-id");
```

### Kicking

Kick disconnects a participant but allows re-joining (softer than blocking):

```ts
const call = client.call(type, id);
await call.kickUser({ user_id: "user-id" });

// you can use this shortcut to block the user from re-joining the call:
await call.kickUser({ user_id: "user-id", block: true });
```

### Muting

Mute participants causing unwanted noise (doesn't revoke permission; users can unmute):

```ts
const call = client.call(type, id);
await call.muteUser("demo-user-id", "audio");
await call.muteUser("demo-user-id", "video");
await call.muteUser("demo-user-id", "screenshare");

// or, mute in bulk
await call.muteUser(["demo-user-id", "demo-user-id-2"], "audio");

// or, muting self
await call.muteSelf("audio");

// or, muting others
await call.muteOthers("audio");

// or, mute all, including self.
await call.muteAllUsers("audio");
```

Muting doesn't revoke permissions; users can unmute themselves.


---

This page was last updated at 2026-04-17T17:34:00.818Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/permissions-and-moderation/](https://getstream.io/video/docs/react-native/guides/permissions-and-moderation/).