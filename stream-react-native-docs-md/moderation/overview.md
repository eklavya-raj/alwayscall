# Overview

When running calls with a larger audience, you’ll often need moderation features to prevent abuse. Participants can share inappropriate content via

- The video feed
- Audio
- Screen share
- Chat messages
- Username

Stream has tools to help you manage these issues while on a call.

### Kicking & Blocking a member from a call

Call can be configured to only be accessible to their members. To remove a user from a call and prevent from accessing again:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Block user
call.blockUser({ user_id: "sara" });

// kick
call.kickUser({ user_id: "sara" });

// Unblock user
call.unblockUser({ user_id: "sara" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# Block user
call.block_user(user_id='sara')

# Kick user
call.kick_user(user_id='sara')

# Unblock user
call.unblock_user(user_id='sara')
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Block user
call.BlockUser(ctx, &getstream.BlockUserRequest{
  UserID: "sara",
})

// Kick user
call.KickUser(ctx, &getstream.KickUserRequest{
  UserID: "sara",
})

// Unblock user
call.UnblockUser(ctx, &getstream.UnblockUserRequest{
  UserID: "sara",
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Block user
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/unblock?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "sara"
  }'

# Kick user
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/kick?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "sara"
  }'

# Unblock user
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/unblock?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "sara"
  }'
```

</tabs-item>

</tabs>

### Call permissions

You can configure if a screen share is enabled, disabled or requires requesting permission

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.update({
  settings_override: {
    screensharing: { enabled: true, access_request_enabled: true },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import CallSettingsRequest

call.update(
    settings_override=CallSettingsRequest(
        screensharing=ScreensharingSettingsRequest(
            enabled=True, access_request_enabled=True
        ),
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.Update(ctx, &getstream.UpdateCallRequest{
  SettingsOverride: &getstream.CallSettingsRequest{
    Screensharing: &getstream.ScreensharingSettingsRequest{
      Enabled:              getstream.PtrTo(true),
      AccessRequestEnabled: getstream.PtrTo(true),
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PATCH "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "created_by_id": "john",
      "settings_override": {
        "screensharing": {
          "enabled": true,
          "access_request_enabled": true
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

### Muting everyone

You can also mute every other participant’s video or audio.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// You can specify which kind of stream(s) to mute
call.muteUsers({
  mute_all_users: true,
  audio: true,
  muted_by_id: "john",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# You can specify which kind of stream(s) to mute
call.mute_users(
    mute_all_users=True,
    audio=True,
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// You can specify which kind of stream(s) to mute
call.MuteUsers(ctx, &getstream.MuteUsersRequest{
  MuteAllUsers: getstream.PtrTo(true),
  Audio:       getstream.PtrTo(true),
  MutedByID:   getstream.PtrTo("john"),
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/mute_users?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "mute_all_users": true,
    "audio": true,
    "muted_by_id": "john"
  }'
```

</tabs-item>

</tabs>

### Muting one participant's video or audio (or both)

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.muteUsers({
  user_ids: ["sara"],
  audio: true,
  video: true,
  screenshare: true,
  screenshare_audio: true,
  muted_by_id: "john",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.mute_users(
    muted_by_id=user_id,
    user_ids=[alice.id, bob.id],
    audio=True,
    video=True,
    screenshare=True,
    screenshare_audio=True,
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.MuteUsers(ctx, &getstream.MuteUsersRequest{
  UserIDs:          []string{alice.id,bob.id},
  Audio:            getstream.PtrTo(true),
  Video:            getstream.PtrTo(true),
  Screenshare:      getstream.PtrTo(true),
	ScreenshareAudio: getstream.PtrTo(true),
  MutedByID:        user_id,
})

```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/mute_users?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "user_ids": ["sara"],
    "audio": true,
    "video": true,
    "screenshare": true,
    "screenshare_audio": true,
    "muted_by_id": "john"
  }'
```

</tabs-item>

</tabs>

### Granting and revoking permissions

It's possible for users to ask for any of the following permissions:

- Sending audio
- Sending video
- Sharing their screen

This feature is very common in audio rooms where users usually have to request permission to speak, but it can be useful in other call types and scenarios as well.

These requests will trigger the `call.permission_request` webhook.

This is how these requests can be accepted:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.updateUserPermissions({
  user_id: "sara",
  grant_permissions: [VideoOwnCapability.SEND_AUDIO],
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import OwnCapability

call.update_user_permissions(
    user_id=alice.id,
    grant_permissions=[OwnCapability.SEND_AUDIO],
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.UpdateUserPermissions(ctx, &getstream.UpdateUserPermissionsRequest{
  UserID:           "sara",
  GrantPermissions: []string{getream.SEND_AUDIO.String()},
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/user_permissions?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{ "user_id": "sara", "grant_permissions": ["send-audio"] }'
```

</tabs-item>

</tabs>

For moderation purposes any user's permission to

- send audio
- send video
- share their screen

can be revoked at any time. This is how it can be done:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.updateUserPermissions({
  user_id: "sara",
  revoke_permissions: [VideoOwnCapability.SEND_AUDIO],
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
from getstream.models import OwnCapability

call.update_user_permissions(
    user_id=alice.id,
    revoke_permissions=[OwnCapability.SEND_AUDIO],
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.UpdateUserPermissions(ctx, &getstream.UpdateUserPermissionsRequest{
  UserID:            "sara",
  RevokePermissions: []string{getream.SEND_AUDIO.String()},
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/user_permissions?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{ "user_id": "sara", "revoke_permissions": ["send-audio"] }'
```

</tabs-item>

</tabs>

### Banning users

Users can be banned, when doing that they are not allowed to join or create calls. Banned users also cannot ring or notify other users.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.moderation.ban({
  target_user_id: "<bad user id>",
  banned_by_id: "<moderator id>",
  reason: "<reason>",
});

// remove the ban for a user
client.moderation.unban({
  target_user_id: "<user id>",
});

// ban a user for 30 minutes
client.moderation.ban({
  target_user_id: "<bad user id>",
  banned_by_id: "<moderator id>",
  timeout: 30,
});

// ban a user and all users sharing the same IP
client.moderation.ban({
  target_user_id: "<bad user id>",
  banned_by_id: "<moderator id>",
  reason: "<reason>",
  ip_ban: true,
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# ban a user
client.ban(
    target_user_id=bad_user.id,
    banned_by_id=moderator.id,
    reason="banned reason here",
)

# remove the ban for a user
client.unban(target_user_id=bad_user.id)

# ban a user for 30 minutes
client.ban(
    target_user_id=bad_user.id,
    banned_by_id=moderator.id,
    timeout=30,
)

# ban a user and all users sharing the same IP
client.ban(
    target_user_id=bad_user.id,
    banned_by_id=moderator.id,
    reason="Banned user and all users sharing the same IP for half hour",
    ip_ban=True,
)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Ban a user
curl -X POST https://video.stream-io-api.com/api/v2/moderation/ban?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "sara",
    "banned_by_id": "john",
    "reason": "banned reason here"
  }'

# Removes ban for user
curl -X DELETE https://video.stream-io-api.com/api/v2/moderation/ban?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "sara"
  }'

# Ban a user for 30 minutes
curl -X POST https://video.stream-io-api.com/api/v2/moderation/ban?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "sara",
    "banned_by_id": "john",
    "timeout": 30
  }'

# Ban a user and all users sharing the same IP
curl -X POST https://video.stream-io-api.com/api/v2/moderation/ban?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "sara",
    "banned_by_id": "john",
    "ip_ban": true
  }'
```

</tabs-item>

</tabs>

### Deactivating users

Deactivated users are no longer able to make any API call or connect to websockets (and receive updates on event of any kind).

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.deactivateUser({
  user_id: '<id>',
});

// reactivate
client.reactivateUsers({
  user_ids: ['<id>'],
});

// deactivating users in bulk is performed asynchronously
const deactivateResponse = client.deactivateUsers({
  user_ids: ['<id1>', '<id2>'...],
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# deactivate one user
client.deactivate_user(user_id=alice.id)

# reactivates the user
client.reactivate_user(user_id=alice.id)

# deactivating users in bulk is performed asynchronously
response = client.deactivate_users(user_ids=[alice.id, bob.id])
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// deactivate one user
response, err := client.DeactivateUser(ctx, "alice", &getstream.DeactivateUserRequest{})

// reactivates the user
_, err = client.ReactivateUser(ctx, "alice", &getstream.ReactivateUserRequest{})

// deactivates users in bulk, this is an async operation
_, err = client.DeactivateUsers(ctx, &getstream.DeactivateUsersRequest{
    UserIds: []string{"alice", "bob"},
})
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
// deactivate one user
client.deactivateUser("john", DeactivateUserRequest.builder().build()).execute();

// reactivates the user
client.reactivateUser("john", ReactivateUserRequest.builder().build()).execute();

// deactivates users in bulk, this is an async operation
client.deactivateUsers(DeactivateUsersRequest.builder().userIds(List.of("<id1>", "<id2>")).build()).execute();
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Deactivate users
curl -X POST https://video.stream-io-api.com/api/v2/users/deactivate?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["sara"]
  }'

# Reactivate users
curl -X POST https://video.stream-io-api.com/api/v2/users/reactivate?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["sara"]
  }'
```

</tabs-item>

</tabs>

Deactivating users in bulk can take some time, this is how you can check the progress:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// Example of monitoring the status of an async task
// The logic is same for all async tasks
const response = await client.exportUsers({
  user_ids: ["<user id1>", "<user id1>"],
});

// you need to poll this endpoint
const taskResponse = await client.getTask({ id: response.task_id });

console.log(taskResponse.status === "completed");
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# Example of monitoring the status of an async task
# The logic is same for all async tasks
response = client.export_users(user_ids=["<user id1>", "<user id1>"])
task_id = response.data.task_id

# get information about the task
task_status = client.get_task(task_id)

# just an example, in reality it can take a few seconds for a task to be processed
if task_status.data.status == "completed":
    print(task_status.data.result)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// Example of monitoring the status of an async task
// The logic is same for all async tasks
response, err := client.ExportUsers(ctx, &getstream.ExportUsersRequest{
    UserIds: []string{"<user id1>", "<user id1>"},
})
taskID := response.Data.TaskID

// get information about the task
taskStatus, err := client.GetTask(ctx, taskID, &getstream.GetTaskRequest{})

// just an example, in reality it can take a few seconds for a task to be processed
if taskStatus.Data.Status == "completed" {
    println("Export is completed")
}
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
var response = client.exportUsers(ExportUsersRequest.builder().userIds(List.of("user-id1", "user-id2")).build()).execute();
var taskID = response.getData().getTaskID();

// get information about the task
var taskStatus = client.getTask(taskID).execute();

// just an example, in reality it can take a few seconds for a task to be processed
if (taskStatus.getData().getStatus().equals("completed")) {
    System.out.println("Export is completed");
}
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# When an operation is async, a task_id will be included in the API response
# That task_id can be used to monitor the status of the task
# When finished, task status will be completed
curl -X GET https://video.stream-io-api.com/api/v2/tasks/${TASK_ID}?api_key=${API_KEY} \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>


For more information, please refer to the [async operations guide](/video/docs/api/misc/async/)


### User blocking

Users can block other users using the API, when a user blocks another it will no longer receive ringing calls or notification from the blocked user.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.blockUsers({
  blocked_user_id: "bob",
  user_id: "alice",
});

client.getBlockedUsers({ user_id: "alice" });

client.unblockUsers({
  blocked_user_id: "bob",
  user_id: "alice",
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# alice blocks bob
client.block_users(blocked_user_id=bob.id, user_id=alice.id)

# list blocked users by alice
response = client.get_blocked_users(user_id=alice.id)

# alice unblocks bob
client.unblock_users(blocked_user_id=bob.id, user_id=alice.id)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// alice blocks bob
client.BlockUsers(ctx, &getstream.BlockUsersRequest{
  BlockedUserID: "bob.ID",
  UserID:        &alice.ID,
})

// list blocked users by alice
response, err := client.GetBlockedUsers(ctx, &getstream.GetBlockedUsersRequest{
  UserID: &alice.ID,
})

// alice unblocks bob
client.UnblockUsers(ctx, &getstream.UnblockUsersRequest{
  BlockedUserID: bob.ID,
  UserID:        &alice.ID,
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST https://video.stream-io-api.com/api/v2/users/block?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H 'Content-Type: application/json' \
  -d '{
      "blocked_user_id": "bob",
      "user_id": "alice"
  }'

USER_ID='alice';
ENCODED_USER_ID=$(echo ${USER_ID} | perl -MURI::Escape -lne 'print uri_escape($_)')

curl -X GET "https://video.stream-io-api.com/api/v2/users/block?api_key=${API_KEY}&user_id=${ENCODED_USER_ID}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

curl -X POST https://video.stream-io-api.com/api/v2/users/unblock?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H 'Content-Type: application/json' \
  -d '{
      "blocked_user_id": "bob",
      "user_id": "alice"
  }'
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:00.923Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/moderation/overview/](https://getstream.io/video/docs/react-native/moderation/overview/).