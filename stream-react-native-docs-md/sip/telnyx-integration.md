# Telnyx Integration

This guide walks through integrating Stream SIP Interconnect with [Telnyx](https://telnyx.com/) using SIP Connections and Call Control.

## Prerequisites

- A configured SIP trunk in Stream with credentials copied (see [Inbound Trunk](/video/docs/api/sip/inbound-trunk/)).
- A [Telnyx account](https://telnyx.com/sign-up).

## Steps

### 1. Create a Telnyx account

Go to [Telnyx sign-up](https://telnyx.com/sign-up) and create an account if you don't have one already.

### 2. Buy a phone number

Purchase a phone number from the Telnyx Mission Control Portal under **Numbers** > **Buy Numbers**.

### 3. Create a SIP Connection

In the Telnyx Mission Control Portal, navigate to **Voice** > **SIP Trunking** and click **Create SIP Connection**. Set the connection type to **FQDN**.

![Creating a SIP Connection in the Telnyx dashboard](@video/api/_assets/sip-telnyx-create.png)

### 4. Add FQDN credentials

Once the connection is created, go to **Authentication and routing** tab. Under **FQDNs**, click **Add FQDN** and enter the FQDN and port from your Stream inbound trunk configuration (found in the [GetStream dashboard](/video/docs/api/sip/inbound-trunk/)):

- **DNS record type**: A
- **FQDN**: Your Stream SIP bridge address (e.g., `4187.frankfurt-sip.stream-io-video.com`)
- **Port**: `5060`

![Adding FQDN credentials from the GetStream dashboard](@video/api/_assets/sip-telnyx-fqdn.png)

### 5. Configure inbound settings

Navigate to the **Inbound** tab and set the following number formats:

- **Destination number format**: `+E.164`
- **Origination number format**: `+E.164`

![Setting +E.164 number format for destination and origination](@video/api/_assets/sip-telnyx-e164.png)

### 6. Assign the phone number

Associate your purchased phone number with the SIP Connection you created. Go to the **Numbers** tab and assign the number.

### 7. Test the connection

Place a call to your Telnyx number and verify the call appears in the Stream dashboard. You can monitor and join the call from the [Dashboard](/video/docs/api/sip/dashboard-debugging/).


---

This page was last updated at 2026-04-17T17:34:03.139Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/sip/telnyx-integration/](https://getstream.io/video/docs/react-native/sip/telnyx-integration/).