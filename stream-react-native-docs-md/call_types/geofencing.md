# Geofencing

With geofencing, you can define which edge nodes are utilized for video calls within specific geo-fenced areas.
You can set geofences to a call type or specify when creating a new call. Multiple geo-fences can be used at the same time.

At this present, you can only select from a predefined list of geofences:

## Inclusion Geofences

| Name           | Description                                           | Countries Included                                                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| european_union | The list of countries that are part of european union | Austria, Belgium, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden |
| united_states  | Only selects edges in US                              | United States                                                                                                                                                                                                                                   |
| canada         | Only selects edges in Canada                          | Canada                                                                                                                                                                                                                                          |
| united_kingdom | Only selects edges in the United Kingdom              | United Kingdom                                                                                                                                                                                                                                  |
| india          | Only selects edges in India                           | India                                                                                                                                                                                                                                           |

## Exclusion Geofences

| Name                             | Description                                                                                                      | Countries Excluded       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------ |
| china_exclusion                  | Excludes edges running in mainland China (currently, Stream edge infrastructure does not have any edge in China) | China                    |
| russia_exclusion                 | Excludes edges running in Russia                                                                                 | Russia                   |
| belarus_exclusion                | Excludes edges running in Belarus                                                                                | Belarus                  |
| iran_north_korea_syria_exclusion | Excludes edges running in Iran, North Korea and Syria                                                            | Iran, North Korea, Syria |

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
client.video.createCallType({
  name: "<call type name>",
  settings: {
    geofencing: {
      names: ["european_union"],
    },
  },
});

//override settings on call level
call.create({
  data: {
    created_by_id: "john",
    settings_override: {
      geofencing: {
        names: ["european_union", "united_states"],
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
    geofencing=GeofenceSettingsRequest(
      names=['european_union'],
    ),
  ),
)

# override settings on call level
call.create(
  data=CallRequest(
    created_by_id='john',
    settings_override=CallSettingsRequest(
      geofencing=GeofenceSettingsRequest(
        names=['european_union', 'united_states'],
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
    Geofencing: &getstream.GeofenceSettingsRequest{
      Names: []string{"european_union"},
    },
  },
})

// override settings on call level
call.GetOrCreate(ctx, &getstream.GetOrCreateCallRequest{
  Data: &getstream.CallRequest{
    CreatedByID: getstream.PtrTo("john"),
    SettingsOverride: &getstream.CallSettingsRequest{
      Geofencing: &getstream.GeofenceSettingsRequest{
        Names: []string{"european_union", "united_states"},
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
  "name": "<name>",
  "settings": {
    "geofencing": {
      "names": ["european_union"]
    }
  }
}'

# override on call level
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "stream-auth-type: jwt" \
  -d '{
    "data": {
      "created_by_id": "john",
      "settings_override": {
        "geofencing": {
          "names": ["european_union", "united_states"]
        }
      }
    }
  }'
```

</tabs-item>

</tabs>

## Region Restrictions

With geofencing you can restrict the edges that are used in your calls based on their location. If you want to restrict access to calls for users in some regions, please reach out to our support team. This is currently possible but not configurable via API or Dashboard.

### UAE VoIP Service Notice

The Telecommunications and Digital Government Regulatory Authority (TDRA) regulates the provision of real-time voice and video communication services within the United Arab Emirates (UAE).

To align with these regulatory requirements, Stream currently does not enable video functionality by default for users connecting from within the UAE.

Organizations that are authorized or licensed to provide VoIP services in the UAE may contact our team at [support@getstream.io](mailto:support@getstream.io) to request an evaluation for enabling access.

Each request will be assessed on a case-by-case basis to ensure compliance with all applicable TDRA requirements and local laws.


---

This page was last updated at 2026-04-17T17:34:03.126Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/call_types/geofencing/](https://getstream.io/video/docs/react-native/call_types/geofencing/).