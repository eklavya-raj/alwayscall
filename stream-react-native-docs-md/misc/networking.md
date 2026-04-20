# Networking and Firewall

Stream Video leverages a combination of UDP and TCP protocols to deliver real-time video streams. By default, Stream uses UDP, which is the preferred protocol for real-time video transmission via WebRTC. However, some users may encounter restrictions on UDP due to firewall rules or networking configurations.
If UDP is unavailable, the system automatically falls back to TCP. Although TCP provides a viable alternative, it is less ideal for real-time video, as it may result in decreased video quality.

For optimal performance, we recommend configuring firewalls to allow UDP and NAT as explained below.

### Network and Port Requirements

Stream Video operates on an edge infrastructure with a dynamically managed list of servers for video call routing. For audio/video to work correctly, your network firewall must allow access to servers under the subdomains `stream-io-video.com`, `stream-io-api.com` and `getstream.io` (eg. `video.stream-io-api.com`, `sfu-5a2a819a93e3-aws-sao1.stream-io-video.com`).

### Port Ranges Used by Stream Video

**Signaling (HTTP and WebSocket over TLS):**

Access to signaling is required for all clients to establish a connection. Signaling uses a combination of WSS and HTTPs (TCP/433). Without this, clients will not be able to connect to the server.
You can test this by opening this link in your browser: `https://video.stream-io-api.com/`, this should show a JSON error response. If the page does not load or return some sort of HTML message, it is likely that your firewall is blocking access to the signaling server.

**WebRTC**

For audio/video to work you need clients to be able to connect to one of our video servers. The best connection is achieved when clients can connect to the server via UDP and NAT is configured correctly on your network. There are several fallback options available if UDP is blocked or unavailable, if NAT is not configured correctly, or if traffic is only allowed on specific ports.

Here is the list of ports used by Stream Video, for video to work correctly, your firewall must allow traffic for at least one of these ports:

- UDP 32768 - 46883 (Best)
- UDP 3478
- UDP(DTLS) 443
- TCP 3478
- TCP(TLS) 443 (Slowest)

**WebRTC - STUN (Session Traversal Utilities for NAT):**

STUN is used to discover the public IP address of the client. This is required for clients to connect to the server via UDP. Your firewall must allow traffic for the following ports:

- UDP 46884 - 60999

### Firewall and NAT Considerations

Real-time video experiences the best quality when using STUN over UDP. This setup requires allowing the designated UDP port range and configuring NAT (Network Address Translation) to work correctly on the user’s network.
If a client cannot connect via STUN/UDP, the SDK automatically switches to TURN, using either UDP or TCP as needed. This allows clients to connect directly to the server via TCP if UDP is blocked or unavailable.
TURN is also available over TCP for clients that are restricted from using UDP.

### Recommended Firewall Rules

To ensure compatibility and quality, configure the following rules:

- Ensure NAT is configured correctly on your network
- Ensure that HTTPS/WSS traffic is allowed, at least for addresses resolved by `*.stream-io-video.com`, `*.stream-io-api.com` and `*.getstream.io`
- Ensure that at least one of the port ranges used by WebRTC is allowed, at least for addresses resolved by `*.stream-io-video.com`, `*.stream-io-api.com` and `*.getstream.io`
- Allow TCP/443 and UDP/443 for all IPs listed by this DNS record `pool.turn.stream-io-video.com` (use `dig pool.turn.stream-io-video.com` to get the list)

This configuration ensures robust connectivity for all clients, maintaining the highest possible video quality across varying network environments.


---

This page was last updated at 2026-04-17T17:34:00.916Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/misc/networking/](https://getstream.io/video/docs/react-native/misc/networking/).