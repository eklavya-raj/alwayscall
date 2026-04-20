# Roadmap & Changelog

## Up next

Features planned for upcoming releases:

- RTMP with AV1 + fallback codec
- Edge latency below 25ms and join full duration below 500ms
- Call attendance stats
- Realtime stats API for livestreams (fps, bitrate, ...)
- Raw track recording
- SIP outgoing calls
- Ingress events
- Translated closed-captions
- Geofencing v2 (user location restrictions, configurable fences, dashboard integration)
- RTSP ingress
- Fixed streaming key (RTMP/SRT)

## Changelog

### March 2026

Improved call reliability and lifecycle control

- New WebRTCJoinPolicy to delay join completion
- Calls end automatically when app backgrounds during ringing

Better audio/video UX and diagnostics

- Audio connection loading indicators
- Permission state tracking + noise cancellation improvements

Expanded customization for video experiences

- Video effects segmentation smoothing + model selection
- Recording error handling + UI state improvements

- SIP - incoming calls, DTMF event

### February 2026

- iOS + Android: Raw, individual, and composite recording support; new recording listing APIs (older query methods deprecated)
- Android: USB microphone support
- All SDKs: Improved flat-line no-audio detection; fixed stale speaking-while-muted detection
- React: Microphone setup detector API added
- All SDKs: Improved incoming call flow for missing camera/audio permissions; speech detection now respects device permissions
- React Native: Updated CallKit integration and audio handling improvements; added stereo playing support

### January 2026

- WHIP with simulcast support
- React Native: Updated CallKit integration and audio handling; added stereo playing support
- iOS: Fixed `callSettings` not propagating correctly and microphone stopping when screen was locked

### December 2024

- New dashboard call stats
- 100k participants benchmark
- Ringing notifications for individual members
- React SDK: Test Microphone and Speaker UI
- React Native SDK: Granular Audio Routing

### November 2024

- Hi-Fi and Stereo playback support (Android)
- Moderation blur and warning events
- Telecom support on Android

### October 2024

- Kick user out of call functionality
- VP9 and AV1 support: React (1.7.0), React Native (1.2.0), Plain-JS (1.9.0)
- Dynascale to remove simulcast/SVC on 1-1 calls: React (1.7.0), React Native (1.2.0), Plain-JS (1.9.0)
- [Golang SDK](/video/docs/api/) publicly available
- Manual quality selection: React (1.5.0), React Native (1.1.0), Plain-JS (1.8.0)

### September 2024

- TURN UDP on well-known IP address range
- [SRT ingress](/video/docs/api/streaming/srt/) support
- Audio hi-fi release (web and RTMP-ingress, iOS/Android following)
- [WHIP ingress](/video/docs/api/streaming/whip/) released
- React Native v1.0.0 released
- Reconnects v2: React (v1.3.0+), React Native (v1.0.0), Plain-JS (v1.6.0)

### August 2024

- New TURN/STUN on TCP/UDP 443 and static IP ranges
- Picture in Picture (PiP) support for React Native iOS (v0.10.5)
- RTMP out support

### July 2024

- Inbound video pause: React v1.19.0, React Native v1.19.0, Plain-JS v1.27.0
- Automatic video track pause (congestion control)
- Agents Python SDK alpha release
- Picture in Picture (PiP) support on Flutter SDK

### June 2024

- Improved video telemetry stats on Android SDK
- Integrated video moderation available out of the box
- Stereo audio support: React v1.18.6, React Native v1.17.1, Plain-JS v1.25.0
- Blur and AI video filters for React Native (Android, iOS)
- [Moderation endpoints](/video/docs/api/moderation/overview/) (blocking users, banning, muting)

### May 2024

- Noise cancellation support for React Native v1.14.0
- S3 compatible storage support (e.g., [minIO](https://min.io/))
- Improved telemetry and device performance data collection: React v1.15.0, React Native v1.12.0, Plain-JS v1.21.0
- [Python SDK v1.0.0](https://github.com/GetStream/stream-video-python) released
- [React SDK v1.0.0](https://github.com/GetStream/stream-video-js/releases/tag/%40stream-io%2Fvideo-react-sdk-1.0.0) and [Plain-JS v1.0.0](https://github.com/GetStream/stream-video-js/releases/tag/%40stream-io%2Fvideo-client-1.0.0) released
- iOS SDK v1.0 released
- Session timers API
- User bans across video/chat

### April 2024

- Endpoint to [query call participants](/video/docs/api/calls/#query-call-members)
- [Improved support for teams & multi-tenant](/video/docs/api/multi-tenant/)
- Analytics for calls GA on Stream Dashboard
- [Noise cancellation](https://github.com/GetStream/stream-video-js/releases/tag/%40stream-io%2Fvideo-react-sdk-0.6.12) for React and Plain-JS
- Riverside RTMP streaming support
- React SDK v0.6.0, React Native SDK v0.6.0, Plain-JS SDK v0.7.0
- [Background blur and filters](https://github.com/GetStream/stream-video-js/releases/tag/%40stream-io%2Fvideo-react-sdk-0.5.10) for React and Plain-JS
- Telemetry data collection: React v1.14.0, React Native v1.11.0, Plain-JS v1.19.0
- Flutter Video SDK v0.3.5: Picture in Picture for Android

### March 2024

- Call statistics reporting: React, React Native, Plain-JS

### February 2024

- React Video SDK v0.5.0 release
- React Native Video SDK v0.5.0 release
- Transcriptions went live
- iOS SDK v0.5 release
- External storage for recorded calls (S3, Google Cloud, Azure)
- Flutter Video SDK v0.3.2: fast reconnect, background VoIP callback for iOS terminated state, push notifications enhancements
- Official Java SDK released
- HLS end of stream tag support
- Frame recorder egress for keyframe images over webhooks

### January 2024

- Major HLS latency improvements (average delay reduced from 20s to 10s)
- Codec negotiation support: React v1.10.0, React Native v1.8.0, Plain-JS v1.15.0
- Closed captions support: React v1.9.0, React Native v1.6.0, Plain-JS v1.14.0
- Audio & video filter support on iOS and Android
- Screensharing supported for all mobile SDKs

### December 2023

- Flutter Video SDK v0.3.0

### November 2023

- Unity SDK GA
- Recording 2.0 live
- Composite layout support
- Python and Node.js server-side SDKs live and documented

### October 2023

- React/Plain-JS SDK screen share audio support
- iOS SDK v0.4 release
- Android SDK v0.4.0 release
- React v0.4.0 and Plain-JS v0.4.0 release

### September 2023

- React Native release
- Expo support
- Video call benchmark up to 10k participants
- Android SDK v0.3.4 with fast reconnect
- Thumbnails for livestreaming previews
- React SDK v0.3.31 (LivestreamLayout, thumbnail support)
- Flutter SDK v0.1.0 (improved VoIP/CallKit, SDK alignment)

### August 2023

- iOS SDK v0.3 release
- React v0.3, JS-SDK v0.3 (improved call state handling, device management)
- Android SDK v0.3 release (ringing, livestreaming, chat improvements)
- RTMP supports multiple resolutions and audio levels
- Benchmark up to 400 video call participants
- Livestream tutorials

### July 2023

- Android SDK v0.2 release
- iOS SDK v0.2 release
- Kotlin, Swift, React and Flutter v0.1 release

## Backlog

Features under consideration:

- Dashboard stats improvements
- PHP SDK
- Expand external storage support to R2, Digital Ocean Spaces and Supabase
- Tap to focus (supported by iOS atm)
- Whiteboards
- Camera controls
- WHEP
- Client-side recording
- Ruby SDK
- C# SDK (server-side)
- Ingress for SDI, NDI, MTS/MPEG-2 TS, RIST and Zixi
- Multicast support for WHIP
- Waiting room


---

This page was last updated at 2026-04-17T17:34:02.964Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/roadmap_and_changelog/](https://getstream.io/video/docs/react-native/roadmap_and_changelog/).