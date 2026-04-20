# Users

## Users export

Stream allows you to export users with their data, including the calls they participated in.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// request data export for multiple users at once
await client.exportUsers({ user_ids: ["<user id1>", "<user id1>"] });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
# request data export for multiple users at once
client.export_users(user_ids=["<user id1>", "<user id1>"])
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// request data export for multiple users at once
response, err := client.ExportUsers(ctx, &getstream.ExportUsersRequest{
    UserIds: []string{"user1", "user2"},
})
```

</tabs-item>

</tabs>

Exporting users is an async operation, this is how you can check the progress and retrieve the result:

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


For more information, please refer to the [async operations guide](/video/docs/api/misc/async/).

## Users deletion

Stream allows you to delete users and optionally the calls they were part of.  
Note that this apply only to 1:1 calls, not group calls.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.deleteUsers({ user_ids: ["<id>"] });

//restore
client.restoreUsers({ user_ids: ["<id>"] });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.delete_users(user_ids=["<id>"])

# restore
client.restore_users(user_ids=["<id>"])
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
response, err := client.DeleteUsers(ctx, &getstream.DeleteUsersRequest{UserIds: []string{"<id>"}})

// restore a soft-deleted user
_, err = client.RestoreUsers(ctx, &getstream.RestoreUsersRequest{UserIds: []string{"<id>"}})
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
client.deleteUsers(DeleteUsersRequest.builder().userIds(List.of("user-id1", "user-id2")).build()).execute();

// restore a soft-deleted users
client.restoreUsers(RestoreUsersRequest.builder().userIds(List.of("user-id1", "user-id2")).build()).execute();
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Delete users
curl -X POST https://video.stream-io-api.com/api/v2/users/delete?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["sara"]
  }'

# Restore users
curl -X POST https://video.stream-io-api.com/api/v2/users/restore?api_key=${API_KEY} \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["sara"]
  }'
```

</tabs-item>

</tabs>

The delete users endpoints supports the following parameters to control which data needs to be deleted and how. By default users and their data are soft-deleted.

| Name                   | Type                       | Description                                                                                                                                                                                                                                                                                                   | Optional |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `user`                 | Enum (soft, pruning, hard) | - Soft: marks user as deleted and retains all user data. <br /> - Pruning: marks user as deleted and nullifies user information. <br /> - Hard: deletes user completely - this requires hard option for messages and conversation as well.                                                                    | Yes      |
| `conversations`        | Enum (soft, hard)          | - Soft: marks all conversation channels as deleted (same effect as Delete Channels with 'hard' option disabled). <br /> - Hard: deletes channel and all its data completely including messages (same effect as Delete Channels with 'hard' option enabled).                                                   | Yes      |
| `messages`             | Enum (soft, pruning, hard) | - Soft: marks all user messages as deleted without removing any related message data. <br /> - Pruning: marks all user messages as deleted, nullifies message information and removes some message data such as reactions and flags. <br /> - Hard: deletes messages completely with all related information. | Yes      |
| `new_channel_owner_id` | string                     | Channels owned by hard-deleted users will be transferred to this userID. If you doesn't provide a value, the channel owner will have a system generated ID like `delete-user-8219f6578a7395g`                                                                                                                 | Yes      |
| `calls`                | Enum (soft, hard)          | - Soft: marks calls and related data as deleted. <br /> - Hard: deletes calls and related data completely <br /> Note that this applies only to 1:1 calls, not group calls                                                                                                                                    | Yes      |

Deleting users is done asynchronously and and can take some time to complete. You can find more information on how to work with API endpoints performing async work in the [async operations guide](/video/docs/api/misc/async/).



---

This page was last updated at 2026-04-17T17:34:00.929Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/gdpr/users/](https://getstream.io/video/docs/react-native/gdpr/users/).