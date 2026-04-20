# Manage Types

## Read call types

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


## Create call type

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.createCallType({
  name: "allhands",
  settings: {
    audio: {
      mic_default_on: true,
      default_device: "speaker",
    },
  },
  grants: {
    admin: [
      VideoOwnCapability.SEND_AUDIO,
      VideoOwnCapability.SEND_VIDEO,
      VideoOwnCapability.MUTE_USERS,
    ],
    user: [VideoOwnCapability.SEND_AUDIO, VideoOwnCapability.SEND_VIDEO],
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.create_call_type(
  name='allhands',
  settings=CallSettingsRequest(
    audio=AudioSettingsRequest(
      mic_default_on=True,
      default_device='speaker'
    ),
  ),
  grants={
    "admin": [
      OwnCapability.SEND_AUDIO.to_str(),
      OwnCapability.SEND_VIDEO.to_str(),
      OwnCapability.MUTE_USERS.to_str(),
    ],
    "user": [
      OwnCapability.SEND_AUDIO.to_str(),
      OwnCapability.SEND_VIDEO.to_str()
    ],
  },
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().CreateCallType(ctx, &getstream.CreateCallTypeRequest{
  Name: "allhands",
  Settings: &getstream.CallSettingsRequest{
    Audio: &getstream.AudioSettingsRequest{
      MicDefaultOn:  getstream.PtrTo(true),
      DefaultDevice: "speaker",
    },
  },
  Grants: &map[string][]string{
    "admin": []string{
      getream.SEND_AUDIO.String(),
      getream.SEND_VIDEO.String(),
      getream.MUTE_USERS.String(),
    },
    "user": []string{
      getream.SEND_AUDIO.String(),
      getream.SEND_VIDEO.String(),
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/calltypes?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "allhands",
    "settings": {
      "audio": {
        "mic_default_on": true,
        "default_device": "speaker"
      }
    },
    "grants": {
      "admin": ["send-audio", "send-video", "mute-users"],
      "user": ["send-audio", "send-video"]
    }
  }'
```

</tabs-item>

</tabs>

## Update call type

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.updateCallType({
  name: "allhands",
  settings: {
    audio: {
      mic_default_on: false,
      default_device: "earpiece",
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.update_call_type(
  name='allhands',
  settings=CallSettingsRequest(
    audio=AudioSettingsRequest(
      mic_default_on=False,
      default_device='earpiece'
    ),
  ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().UpdateCallType(ctx, "allhands", &getstream.UpdateCallTypeRequest{
  Settings: &getstream.CallSettingsRequest{
    Audio: &getstream.AudioSettingsRequest{
      MicDefaultOn: getstream.PtrTo(false),
      DefaultDevice: "earpiece",
    },
  },
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "audio": {
        "mic_default_on": false,
        "default_device": "earpiece"
      }
    }
  }'
```

</tabs-item>

</tabs>

## Delete call type

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.deleteCallType({ name: "allhands" });
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.delete_call_type(name='allhands')
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().DeleteCallType(ctx, "allhands", &getstream.DeleteCallTypeRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X DELETE "https://video.stream-io-api.com/api/v2/video/calltypes/${CALL_TYPE_NAME}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:00.906Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/call_types/manage/](https://getstream.io/video/docs/react-native/call_types/manage/).