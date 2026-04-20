# Querying Calls

Query calls and watch them for real-time updates without joining. Build call feeds, dashboards, and discovery features.

## Best Practices

- **Use pagination** - Limit results and use `next`/`prev` for large datasets
- **Enable watch mode** - Set `watch: true` to receive real-time call updates
- **Combine filters** - Use AND/OR operators for complex queries
- **Query custom fields** - Access custom data with `"custom.fieldname"` syntax

Query capabilities:

- **Upcoming calls** - Filter by `starts_at`
- **Live calls** - Filter by `ongoing: true`
- **Popular streams** - Sort by participant count

## Client API

Query calls using the client:

```ts
const { calls } = await client.queryCalls({
  filter_conditions: { ...filters },
  sort: [...sortOptions],
  limit: 25,
  watch: true,
});
```

## Filters

Filter expressions support multiple match criteria and can be combined. Available filter fields:

| Field                | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `id`                 | The id for this call                                          |
| `cid`                | The cid for this call. IE: `default:123`                      |
| `team`               | The team id for the call.                                     |
| `type`               | The call type. Typically `default`, `livestream` etc...       |
| `created_by_user_id` | The user id who created the call                              |
| `created_at`         | When the call was created                                     |
| `updated_at`         | When the call was updated                                     |
| `ended_at`           | When the call ended                                           |
| `starts_at`          | When the call starts at                                       |
| `backstage`          | If the call is in backstage mode or not                       |
| `members`            | Check if the call has these members listed                    |
| `ongoing`            | Check if the call is ongoing or not                           |
| `custom`             | You can query custom data using the `"custom.myfield"` syntax |

For more information, visit the [filter operators guide](/chat/docs/react/query_syntax_operators/).

### Calls that are about to start

Query livestream calls starting within 30 minutes:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const inNext30mins = new Date(Date.now() + 1000 * 60 * 60 * 30);

const { calls } = await client.queryCalls({
  filter_conditions: {
    type: { $eq: "livestream" },
    starts_at: { $gt: inNext30mins.toISOString() },
  },
  sort: [{ field: "starts_at", direction: -1 }],
  limit: 10,
  watch: true,
});
```

### Call filters on a custom property

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const { calls } = await client.queryCalls({
  filter_conditions: { "custom.color": "red" },
  limit: 10,
  watch: true,
});
```

### Calls that are ongoing / currently have participants

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const { calls } = await client.queryCalls({
  filter_conditions: { ongoing: true },
});
```

### Calls the user has created or is a member of

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const { calls } = await client.queryCalls({
  filter_conditions: {
    $or: [
      { created_by_user_id: "<user id>" },
      { members: { $in: ["<user id>"] } },
    ],
  },
  limit: 10,
  watch: true,
});
```

## Sorting

The `SortParamRequest` model contains two properties: `field` and `direction`.

The `direction` can be `1` for ascending and `-1` for descending, while the field can be one of the following values:

| Field        | Description                                             |
| ------------ | ------------------------------------------------------- |
| `starts_at`  | When the call starts at                                 |
| `created_at` | When the call was created                               |
| `updated_at` | When the call was updated                               |
| `ended_at`   | When the call ended                                     |
| `type`       | The call type. Typically `default`, `livestream` etc... |
| `id`         | The id for this call                                    |
| `cid`        | The cid for this call. IE: `default:123`                |

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const { calls } = await client.queryCalls({
  sort: [{ field: "starts_at", direction: -1 }],
  limit: 10,
  watch: true,
});
```

It's possible to provide multiple sort parameters:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const { calls } = await client.queryCalls({
  sort: [
    { field: "starts_at", direction: -1 },
    { field: "created_at", direction: 1 },
  ],
  limit: 10,
  watch: true,
});
```

## Watching calls

Setting `watch: true` creates a subscription for real-time call data updates. The server sends updates when call data changes (members updated, session started, etc.). Useful for live previews and call dashboards.

## Pagination

Use the `limit` option for page size. The API response includes `prev`/`next` links for pagination:

```typescript
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

let client: StreamVideoClient;

const inNext30mins = new Date(Date.now() + 1000 * 60 * 60 * 30);
const callQuery = {
  filter_conditions: {
    type: { $eq: "livestream" },
    starts_at: { $gt: inNext30mins.toISOString() },
  },
  sort: [{ field: "starts_at", direction: -1 }],
  limit: 10,
  watch: true,
};

let { calls, prev, next } = await client.queryCalls(callQuery);

// Go to the next page
({ calls, prev, next } = await client.queryCalls({ ...callQuery, next }));

// Go to the previous page
({ calls, prev, next } = await client.queryCalls({ ...callQuery, prev }));
```


---

This page was last updated at 2026-04-17T17:34:00.796Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/querying-calls/](https://getstream.io/video/docs/react-native/guides/querying-calls/).