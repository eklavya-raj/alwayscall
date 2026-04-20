# Twilio Quick Start

This guide walks through integrating Stream SIP Interconnect with [Twilio Voice](https://www.twilio.com/docs/voice) using TwiML for SIP dial-in.

## Prerequisites

- A configured SIP trunk in Stream with credentials copied (see [Inbound Trunk](/video/docs/api/sip/inbound-trunk/)).
- A [Twilio account](https://www.twilio.com/try-twilio).

## Steps

### 1. Create a Twilio account

Go [here](https://www.twilio.com/try-twilio) and create an account if you don't have one already.

### 2. Buy a VoIP number

Purchase a phone number from Twilio. Refer to [this guide](https://help.twilio.com/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console) for instructions.

### 3. Configure a TwiML bin

Configure the VoIP number to use a [TwiML bin](https://www.twilio.com/docs/serverless/twiml-bins) to handle incoming calls.

### 4. Create a TwiML app

Create a TwiML app that uses this bin and copy paste the TwiML config from the Stream dashboard (the credentials you obtained when [creating your trunk](/video/docs/api/sip/inbound-trunk/)).

![TwiML configuration](@video/api/_assets/twilio-twiml-config.png)

### 5. Assign the phone number

Update the phone number associated with the previously created TwiML bin.

![Update phone number](@video/api/_assets/twilio-phone-number.png)

### 6. Test the connection

You can place a call to the Twilio number and monitor the call status directly from the Stream dashboard. You can also join the call from there to test the connection and experience it in action.

![Call monitoring dashboard](@video/api/_assets/sip-call-monitoring.png)

For more on monitoring and debugging SIP calls, see [Dashboard & Debugging](/video/docs/api/sip/dashboard-debugging/).


---

This page was last updated at 2026-04-17T17:34:00.920Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/sip/twilio-quickstart/](https://getstream.io/video/docs/react-native/sip/twilio-quickstart/).