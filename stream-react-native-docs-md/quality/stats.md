# Stats

In this document you can find more information about metrics that are important for audio/video quality and stability. These metrics are used to determine quality scores and are also exposed via API and on the Dashboard stats screen.

For video to be stable and high quality, it is necessary for Jitter, RTT, FPS and packet loss metrics to be stable and within acceptable values. Stream Video global edge infrastructure and Dynascale ensures high quality and stability for your calls by reducing the distance between users and servers and optimizing the audio/video to match each user's connectivity.

For more information about how Stream Video ensures quality video, see our [Video Quality, Latency and Lag Guide](/video/docs/api/quality/introduction/).

## **Jitter**

Jitter measures the variation in packet-arrival intervals; high jitter shows the connection is delivering media at uneven pacing. When jitter is too high, audio and video quality will degrade.

| **Jitter Range** | **Call Health** | **Description**                                                                |
| ---------------- | --------------- | ------------------------------------------------------------------------------ |
| **< 40 ms**      | Good            | Smooth audio and stable video with optimal real-time communication             |
| **40 – 50 ms**   | Fair            | Occasional audio cracks and minor motion judder, acceptable for most use cases |
| **> 50 ms**      | Poor            | Robot-like voices, video stutter/freezes with significant quality issues       |

**Common causes for high jitter**

- Poor Wi-Fi / Cellular connection
- Network congestion
- VPN

## **Round-Trip Time (RTT)**

RTT measures the full out-and-back network latency between the user and the video edge; higher RTT lengthens echo-cancellation windows and slows loss recovery.

| **RTT Range**    | **Call Health** | **Description**                                                              |
| ---------------- | --------------- | ---------------------------------------------------------------------------- |
| **< 150 ms**     | Good            | "Real-time" feel with excellent responsiveness for interactive communication |
| **150 – 300 ms** | Fair            | Noticeable delay when taking turns, may affect natural conversation flow     |
| **> 300 ms**     | Poor            | Participants talk over each other, harder lip-sync with significant delays   |

**Common causes for high RTT**

- Poor Wi-Fi / Cellular connection
- Congested internet connection
- Geographical distance or using a TURN relay
- Enterprise firewalls forcing TCP relay or deep-packet inspection
- DDoS-mitigation appliances injecting extra hops
- VPN

For more information about network requirements and firewall configurations, see our [Networking and Firewall guide](/video/docs/api/misc/networking/).

## **Frames Per Second (FPS)**

FPS tracks how many video frames are actually _sent_ (outbound) or _rendered_ (inbound) per second; drops usually indicate CPU or bandwidth adaptation kicking in.

| **Effective FPS Range** | **Call Health** | **Description**                                                            |
| ----------------------- | --------------- | -------------------------------------------------------------------------- |
| **24 – 30 fps**         | Good            | Smooth motion with optimal video quality and fluid motion                  |
| **15 – 23 fps**         | Fair            | Slight choppiness, acceptable for most business applications               |
| **< 15 fps**            | Poor            | Jerky motion, unreadable screen-share with significant quality degradation |

**Common causes for low FPS**

- The user publishing video has CPU issues encoding video fast enough (see encoding time later)
- The user receiving video has CPU issues decoding video
- Congested internet connection
- Camera does not send stable 30fps
- Power-saver limiting CPU usage for encoding or decoding (e.g., laptops, mobile devices)

## **Frame encoding time**

Frame encoding time is how long the sender's encoder spends compressing each video frame; spikes mean the device can't keep up. Stream Video automatically detects slow encoding times and switches devices to lower resolutions and codecs that require less computation (e.g., AV1 → VP8).

| **Average Encode Time** | **Health** | **Description**                                                        |
| ----------------------- | ---------- | ---------------------------------------------------------------------- |
| **< 25 ms**             | Good       | Optimal encoding performance with head-room for spikes                 |
| **25 – 33 ms**          | Warning    | Approaching limits, risk of frame-drops below 30 fps                   |
| **> 33 ms**             | Bad        | Performance bottleneck causing visible quality degradation and stutter |

**Common causes for high encoding time**

- High CPU utilization by other processes
- Thermal throttling reducing CPU/GPU frequency
- Target resolution is set too high
- The device cannot encode efficiently the selected video codec (e.g., AV1)

For information about configuring target resolutions and video quality settings, see our [Call Types Settings guide](/video/docs/api/call_types/settings/).

## **Frame decoding time**

Frame decoding time shows how long the receiver needs to turn compressed video back into pixels.

| **Average Decode Time** | **Health** | **Description**                                                              |
| ----------------------- | ---------- | ---------------------------------------------------------------------------- |
| **< 20 ms**             | Good       | Optimal decoding performance with playback in lock-step                      |
| **20 – 33 ms**          | Warning    | Approaching performance limits, may start skipping frames                    |
| **> 33 ms**             | Bad        | Severe performance issues causing frozen or black video until next key-frame |

**Common causes**

- High CPU utilization by other processes
- High-profile H.264/AV1 streams on low-end mobiles
- Thermal throttling reducing CPU/GPU frequency

## **Packet loss**

Packet loss is the fraction of packets never received. Please note that both audio and video can sustain some packet loss without any noticeable issue to the user. Some tolerance to packet loss is possible for these reasons:

- Stream Video transport layer supports packet retransmission (NACK)
- Redundant Audio Data (RED) is used to minimize impact of packet loss in audio stream
- Forward error correction (FEC) in the opus codec can correct small packet loss with no or minimal impact to the playback

| **Loss Percentage (1-way)** | **Health** | **Description**                                             |
| --------------------------- | ---------- | ----------------------------------------------------------- |
| **< 5 %**                   | Good       | Rare glitches, error correction handles most issues         |
| **5 – 10 %**                | Fair       | Audible pops, macro-blocks with moderate impact             |
| **> 10 %**                  | Poor       | Words drop, video blocks or freezes with significant impact |

**Common causes**

- Poor Wi-Fi / Cellular connection
- Geographical distance

## **Audio concealment %**

Audio concealment is the share of audio samples synthesized by the opus codec to account for lost packets compared to the total amount of audio samples.

| **Concealed Samples** | **Health** | **Description**                                              |
| --------------------- | ---------- | ------------------------------------------------------------ |
| **< 5 %**             | Good       | Minimal audio artifacts with natural sound                   |
| **5 – 10 %**          | Fair       | Small pops, slight "tin can" effect but acceptable quality   |
| **> 10 %**            | Poor       | Words drop, robotic sound with significant audio degradation |

**Common causes**

- Packet loss
- High jitter

## Dealing with high jitter, RTT, audio concealment and packet loss

Users experiencing high values for these metrics for long enough periods will have a poor experience. These are major causes for high jitter, RTT, audio concealment or packet loss. Keep in mind that in some cases the same problem can cause multiple metrics to look unhealthy.

1. The user's connection is unstable (e.g., low signal on Wi-Fi or 4G, limited bandwidth, high latency, packet loss, etc.)
2. The user is very far from the video server
3. The user connection is congested
4. The user connects from a network
5. The user connects using a VPN
6. The user connection requires the use of TURN relay
7. The user connection does not allow UDP traffic

Stream Video edge infrastructure has a world-wide coverage, ensuring that users are close to a video server. You can see where users connect from and to which edge server they are connected from the Dashboard stats. Please reach out to support if your users do not have a nearby edge server.

For testing and debugging connection issues, use our [Connection Test tool](/video/docs/api/quality/connection-test/).

## **Best practices**

1. **Include connection status information in your application UI** - Implement network quality indicators to help users understand their connection status. See our guides for [React](/video/docs/react/ui-cookbook/network-quality-indicator/), [React Native](/video/docs/react-native/ui-cookbook/network-quality-indicator/), [iOS](/video/docs/ios/ui-cookbook/network-quality-indicator/), [Android](/video/docs/android/ui-cookbook/network-quality-indicator/), and [Flutter](/video/docs/flutter/ui-cookbook/network-quality-indicator/).

2. **Configure appropriate target resolutions and bitrates** - Do not configure very high target resolutions or bitrates in your call type configuration (e.g., 1080p or 720p work great for most conferencing use-cases). See our [Call Types Settings guide](/video/docs/api/call_types/settings/) for configuration options.

3. **Educate users about VPN impact** - Explain to your users that use of VPN can have a negative impact on the call experience.

4. **Ensure UDP traffic is allowed** - If applicable, share our [Connection Test tool](/video/docs/api/quality/connection-test/) with your users' network administrators and ensure that UDP traffic is allowed. See our [Networking and Firewall guide](/video/docs/api/misc/networking/) for detailed requirements.

5. **Use modern browsers** - Minimize usage of old browser versions or usage of "exotic" browsers. WebRTC best implementation lives on Google Chrome.

6. **Prefer native mobile apps** - Prefer native mobile apps to browsers on mobile devices for better performance and reliability.

7. **Keep SDKs updated** - Keep your application up-to-date to the latest Stream Video SDK version. Check our [installation guides](/video/docs/javascript/basics/quickstart/) for your platform to ensure you're using the latest version.

## Active calls status endpoint

The `get_active_calls_status` endpoint returns a status overview for all calls that are currently running on your application. The endpoint includes summary information such as how many calls are running, how many users are connected, and a section about important health metrics such as jitter, round-trip latency, and FPS.

You can use this endpoint to get an overview of the overall status of your calls running on Stream Video, define alarms based on health metrics, and troubleshoot problems on specific calls. To make things simpler, data is organized by multiple dimensions.

<tabs groupId="examples">

<tabs-item value="py" label="Python">

```python
response = client.video.get_active_calls_status()

print(
    f"There are {response.data.summary.active_calls} calls "
    f"currently running and {response.data.summary.participants} "
    f"connected users"
)
```

</tabs-item>

<tabs-item value="js" label="JavaScript">

```js
const response = await client.video.getActiveCallsStatus();
```

</tabs-item>

<tabs-item value="go" label="Golang">

```go
// TODO: Add Golang example
```

</tabs-item>

<tabs-item value="java" label="Java">

```java
// TODO: Add Java example
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
curl -X GET "https://video.stream-io-api.com/api/v2/video/active_calls_status?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>

### Example response

```json
{
  "end_time": "2025-07-11T08:21:56.262333+00:00",
  "start_time": "2025-07-11T08:20:56.262333+00:00",
  "metrics": {
    "join_call_api": {
      "failures": 0.0,
      "total": 152.0,
      "latency": {
        "p50": 12.0,
        "p90": 37.2
      }
    },
    "publishers": {
      "all": {
        "audio": {
          "jitter_ms": {
            "p50": 9.215125775890233,
            "p90": 19.033705357142857
          }
        },
        "rtt_ms": {
          "p50": 52.849790316431566,
          "p90": 99.49866565001908
        },
        "video": {
          "fps_30": {
            "p05": 15.315719360568384,
            "p10": 16.652753108348135,
            "p50": 27.99822852081488,
            "p90": 28.729197080291968
          },
          "frame_encoding_time_ms": {
            "p50": 18.487886382623223,
            "p90": 20.75667311411993
          },
          "jitter_ms": {
            "p50": 12.747152619589977,
            "p90": 40.856304985337246
          },
          {
            "resolution": {
              "p10": 1080.0,
              "p50": 720.0
            }
          },
          {
            "bitrate": {
              "p10": 971.0,
              "p50": 1122.0
            }
          }
        }
      }
    },
    "subscribers": {
      "all": {
        "audio": {
          "concealment_pct": {
            "p50": 0.6185230518155854,
            "p90": 2.14135021097047
          },
          "jitter_ms": {
            "p50": 9.76944395306327,
            "p90": 19.254517952392327
          },
          "packets_lost_pct": {
            "p50": 0.06575754202382277,
            "p90": 0.5857954545454549
          }
        },
        "rtt_ms": {
          "p50": 22.0022869523351,
          "p90": 89.84574826116226
        },
        "video": {
          "fps_30": {
            "p05": 15.643523143523144,
            "p10": 16.914751914751915,
            "p50": 27.749330655957163,
            "p90": 28.458518712378957
          },
          "jitter_ms": {
            "p50": 23.52590771558245,
            "p90": 77.41462509279881
          },
          "packets_lost_pct": {
            "p50": 0.06737431427068462,
            "p90": 0.8301212938005396
          }
        }
      }
    }
  },
  "summary": {
    "active_calls": 143,
    "active_publishers": 2648,
    "active_subscribers": 4748,
    "participants": 5560
  }
}
```

## Metrics

The response includes detailed metrics for both publishers (users sending audio/video) and subscribers (users receiving audio/video). These metrics help you understand the quality and performance of your calls.

### API metrics

Important metrics for API call performance and reliability.

| **Metric**                  | **Description**                                        |
| --------------------------- | ------------------------------------------------------ |
| `join_call_api.failures`    | The rate of failed API calls (calls per second)        |
| `join_call_api.total`       | The total rate of API calls (calls per second)         |
| `join_call_api.latency.p50` | The median latency for API calls (in seconds)          |
| `join_call_api.latency.p90` | The 90th percentile latency for API calls (in seconds) |

### Publisher metrics

Important audio and video metrics for users publishing audio/video content.

| **Metric**                     | **Description**                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `audio.rtt_ms`                 | The elapsed time (in milliseconds) for an audio packet to travel from the sender to the receiver and back again                             |
| `audio.jitter_ms`              | The variation in audio packet arrival time                                                                                                  |
| `video.rtt_ms`                 | The elapsed time (in milliseconds) for a video packet to travel from the sender to the receiver and back again                              |
| `video.jitter_ms`              | The variation in video packet arrival time                                                                                                  |
| `video.fps_30`                 | The video frame rate being published                                                                                                        |
| `video.frame_encoding_time_ms` | The time spent encoding individual video frames                                                                                             |
| `video.resolution`             | The video resolution published in pixels, this metrics returns the minimum / height (eg. 1080 for both 1920x1080 and 1080x1920 resolutions) |
| `video.bitrate`                | The video publishing bitrate measure in kbps                                                                                                |

### Subscriber metrics

Important audio and video metrics for users receiving audio/video content.

| **Metric**                     | **Description**                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `audio.rtt_ms`                 | The elapsed time (in milliseconds) for an audio packet to travel from the sender to the receiver and back again |
| `audio.jitter_ms`              | The variation in audio packet arrival time                                                                      |
| `audio.concealment_pct`        | The percentage of audio with degraded quality due to audio packet loss (1.0 = 100%)                             |
| `audio.packets_lost_pct`       | The percentage of audio packets lost during transmission (1.0 = 100%)                                           |
| `video.rtt_ms`                 | The elapsed time (in milliseconds) for a video packet to travel from the sender to the receiver and back again  |
| `video.jitter_ms`              | The variation in video packet arrival time                                                                      |
| `video.fps_30`                 | The video frame rate being rendered                                                                             |
| `video.frame_decoding_time_ms` | The time spent decoding individual video frames                                                                 |
| `video.packets_lost_pct`       | The percentage of video packets lost during transmission (1.0 = 100%)                                           |

### Thresholds and alarms

If you plan to use this endpoint to create alerts, we recommend following the information at the beginning of this document and set alerts for p90 metrics. The p90 values represent the 90th percentile, meaning 90% of measurements are below this threshold, making them good indicators for alerting on performance issues.

**Note**: Percentage fields (those ending with `_pct`) are returned as decimal values where 1.0 represents 100%. For example, a value of 0.05 means 5% and a value of 1.5 means 150%.


---

This page was last updated at 2026-04-17T17:34:00.917Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/quality/stats/](https://getstream.io/video/docs/react-native/quality/stats/).