# Overview

Session Initiation Protocol (SIP) interconnect refers to a configuration where two or more SIP-based networks or systems are linked to enable the exchange of voice traffic between them.

Stream SIP Interconnect enables VoIP calls from external third-party services to connect with Stream video/audio calls, creating a seamless bridge between participants joining through SIP networks and those connected via the Stream Client SDKs over WebRTC.

<admonition type="note">

Currently, only **inbound trunks** are supported. This means external SIP calls can be routed into Stream calls, but outbound dialing from Stream to SIP endpoints is in development.

</admonition>

## Features

- **[Inbound Trunk](/video/docs/api/sip/inbound-trunk/)** — Configure SIP trunks with credentials and routing rules to receive calls on the Stream SIP bridge.
- **[DTMF](/video/docs/api/sip/dtmf/)** — Handle touch-tone (DTMF) input from SIP callers for IVR menus, pin-code entry, and more.
- **[Dashboard & Debugging](/video/docs/api/sip/dashboard-debugging/)** — Monitor active SIP calls, join calls for testing, and debug common issues from the Stream dashboard.

## Supported Providers

Stream SIP Interconnect works with any standards-compliant SIP provider. We provide step-by-step guides for:

- **[Twilio](/video/docs/api/sip/twilio-quickstart/)** — Quick start using TwiML for SIP dial-in.
- **[Telnyx](/video/docs/api/sip/telnyx-integration/)** — Integration using SIP Connections and Call Control.

## Prerequisites

- A [Stream account](https://getstream.io/try-for-free/) with video/audio enabled.
- A VoIP phone number purchased from a supported provider (Twilio, Telnyx, or another SIP-compliant service).


---

This page was last updated at 2026-04-17T17:34:00.919Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/sip/overview/](https://getstream.io/video/docs/react-native/sip/overview/).