# RTMP broadcasts

**RTMP broadcasting** allows you to forward a call to any external streaming service that supports RTMP(s) as input. All major platforms like Twitch, Youtube, Facebook, … support it.
Multiple broadcasts can be added for the same call, allowing it to send a live call to multiple providers at the same time.

## Understanding RTMP broadcasting

[RTMP](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol) is a protocol initially developed by Adobe for streaming audio, video, and data over
the internet. Although RTMP is no longer the dominant streaming protocol, it's still widely used for live streaming because of its low latency and
compatibility with platforms.

**RTMP broadcasting** refers to the process of sending a live video stream from a source (like Stream server) to an external streaming platform (like Youtube).

### How It Works

- Stream API gets the media streams from your call and [composes them into a single stream.](#configuring-the-layout-for-your-rtmp-broadcast)
- Stream API encodes and packages the stream into RTMP with settings suitable for live streaming.
- The target platform takes this RTMP stream, and processes it. Typically, services like Youtube
  re-encode it (if necessary) and broadcast the stream to viewers in various formats and resolutions,
  using protocols like HLS or DASH.

## Pre-requisites

### Getting a stream url and key

Platforms that support RTMP ingestion provide a stream url (the server where the stream will be sent) and a stream key (unique identifier for your stream).

### Configuring the layout for your rtmp broadcast

As previously mentioned, the call will be composed into a single stream following a layout:

- You can choose from one of our [pre-defined layouts](/video/docs/api/recording/calls/#recording-layouts/).
- Theming/branding is possible by changing layout parameters (colors, logos, positioning or elements, …)
- For more advanced / complex theming customization, you can build your own webapp and use it as the layout of the call.

You can set the desired RTMP broadcast quality and layout for a call type (ex. 'livestream') with:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
await client.video.updateCallType("livestream", {
  settings: {
    broadcasting: {
      enabled: true,
      rtmp: {
        enabled: true,
        quality: VideoRTMPSettingsRequestQualityEnum._1080P,
        layout: {
          name: VideoLayoutSettingsRequestNameEnum.SPOTLIGHT,
        },
      },
    },
  },
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
client.video.update_call_type(
    name='livestream',
    settings=CallSettingsRequest(
        broadcasting=BroadcastSettingsRequest(
		        enabled=True,
		        rtmp=RtmpSettingsRequest(
				      enabled=True
			          quality="1080p",
			          layout=LayoutSettingsRequest(
			              name="spotlight",
			          ),
		        )
        )
    ),
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
response, err := client.Video().UpdateCallType(ctx, callTypeName, &getstream.UpdateCallTypeRequest{
		Settings: &getstream.CallSettingsRequest{
			Broadcasting: &getstream.BroadcastSettingsRequest{
				Enabled: getstream.PtrTo(true),
				Rtmp: &getstream.RTMPSettingsRequest{
					Enabled: getstream.PtrTo(true),
					Quality: getstream.PtrTo("1080p"),
					Layout: &getstream.LayoutSettingsRequest{
						Name: "spotlight",
					},
				},
			},
		},
	})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X PUT "https://video.stream-io-api.com/api/v2/video/calltypes/livestream?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
        "broadcasting": {
            "enabled": true,
            "rtmp": {
                "enabled": true,
                "quality": "1080p",
                "layout": {
                    "name": "spotlight"
                }
            }
        }
    }
  }'
```

</tabs-item>

</tabs>

### Model

<open-api-models modelname="RTMPSettingsRequest" headerlevel="4">

</open-api-models>

All calls created with that call type will have those Settings.
You can also update the call and override these settings before starting the RTMP broadcast.
It's also possible to just pass them as optional parameters when starting it.


### User permissions

To start and stop an RTMP broadcast, users need the following capabilities:

- `start-broadcast-call`
- `stop-broadcast-call`

## Starting an RTMP broadcast

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.startRTMPBroadcasts({
  broadcasts: [
    {
      name: "youtube_channel",
      stream_url: "rtmps://x.rtmps.youtube.com/live2",
      stream_key: "your_stream_key",
    },
  ],
});
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.start_rtmp_broadcasts(
    broadcasts=[
        RTMPBroadcastRequest(
            name='youtube_channel', stream_url='rtmps://x.rtmps.youtube.com/live2', stream_key='your_stream_key'
        )
    ],
)
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.StartRTMPBroadcasts(ctx, &getstream.StartRTMPBroadcastsRequest{
	Broadcasts: []getstream.RTMPBroadcastRequest{
		{
			Name: "youtube_channel",
			StreamUrl: "rtmps://x.rtmps.youtube.com/live2",
			StreamKey: getstream.PtrTo("your_stream_key"),
		},
	},
})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/rtmp_broadcasts?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'content-type: application/json' \
    -d '{
        "broadcasts": [
            {
                "name": "youtube_channel",
                "stream_url": "rtmps://x.rtmps.youtube.com/live2",
                "stream_key": "your_stream_key"
            }
        ]
      }'
```

</tabs-item>

</tabs>


### Model

<open-api-models modelname="StartRTMPBroadcastsRequest" headerlevel="4">

</open-api-models>

## Stopping an RTMP broadcast by name

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.stopRTMPBroadcast("youtube_channel");
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.stop_rtmp_broadcast(name='youtube_channel')
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.StopRTMPBroadcast(ctx, "youtube_channel", &getstream.StopRTMPBroadcastsRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/rtmp_broadcasts/youtube_channel/stop?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'content-type: application/json' \
    -d '{}'
```

</tabs-item>

</tabs>


## Stopping all RTMP broadcasts for a call

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
call.stopAllRTMPBroadcasts();
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
call.stop_all_rtmp_broadcasts()
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
call.StopAllRTMPBroadcasts(ctx, &getstream.StopAllRTMPBroadcastsRequest{})
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X POST "https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${CALL_ID}/rtmp_broadcasts/stop?api_key=${API_KEY}" \
    -H "Authorization: ${TOKEN}" \
    -H "stream-auth-type: jwt" \
    -H 'content-type: application/json' \
    -d '{}'
```

</tabs-item>

</tabs>


## RTMP broadcast state

You can check if the call is being broadcasted like this:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const resp = await call.get();

// If HLS or any RTMP broadcast active
const isBroadcasting = resp.call.egress.broadcasting;

// Only check for RTMP broadcasts
const rtmpBroadcasts = resp.call.egress.rtmps;
const isRtmpBroadcasting = rtmpBroadcasts.length > 0;
```

</tabs-item>

<tabs-item value="py" label="Python">

```py
response = call.get()

# If HLS or any RTMP broadcast active
print(f"broadcasting: {response.data.call.egress.broadcasting}")

# Only check for RTMP broadcasts
rtmp_broadcasts = response.data.call.egress.rtmp_s
is_rtmp_broadcasting = len(rtmp_broadcasts) > 0
print(f"rtmp broadcasting: {is_rtmp_broadcasting}")
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
response, err := call.Get(ctx, &getstream.GetCallRequest{})

// If HLS or any RTMP broadcast active
fmt.Printf("broadcasting: %v", response.Data.Call.Egress.Broadcasting)

// Only check for RTMP broadcasts
rtmp_broadcasts := response.Data.Call.Egress.Rtmps
is_rtmp_broadcasting := len(rtmp_broadcasts) > 0
fmt.Printf("rtmp broadcasting: %v", is_rtmp_broadcasting)
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# Check RTMP state: resp.call.egress.rtmps
curl -X GET "https://video.stream-io-api.com/api/v2/video/call/livestream/${CALL_ID}?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

## Events

These events are sent to users connected to the call and your webhook/SQS:

- [`call.rtmp_broadcast_started`](/video/docs/api/webhooks/events/#CallRtmpBroadcastStartedEvent/)
- [`call.rtmp_broadcast_stopped`](/video/docs/api/webhooks/events/#CallRtmpBroadcastStoppedEvent/)
- [`call.rtmp_broadcast_failed`](/video/docs/api/webhooks/events/#CallRtmpBroadcastFailedEvent/)

## Consuming the broadcast

The consuming part depends on the service being used, but a mapping can be done on your app's server-side
between the name of the broadcast and the specifics of the platform.

## Quickstart examples

### Livestream your call to your YouTube channel

To use your Stream call as a video source for YouTube, you first need to set up a live stream in YouTube Studio.
Follow this link to your [Livestreaming Dashboard](https://youtube.com/livestreaming/dashboard), enable it if needed.

![Rtmp Broadcasts Youtube Dashboard](@video/api/_assets/rtmp_broadcasts_youtube_dashboard.png)

On that page you'll find your **Stream key** and the suggested **Stream URL**. [Copy both and add them to the start request.](#starting-an-rtmp-broadcast)

On YouTube side, check the status of the stream from the Livestreaming Dashboard, you should see that your call is live!

To stop it then at any given point in time, use the [stop by name](#stopping-an-rtmp-broadcast-by-name) or
[stop all](#stopping-all-rtmp-broadcasts-for-a-call) endpoints.

> **Note:** YouTube also provides a way to stop it from their end, although it will stop the broadcast it
> won't stop the RTMP connection from Stream to Youtube, so you should call always stop, or end the call.

## FAQ

### How much latency does RTMP broadcast add?

- RTMP itself doesn't add much latency, as it is a 1-1 protocol. Another thing then is how is the livestream content
  processed, for example, in the case of platforms like Youtube the latency is increased when the content is
  broadcasted through HLS/DASH protocol. [Check Youtube's options](https://support.google.com/youtube/answer/7444635?sjid=10230171077221482676-EU)


---

This page was last updated at 2026-04-17T17:34:00.914Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/streaming/rtmp_broadcasts/](https://getstream.io/video/docs/react-native/streaming/rtmp_broadcasts/).