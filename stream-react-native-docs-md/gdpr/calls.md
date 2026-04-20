# Calls

## Calls deletion

You can either soft-delete or hard-delete a call and all its related data (members, sessions, recordings, transcriptions).

### Soft delete

Soft-delete a call means that the call and all its related data will not be completely removed from our system but will no longer be accessible via the API.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// soft-delete a call
const resp = await call.delete({
  hard: false,
});
// resp.call contains call information
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Soft-delete a call
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/delete?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "hard": false
  }'
```

</tabs-item>

</tabs>

### Hard delete

<admonition type="note">

_This endpoint requires a server-side authentication._

</admonition>

Hard-delete a call means that the call and all its related data will be completely wiped out from our system.
This action is irrevocable, and the data cannot be recovered.

This operation is done asynchronously and you can use the returned `task_id` to monitor its progress.  
See [how to monitor an async task](/video/docs/api/misc/async/).

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// hard-delete a call
const resp = await call.delete({
  hard: true,
});
// resp.call contains call information
// resp.task_id is the ID to be used for monitoring the task
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Hard-delete a call
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/delete?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "hard": true
  }'
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:03.146Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/gdpr/calls/](https://getstream.io/video/docs/react-native/gdpr/calls/).