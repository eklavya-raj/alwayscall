# Settings

The Stream API provides multiple configuration options on the call type level.

- You can provide the settings when creating or updating a call type
- For maximum flexibility, you can override the settings on the call level when creating or updating a call

## Code examples

### Settings

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.createCallType({
  name: "<call type name>",
  settings: {
    screensharing: {
      access_request_enabled: false,
      enabled: true,
    },
  },
});

// override settings on call level
call.create({
  data: {
    created_by_id: "john",
    settings_override: {
      screensharing: {
        enabled: false,
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.create_call_type(
  name='<call type name>',
  settings=CallSettingsRequest(
    screensharing=ScreensharingSettingsRequest(
      access_request_enabled=False,
      enabled=True,
    ),
  ),
)

# override settings on call level
call.create(
  data=CallRequest(
    created_by_id='john',
    settings_override=CallSettingsRequest(
      screensharing=ScreensharingSettingsRequest(
        enabled=False,
      ),
    ),
  ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().CreateCallType(ctx, &getstream.CreateCallTypeRequest{
  Name: "<call type name>",
  Settings: &getstream.CallSettingsRequest{
    Screensharing: &getstream.ScreensharingSettingsRequest{
      AccessRequestEnabled: getstream.PtrTo(false),
      Enabled:              getstream.PtrTo(true),
    },
  },
})

// override settings on call level
call.GetOrCreate(ctx, &getstream.GetOrCreateCallRequest{
  Data: &getstream.CallRequest{
    CreatedByID: getstream.PtrTo("john"),
    SettingsOverride: &getstream.CallSettingsRequest{
      Screensharing: &getstream.ScreensharingSettingsRequest{
        Enabled: getstream.PtrTo(false),
      },
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
    "name": "<call type name>",
    "settings": {
      "screensharing": {
        "access_request_enabled": false,
        "enabled": true
      }
    }
  }'

# override settings on call
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "created_by_id": "john",
      "settings_override": {
        "screensharing": {
          "enabled": false
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

### Notification settings

Notification settings can't be overridden on the call level, you can only set these on the call type level.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.createCallType({
  name: "<call type name>",
  notification_settings: {
    enabled: true,
    call_notification: {
      apns: {
        title: "{{ user.display_name }} calls you",
        body: "{{ user.display_name }} calls you",
      },
      enabled: true,
    },
    call_ring: {
      apns: {
        title: "{{ user.display_name }} calls you",
        body: "{{ user.display_name }} calls you",
      },
      enabled: true,
    },
    call_live_started: {
      enabled: true,
      apns: {
        title: "{{ call.display_name }} started",
        body: "{{ user.display_name }} started",
      },
    },
    call_missed: {
      enabled: true,
      apns: {
        title: "missed call from {{ user.display_name }}",
        body: "missed call from {{ user.display_name }}",
      },
    },
    session_started: {
      enabled: true,
      apns: {
        title: "{{ call.display_name }} started",
        body: "{{ call.display_name }} started",
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.create_call_type(
  name=call_type_name,
  notification_settings={
      "enabled": True,
      "call_notification": {
          "apns": {
              "title": "{{ user.display_name }} calls you",
              "body": "{{ user.display_name }} calls you"
          },
          "enabled": True
      },
      "call_ring": {
          "apns": {
              "title": "{{ user.display_name }} calls you",
              "body": "{{ user.display_name }} calls you"
          },
          "enabled": True
      },
      "call_live_started": {
          "enabled": True,
          "apns": {
              "title": "{{ call.display_name }} started",
              "body": "{{ user.display_name }} started"
          }
      },
      "call_missed": {
          "enabled": True,
          "apns": {
              "title": "missed call from {{ user.display_name }}",
              "body": "missed call from {{ user.display_name }}"
          }
      },
      "session_started": {
          "enabled": True,
          "apns": {
              "title": "{{ call.display_name }} started",
              "body": "{{ call.display_name }} started"
          }
      }
  }
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
client.Video().CreateCallType(ctx, &getstream.CreateCallTypeRequest{
  Name: "test-call-type",
  NotificationSettings: &getstream.NotificationSettings{
    Enabled: true,
    CallNotification: getstream.EventNotificationSettings{
      APNS: getstream.APNS{
        Title: "{{ user.display_name }} calls you",
        Body:  "{{ user.display_name }} calls you",
      },
      Enabled: true,
    },
    CallRing: getstream.EventNotificationSettings{
      APNS: getstream.APNS{
        Title: "{{ user.display_name }} calls you",
        Body:  "{{ user.display_name }} calls you",
      },
      Enabled: true,
    },
    CallLiveStarted: getstream.EventNotificationSettings{
      Enabled: true,
      APNS: getstream.APNS{
        Title: "{{ call.display_name }} started",
        Body:  "{{ user.display_name }} started",
      },
    },
    CallMissed: getstream.EventNotificationSettings{
      Enabled: true,
      APNS: getstream.APNS{
        Title: "missed call from {{ user.display_name }}",
        Body:  "missed call from {{ user.display_name }}",
      },
    },
    SessionStarted: getstream.EventNotificationSettings{
      Enabled: true,
      APNS: getstream.APNS{
        Title: "{{ call.display_name }} started",
        Body:  "{{ call.display_name }} started",
      },
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
    "name": "<call type name>",
    "notification_settings": {
      "enabled": true,
      "call_notification": {
        "apns": {
          "title": "{{ user.display_name }} calls you",
          "body": "{{ user.display_name }} calls you"
        },
        "enabled": true
      },
      "call_ring": {
        "apns": {
          "title": "{{ user.display_name }} calls you",
          "body": "{{ user.display_name }} calls you"
        },
        "enabled": true
      },
      "call_live_started": {
        "enabled": true,
        "apns": {
          "title": "{{ call.display_name }} started",
          "body": "{{ user.display_name }} started"
        }
      },
      "call_missed": {
        "enabled": true,
        "apns": {
          "title": "missed call from {{ user.display_name }}",
          "body": "missed call from {{ user.display_name }}"
        }
      },
      "session_started": {
        "enabled": true,
        "apns": {
          "title": "{{ call.display_name }} started",
          "body": "{{ call.display_name }} started"
        }
      }
    }
  }'
```

</tabs-item>

</tabs>


## Configuration options

### Settings

<open-api-models modelname="CallSettingsRequest" headerlevel="4">
</open-api-models>

### Notification settings

<open-api-models modelname="NotificationSettings" headerlevel="4">
</open-api-models>


---

This page was last updated at 2026-04-17T17:34:03.127Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/call_types/settings/](https://getstream.io/video/docs/react-native/call_types/settings/).