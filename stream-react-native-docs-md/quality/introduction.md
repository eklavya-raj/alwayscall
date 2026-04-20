# Quality and Latency Guide

Stream provides a detailed analytics report for all calls. If you encounter any issues with latency, quality of the video, or lag, be sure to reach out to support. Contact support and send them your API key and call ID together with a description of your issue.

![Stream Call Stats](@video/api/_assets/stats.png)

This guide will go into more detail about how to optimize quality and latency of your video. To start, let's recap how Stream provides a high-quality video service.

## How Stream Ensures Quality Video

**Video Edge Network**: We run an edge network of servers around the world. By having your users closer to our infrastructure, we reduce lag and, more importantly, reduce packet loss. This improves the quality of video.

**Dynascale**: Stream will automatically tell SDKs to start uploading different codecs or different resolutions of video depending on how the video is used. If you're showing the video in a small thumbnail screen, it will automatically select the lower quality. And if you switch back to displaying it full screen, it will switch back to high quality.

**Codecs**: We dynamically switch between AV1, VP9, H.264, and VP8 based on the hardware that's connected to the call.

**SDKs & Reconnects**: We implement a fast failover and reconnect protocol. So if your connection breaks, the reconnect should happen very quickly.

## Video Quality and Resolution

The max target quality is configured at the call type level. You can edit this in the dashboard. Typically you want to target 720p or 1080p. It is possible to target higher resolutions, but often the camera, CPU for encoding, and/or bandwidth are not ready for more than 1080p.

The max target defines the ideal maximum video resolution. There are several reasons why users can receive video at lower resolutions. Let's say you're aiming at 1080p.

**Video quality target → 1080p**

1. **Publisher**: Is the publisher able to publish at 1080p? The camera, the CPU, and the network can all cause the quality to go down on the publisher side of things.

2. **Subscriber target resolution**: For the subscriber, the target changes based on what resolution the video is shown at. If the video is displayed in a small area, we will often subscribe to 25% or 50% of the full video quality.

3. **Subscriber degradation**: If the network or device CPU are not able to keep up with the current quality of video, the subscriber will ask for a lower quality video. As network or CPU conditions improve, it will try to recover to higher quality.

4. **Codecs**: Video codecs play a key role in video quality. AV1 is by far the most advanced video codec widely available and can deliver much higher video quality with the same bitrate as older codecs such as H.264 and VP8. Unfortunately, not all devices support AV1 efficiently. This means that in some cases, less efficient codecs will be used to publish video. The good news is that encoding AV1 is far more expensive than decoding AV1. We automatically allow more powerful devices to publish video using AV1 and have publishers on older devices send video in a codec that's better supported like H.264 or VP9.

### Default target resolutions

Default target resolutions by call type:

- Livestream: 1080p
- Default: 720p
- Development: 720p

### AV1 Support Explained

AV1 codec is selected automatically on calls with any of these devices:

- iPhone 15 and up supports AV1 well
- Galaxy S23 and up
- Chrome supports AV1, Firefox 136 added support recently. Safari 17 and up supports AV1 decoding and encoding.

Min SDK versions needed for using AV1:

- Android 1.3.0
- iOS 1.15.0
- React 1.10.0
- React Native 1.8.0
- Flutter 0.7.0

## Video Latency and Lag

The video edge network is great at providing low latency. Often the delay is 50-150ms on receiving the video. But many customers have a livestreaming setup which goes through several steps. For instance, you can have OBS publish to RTMP, which goes to our RTMP ingress and then is published to users. Additional steps can cause delay to the video.

### Configuring OBS for Low Latency

**Output Settings**

You can find these settings under the output section, make sure to use the Advanced mode:

- Select a hardware-based encoder if possible (Typically NVIDIA NVENC)
- Make sure to use an H.264 encoder
- Configure your encoder for low latency
- Set Rate Control to "CBR" (Constant Bitrate)
- Set keyframe interval to 2s
- Disable B-frames
- Pick an appropriate bitrate based on your internet connection and the resolution you want to use

**Advanced Settings**

_Network_

- Set Bind to IP if you have multiple network interfaces
- Enable Dynamically change bitrate when dropping frames
- Set Network Buffer to 0ms (minimizes buffering)
- Disable Optimize Network Usage

_Video_

- Lower your output resolution if needed (1080p is often a good balance)
- Use 30 or 60 FPS depending on your needs (if unsure, pick 30fps)
- Set Common FPS Values instead of using fractional FPS
- If possible, use the same resolution for the canvas and the output

**Bitrate Selection**

As a rule of thumb, you want your internet connection to have at least twice the upload speed that you configure on OBS as the bitrate.

When streaming content with frequent scene changes, fast motion (like sports, action games, or FPS games), you should aim for the higher end of these ranges or even exceed them slightly if your connection allows.

_720p 30fps_

- Standard content: 2,500-4,000 Kbps
- High motion content: 4,000-5,000 Kbps

_1080p 30fps_

- Standard content: 4,500-6,000 Kbps
- High motion content: 6,000-8,000 Kbps

If you use 60fps, you will need to increase the bitrate 1.5x to 2x higher than the one needed for 30fps.

**RTMP Delay Explained**

Our RTMP ingress is configured for low latency. It typically adds between 1 and 2 seconds of delay to convert the video. If you can use a WebRTC or WHIP type of ingress, this will remove one step from the publishing pipeline and reduce latency. WHIP is going to be generally available in March 2025.

**SRT Ingress**

Similar to RTMP, using SRT can cause a delay of 1 or 2 seconds. Using WebRTC or WHIP reduces these delays. Note: SRT ingress is going to be generally available in March 2025.

## Video at 4K

Publishing at 4K video resolution is heavy in terms of encoding the video and requires a camera that can capture at this resolution. Most consumer cameras do not support capturing video above 2K resolution.

**Recommended Specs:**

- **GPU**: NVIDIA RTX 4080 and up are typically great at low latency AV1 encoding with 4K resolution.
- **Network**: 50Mbps upload is recommended to support an AV1 upload.

In general, the configuration is more complex, so if you are interested in using 4K for your calls, we recommend reaching out to our support team to get more guidance.

## Video bandwidth requirements

Many video applications, from video conferencing to live sports broadcasts, need to adapt to varying network conditions while maintaining acceptable visual quality. Estimating the required bandwidth for different resolutions, codecs, and levels of motion is essential for content producers, developers and network engineers to provision capacity, set encoder parameters, and avoid stalls or excessive compression artifacts.

For use cases requiring 60 fps, bandwidth requirements will be roughly double those listed below for 30 fps. In practice, encoding efficiency at higher frame rates may vary slightly, so you can generally scale the numbers by a factor of **1.8–2×** to estimate 60 fps bitrates.

---

**Static (low-motion)**

| Resolution | H.264     | VP8       | VP9       | AV1       |
| ---------- | --------- | --------- | --------- | --------- |
| 360p       | 150 kbps  | 110 kbps  | 90 kbps   | 70 kbps   |
| 480p       | 200 kbps  | 150 kbps  | 120 kbps  | 90 kbps   |
| 720p       | 600 kbps  | 450 kbps  | 350 kbps  | 280 kbps  |
| 1080p      | 1400 kbps | 1000 kbps | 790 kbps  | 630 kbps  |
| 1440p      | 2400 kbps | 1800 kbps | 1400 kbps | 1100 kbps |
| 4K         | 5400 kbps | 4000 kbps | 3100 kbps | 2500 kbps |

---

**Conference (medium-motion)**

| Resolution | H.264      | VP8        | VP9       | AV1       |
| ---------- | ---------- | ---------- | --------- | --------- |
| 360p       | 320 kbps   | 280 kbps   | 230 kbps  | 190 kbps  |
| 480p       | 430 kbps   | 370 kbps   | 310 kbps  | 260 kbps  |
| 720p       | 1300 kbps  | 1100 kbps  | 930 kbps  | 770 kbps  |
| 1080p      | 2900 kbps  | 2500 kbps  | 2100 kbps | 1700 kbps |
| 1440p      | 5200 kbps  | 4400 kbps  | 3700 kbps | 3100 kbps |
| 4K         | 11600 kbps | 10000 kbps | 8400 kbps | 7000 kbps |

---

**Sports (high-motion)**

| Resolution | H.264      | VP8        | VP9        | AV1        |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| 360p       | 690 kbps   | 560 kbps   | 430 kbps   | 350 kbps   |
| 480p       | 930 kbps   | 740 kbps   | 580 kbps   | 460 kbps   |
| 720p       | 2800 kbps  | 2200 kbps  | 1700 kbps  | 1400 kbps  |
| 1080p      | 6200 kbps  | 5000 kbps  | 3900 kbps  | 3100 kbps  |
| 1440p      | 11100 kbps | 8900 kbps  | 6900 kbps  | 5600 kbps  |
| 4K         | 25000 kbps | 20000 kbps | 15600 kbps | 12500 kbps |


---

This page was last updated at 2026-04-17T17:34:03.134Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/quality/introduction/](https://getstream.io/video/docs/react-native/quality/introduction/).