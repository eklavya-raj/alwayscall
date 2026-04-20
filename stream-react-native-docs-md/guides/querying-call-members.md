# Querying Call Members

Creating or joining a call returns up to 100 members (default: 25):

```typescript
await call.getOrCreate({ members_limit: 100 });
// or
await call.join({ members_limit: 100 });
```

For complete member lists, use the paginated query API to filter and sort call members.

## Examples

Query members API usage:

```typescript
const result = await call.queryMembers();

// sorting and pagination
const queryMembersReq = {
  sort: [{ field: "user_id", direction: 1 }],
  limit: 2,
};
const result = await call.queryMembers(queryMembersReq);

// loading the next page
const result = await call.queryMembers({
  ...queryMembersReq,
  next: result.next,
});

// filtering
const result = await call.queryMembers({
  filter_conditions: { role: { $eq: "admin" } },
});
```

## Sort options

Sorting is supported on these fields:

- `user_id`
- `created_at`


## Filter options

| Name         | Type                                                                                    | Description                                                                        | Supported operators                                 |
| ------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| `user_id`    | string                                                                                  | User ID                                                                            | `$in`, `$eq`, `$gt, $gte`, `$lt`, `$lte`, `$exists` |
| `role`       | string                                                                                  | The role of the user                                                               | `$in`, `$eq`, `$gt, $gte`, `$lt`, `$lte`, `$exists` |
| `custom`     | Object                                                                                  | Search in custom membership data, example syntax: `{'custom.color': {$eq: 'red'}}` | `$in`, `$eq`, `$gt, $gte`, `$lt`, `$lte`, `$exists` |
| `created_at` | string, must be formatted as an RFC3339 timestamp (for example 2021-01-15T09:30:20.45Z) | Creation time of the user                                                          | `$in`, `$eq`, `$gt, $gte`, `$lt`, `$lte`, `$exists` |
| `updated_at` | string, must be formatted as an RFC3339 timestamp (for example 2021-01-15T09:30:20.45Z) | The time of the last update of the user                                            | `$in`, `$eq`, `$gt, $gte`, `$lt`, `$lte`, `$exists` |


The Stream API allows you to specify filters and ordering for several endpoints. The query syntax is similar to that of Mongoose, however we do not run MongoDB on the backend. Only a subset of the MongoDB operations are supported.

| Name            | Description                                                                                               | Example                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `$eq`           | Matches values that are equal to a specified value.                                                       | `{ "key": { "$eq": "value" } }` or the simplest form `{ "key": "value" }` |
| `$q`            | Full text search (matches values where the whole text value matches the specified value)                  | `{ "key": { "$q": "value } }`                                             |
| `$gt`           | Matches values that are greater than a specified value.                                                   | `{ "key": { "$gt": 4 } }`                                                 |
| `$gte`          | Matches values that are greater than or equal to a specified value.                                       | `{ "key": { "$gte": 4 } }`                                                |
| `$lt`           | Matches values that are less than a specified value.                                                      | `{ "key": { "$lt": 4 } }`                                                 |
| `$lte`          | Matches values that are less than or equal to a specified value.                                          | `{ "key": { "$lte": 4 } }`                                                |
| `$in`           | Matches any of the values specified in an array.                                                          | `{ "key": { "$in": [ 1, 2, 4 ] } }`                                       |
| `$exists`       | Mathces values that either have (when set to `true`) or not have (when set to `false`) certain attributes | `{ "key": { "$exists": true } }`                                          |
| `$autocomplete` | Mathces values that start with the specified string value                                                 | `{ "key": { "$autocomplete": "value" } }`                                 |

It's also possible to combine filter expressions with the following operators:

| Name   | Description                                               | Example                                                                       |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `$and` | Matches all the values specified in an array.             | `{ "$and": [ { "key": { "$in": [ 1, 2, 4 ] } }, { "some_other_key": 10 } ] }` |
| `$or`  | Matches at least one of the values specified in an array. | `{ "$or": [ { "key": { "$in": [ 1, 2, 4 ] } }, { "key2": 10 } ] }`            |



---

This page was last updated at 2026-04-17T17:34:03.081Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/querying-call-members/](https://getstream.io/video/docs/react-native/guides/querying-call-members/).