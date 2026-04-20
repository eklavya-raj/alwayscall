# Connection Test

Stream provides a dedicated connectivity test page that you can use to check the quality of your and your customers' connection.
This page is useful for debugging and testing your network connection, and allows collecting a detailed report our team can analyze later.

The connection test page is available here: [Connection Test](https://getstream.io/video/demos/test).

![Connection test](@video/api/_assets/connection-test.png)

## Available information

On this page, you can see the following information:

- **Video encoding support**, **Video decoding support**, **Audio encoding support**, **Audio decoding support**:
  Lists the codecs that your device and browser support for video encoding. These can be different depending on your device, operating system and browser.
- **Video input devices**, **Audio input devices**:
  Cameras and microphones that are currently connected and accessible by the browser.
  Make sure that the page has permissions to access your camera and microphone, and your browser is not affected by the operating system's privacy settings.
- **Connectivity**: Shows the connection parameters
  - Your approximate location
  - The SFU node you are connected to (usually the closest one to your approximate location)
  - The protocol used for the connection (UDP or TCP)
  - The network type (LAN, Wi-Fi, or Cellular)
  - Liveness of the connection
- **Codecs in use**:
  Shows the codecs that will be used by default for your device.
  These codecs may change depending on network conditions and the capabilities of other participants' devices.
- **Raw Call Stats**: Shows the raw call stats

## Understanding connectivity

Our systems deliver optimal video quality when UDP is used as the transport protocol.
UDP is faster and more efficient than TCP. It is ideal for real-time applications like video and audio calls.

However, in some cases, UDP traffic might be blocked by firewalls or routers, and the call will fall back to the TCP protocol.
In this case, the call quality might be degraded, but the call will still work.

If you often encounter issues with call quality, please check the [Quality and Latency Guide](/video/docs/api/quality/introduction/).

### Ideal network conditions

- UDP protocol, connected to a datacenter close to your approximate location
- LAN or Wi-Fi network with ~3Mbps per participant bandwidth and less than 50ms latency
- Very low or no packet loss and jitter
- Healthy connection to the Coordinator and the SFU node

## Capturing a connection test report

A snapshot of the connection test report can be captured by clicking the _**Copy Report**_ button on the top.
This will copy the report to your clipboard, and you can paste it into an email or a support ticket.

![Copy Report](@video/api/_assets/connection-test-copy-report.png)

## Using Media Inspector bookmarklet

<admonition type="note">

Media Inspector is a tool designed for web developers - it's not intended to be
shared with your customers.

</admonition>

![Media Inspector bookmarklet](@video/api/_assets/connection-test-media-inspector.png)

Active media streams captured with the Media Capture API cause browsers and
systems to display usage indicators, and not cleaning them up properly can be
considered a privacy issue. Media Inspector bookmarklet helps you find active
media streams in your application and answers the question "Why are my camera
and microphone being used?"

We suggest the following workflow:

1. Drag the bookmarklet to your favorites bar.
2. Go to your application.
3. Click the bookmarklet **before** you join the call.
4. Join the call, enable your camera or microphone, and use your application as
   usual.
5. Open your browser console and execute the following code:

```js
_inspectMedia();
```

![`_inspectMedia()` call output](@video/api/_assets/connection-test-inspect-media-output.png)

This function returns a list of tuples, each tuple representing a separate
`navigator.mediaDevices.getUserMedia()` call in your application. The most
important information here is media stream status: live or ended. **Live media
streams use your camera or microphone.** You also have access to the
`MediaStream` instance, and to the `MediaStreamContraints` object.

Let's say you found your live media stream. To find out why it was created, call
the `trace()` method:

```js
_inspectMedia()[1].trace();
```

You'll get a stack trace pointing the line of code where `getUserMedia()` API
was called in the first place.


---

This page was last updated at 2026-04-17T17:34:03.136Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/quality/connection-test/](https://getstream.io/video/docs/react-native/quality/connection-test/).