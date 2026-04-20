# Permissions

## Introduction

This page shows how you can create or update roles for a call type.

Stream has a role-based permission system. Each user has an application-level role, and also channel (chat product) and call (video product) level roles. Every role (be it application or call/channel level) contains a list of permissions. A permissions is an action (for example, create a call). The list of permissions assigned to a role defines what a user is allowed to do. Call roles are defined on the call type level.

## Configuring roles

When you create a call type, you can specify your role configurations. A role configuration consists of a role name and the list of permissions that are enabled for that role.

When you create a call type, it comes with a default set of configurations. You can override or extend that.

The following example overrides the permissions of the built-in `admin` role and defines the `customrole`.

Please note that for the below code to work, you need to create the `customrole` beforehand. You can do that in your [Stream Dashboard](https://dashboard.getstream.io/).

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.createCallType({
  name: "<call type name>",
  grants: {
    admin: ["send-audio", "send-video", "mute-users"],
    ["customrole"]: ["send-audio", "send-video"],
  },
});

// or edit a built-in call type
client.video.updateCallType({
  name: "default",
  grants: {
    /* ... */
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.create_call_type(
  name='<call type name>',
  grants={
    "admin": ["send-audio", "send-video", "mute-users"],
    "customrole": ["send-audio", "send-video"],
  },
)

client.video.update_call_type(
  name='default',
  grants={
    /* ... */
  },
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().CreateCallType(ctx, &getstream.CreateCallTypeRequest{
  Name: "allhands",
  Grants: &map[string][]string{
    "admin": {
      "send-audio", "send-video", "mute-users"
    },
    "customrole": {
      "send-audio", "send-video",
    },
  },
})

client.Video().UpdateCallType(
  ctx,
  "default",
  &getstream.UpdateCallTypeRequest{
    Grants: &map[string][]string{
      /* ... */
    },
  },
)
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
client.video().createCallType(
  CreateCallTypeRequest.builder()
    .name("allhands")
    .grants(
      Map.of(
        "admin", List.of("send-audio", "send-video", "mute-users"),
        "customrole", List.of("send-audio", "send-video")
      )
    )
    .build()
).execute();

client.video().updateCallType(
  "default",
  UpdateCallTypeRequest.builder()
    .grants(
      Map.of(
        /* ... */
      )
    )
    .build()
).execute();
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/calltypes?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<call type name>",
    "settings": {
      "audio": {
        "mic_default_on": true,
        "default_device": "speaker"
      }
    },
    "grants": {
      "admin": ["send-audio", "send-video", "mute-users"],
      "customrole": ["send-audio", "send-video"]
    }
  }'

# or edit a built-in call type
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/default?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "grants": {...}
  }'
```

</tabs-item>

</tabs>

See how you can list [permissions](#permissions) below.

### Built-in roles

There are 5 pre-defined call roles, these are:

- `user`
- `moderator`
- `host`
- `admin`
- `call-member`

You can access the default roles and their permissions in your [Stream Dashboard](https://dashboard.getstream.io/).

You can also list roles and their permissions using the Stream API:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.listCallTypes();

//or
client.video.getCallType({ name: "livestream" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.list_call_types()

# or
client.video.get_call_type(name= 'livestream')
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().ListCallTypes(ctx, &getstream.ListCallTypesRequest{})

// or
client.Video().GetCallType(ctx, "livestream", &getstream.GetCallTypeRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X GET "https://video.stream-io-api.com/api/v2/video/calltypes?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# or
curl -X GET "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>


### Permissions

The list of call permissions that you can include in your role configurations:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const response = await client.listPermissions();
console.log(response.permissions);
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
response = client.list_permissions()
print(response.permissions)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
request := &getstream.ListPermissionsRequest{}
response, err := client.ListPermissions(ctx, request)
fmt.Printf("Permissions: %+v\n", response)
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
var request = client.listPermissions();
var response = request.execute();

System.out.println("Permission IDs:");
response.getData().getPermissions().forEach(permission -> {
  System.out.println("- " + permission.getId());
});
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X GET "https://video.stream-io-api.com/api/v2/video/permissions?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

### Capabilities

When users access calls they'll receive an `own_capabilities` field in the call object, which contains all call related capabilities a user is allowed to do. This can be used by client-side SDKs to do permission checks for hiding/showing UI elements (for code examples checkout SDK documentations). Capabilities are not the same as permissions. Permissions are the list of actions the Stream API supports. Capabilities are the list of actions a given user is allowed to do in the scope of a given call taking into account:

- application-level and call-level role of the user
- call type settings
- call-level settings


---

This page was last updated at 2026-04-17T17:34:00.907Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/call_types/permissions/](https://getstream.io/video/docs/react-native/call_types/permissions/).