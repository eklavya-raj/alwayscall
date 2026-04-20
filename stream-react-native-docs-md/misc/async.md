# Asynchronous operations

Certain operations, such as deleting a call or deleting a user, require additional time and processing power. As a result, these operations are executed asynchronously.

These tasks will return a `task_id` in the API response, you can use this id to monitor the task status.

### Monitoring tasks

You can monitor these tasks using the `GetTask` endpoint. Calling this endpoint will provide information such as:

- `status`: Current status of the task (see statuses below for more details)
- `result`: Result of the task, depending on the nature of the task
- `error`: If the task failed, this will contain information about the failure

### Task Statuses

The task can have the following statuses:

- `pending`: Task is pending and not running yet
- `running`: Task is running and not completed yet
- `completed`: Task is completed and successfully executed
- `failed`: Task failed during its execution

### Example

Asynchronous operations will return an ID, which you can use to monitor the task. Here's an example:

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



---

This page was last updated at 2026-04-17T17:34:03.148Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/misc/async/](https://getstream.io/video/docs/react-native/misc/async/).