# Download user feedback

In this section, we will explain how to download them from Stream on the server-side. The user feedback and ratings collected are also shown in our dashboard

To integrate user ratings and feedback please follow the client SDK documentation
to implement the functionality

- [React](/video/docs/react/ui-cookbook/call-quality-rating/)
- [JavaScript](/video/docs/javascript/guides/call-quality-rating/)
- [React Native](/video/docs/react-native/ui-cookbook/user-ratings/)
- [iOS](/video/docs/ios/ui-cookbook/call-quality-rating/)
- [Android](/video/docs/android/ui-cookbook/call-quality-rating/)
- [Flutter](/video/docs/flutter/guides/user-rating/)

## Download user feedback

The collected feedback can be downloaded with the server side SDKs as follows

The example below shows fetching feedback (with built-in pagination support) using our SDK client

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback()
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

response, err := client.Video().QueryUserFeedback(
    context.Background(),
    &getstream.QueryUserFeedbackRequest{},
)
```

</codetabs-item>

</codetabs>

You can filter the feedback by various criteria. The table lists supported filter types
and their description

| Filter          | Description                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Call CID        | Filter feedback submitted for a particular call CID                                                              |
| User ID         | Filter feedback submitted by a particular user                                                                   |
| User rating     | Filter reports by user rating (supports less than, greater than etc operators)                                   |
| Call Session ID | (Advanced) When you re-use call CID, they will have different session IDs. For example, think of recurring calls |

The examples below show various common use cases. It is also possible to use multiple filters to
narrow the query results.

## Filter by call

The below example shows downloading all the feedback submitted for the call "call CID"

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const callCID = "default:1234";
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    call_cid: callCID,
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
call_cid = "default:1234"
response = client.video.query_user_feedback(
    filter_conditions={
        'call_cid': call_cid,
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

callCID := "default:1234"
response, err := client.Video().QueryUserFeedback(
    context.Background(),
    &getstream.QueryUserFeedbackRequest{
        FilterConditions: map[string]any{
            "call_cid": callCID,
        },
    },
)
```

</codetabs-item>

</codetabs>

An advanced use case is specifying both call CID and the call session ID.

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const callCID = "default:1234";
const callSessionID = "d1a5803b-6121-4fc2-b070-e5eed3277ed4";
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    call_cid: callCID,
    call_session_id: callSessionID,
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
call_cid = "default:1234"
call_session_id = "d1a5803b-6121-4fc2-b070-e5eed3277ed4"
response = client.video.query_user_feedback(
    filter_conditions={
        "call_cid": call_cid,
        "call_session_id": call_session_id,
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

callCID := "default:1234"
callSessionID := "d1a5803b-6121-4fc2-b070-e5eed3277ed4"
response, err := client.Video().QueryUserFeedback(
    context.Background(),
    &getstream.QueryUserFeedbackRequest{
        FilterConditions: map[string]any{
            "call_cid": callCID,
            "call_session_id": callSessionID,
        },
    },
)
```

</codetabs-item>

</codetabs>

## Filter by user(s)

This example demonstrates downloading feedback from a user across calls

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const userID = "foo";
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    user_id: callCID,
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
user_id = "foo"
response = client.video.query_user_feedback(
    filter_conditions={
        'user_id': user_id,
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

userID := "foo"
response, err := client.Video().QueryUserFeedback(
    context.Background(),
    &getstream.QueryUserFeedbackRequest{
        FilterConditions: map[string]any{
            "user_id": userID,
        },
    },
)
```

</codetabs-item>

</codetabs>

A slight variation of the previous example is querying feedback for multiple users at the same time

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const users = ["foo", "bar"];
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    user_id: { $in: users },
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
users = ['foo', 'bar']
response = client.video.query_user_feedback(
    filter_conditions = {
        'user_id': { '$in': users }
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

users := []string{"foo", "bar"}
response, err := client.Video().QueryUserFeedback(context.Background(), &getstream.QueryUserFeedbackRequest{
    FilterConditions: map[string]any{
        "call_cid": map[string]any{ "$in": users },
    },
})
```

</codetabs-item>

</codetabs>

## Filter by rating

Reports can be filtered by ratings. More often than not, negative reports are more interesting and people
usually report only when they run into some issues.

1. Negative feedback (rated less than 3)

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    rating: { $lt: 3 },
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback(
    filter_conditions = {
        'rating': { '$lt': 3 }
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

response, err := client.Video().QueryUserFeedback(context.Background(), &getstream.QueryUserFeedbackRequest{
    FilterConditions: map[string]any{
        "rating": map[string]any{ "$lt": 3 },
    },
})
```

</codetabs-item>

</codetabs>

2. Neutral feedback (rated 3)

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({
  filter_conditions: { rating: 3 },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback(
    filter_conditions = { 'rating': 3 }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

response, err := client.Video().QueryUserFeedback(context.Background(), &getstream.QueryUserFeedbackRequest{
    FilterConditions: map[string]any{"rating": 3},
})
```

</codetabs-item>

</codetabs>

3. Positive feedback (rated 4 or 5)

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    rating: { $gte: 4 },
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback(
    filter_conditions = {
        'rating': { '$gte': 4 }
    }
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

response, err := client.Video().QueryUserFeedback(context.Background(), &getstream.QueryUserFeedbackRequest{
    FilterConditions: map[string]any{
        "rating": map[string]any{ "$gte": 4 },
    },
})
```

</codetabs-item>

</codetabs>

The full list of supported operators is as follows

| Operator | Meaning                         |
| -------- | ------------------------------- |
| `$lte`   | Less than or equal to (`<=`)    |
| `$lt`    | Less than (`<`)                 |
| `$gte`   | Greater than or equal to (`>=`) |
| `$gt`    | Greater than (`>`)              |

## Combine multiple conditions

You can combine multiple conditions. The below example shows querying only the negative feedback provided by a particular user.

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const user = "foo";
const response = await client.video().queryUserFeedback({
  filter_conditions: {
    user_id: user,
    rating: { $lt: 3 },
  },
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
user = "foo"
response = client.video.query_user_feedback(
    filter_conditions = {
        "user_id": user,
        "rating": { "$lt": 3 },
    },
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

user := "foo"
response, err := client.Video().QueryUserFeedback(context.Background(), &getstream.QueryUserFeedbackRequest{
    FilterConditions: map[string]any{
        "user_id": user,
        "rating": map[string]any{
            "$lt": 3,
        },
    },
})
```

</codetabs-item>

</codetabs>

## Specifying sort order

By default, most recent feedback is returned. However, you can specify the sort condition so that the
earliest reported feedback is returned

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({
  sort: [
    // 1  = ascending order
    // -1 = descending order (default for created_at)
    { field: "created_at", direction: 1 },
  ],
});
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
from getstream.models import SortParamRequest

response = client.video.query_user_feedback(
    sort = [
        SortParamRequest(field = 'created_at', direction = 1),
    ],
)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

createdAtFieldName, ascendingOrder := "created_at", 1
response, err := client.Video().QueryUserFeedback(context.Background(),
    &getstream.QueryUserFeedbackRequest{
        Sort: []getstream.SortParamRequest{
            {
                Field: &createdAtFieldName,
                Direction: &ascendingOrder,
            },
        },
    })
```

</codetabs-item>

</codetabs>

## Specifying the maximum number of items to be retrieved

You can specify the number of items to be retrieved with the limit option.

The following example shows retrieving the 5 most recent feedback received

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({ limit: 5 });
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback(limit = 5)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

limit := 5
response, err := client.Video().QueryUserFeedback(context.Background(),
    &getstream.QueryUserFeedbackRequest{ Limit: &limit })
```

</codetabs-item>

</codetabs>

**Note**: The maximum items that can be retrieved with a single call is 100. If `limit`
parameter exceeds this, then it is an error (HTTP 400)

## Downloading with custom data

By default the custom data is NOT included. However, you can download that with `full` option
as follows

<codetabs>

<codetabs-item value="js" label="JavaScript">

```js
const response = await client.video().queryUserFeedback({ full: true });
```

</codetabs-item>

<codetabs-item value="py" label="Python">

```py
response = client.video.query_user_feedback(full = True)
```

</codetabs-item>

<codetabs-item value="go" label="Go">

```go
import "github.com/GetStream/getstream-go"

downloadCustomData := true
response, err := client.Video().QueryUserFeedback(context.Background(),
    &getstream.QueryUserFeedbackRequest{ Full: &downloadCustomData })
```

</codetabs-item>

</codetabs>


---

This page was last updated at 2026-04-17T17:34:03.151Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/analytics/download-user-feedback/](https://getstream.io/video/docs/react-native/analytics/download-user-feedback/).