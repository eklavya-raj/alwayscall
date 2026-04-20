# Inbound Trunk

An inbound SIP trunk allows external VoIP calls to be routed into Stream calls via the **Stream SIP bridge**. This page covers how to create a trunk, configure routing rules, and obtain the credentials needed for your SIP provider.

## SIP Credentials

SIP credentials are required to authenticate requests when connecting to the **Stream SIP bridge**, in addition to the SIP address. These credentials consist of a **username** and **password** associated with an account. You can find and manage these credentials in the **Stream dashboard**.

## 1. Create a SIP Trunk

Go to the video section on the dashboard. Click on **Trunk** under the **SIP** section.

![SIP Trunk section in the dashboard](@video/api/_assets/sip-trunk-section.png)

## 2. Configure the trunk

Enter a trunk name and the phone number you purchased from your provider (Twilio, Telnyx) and click **Create**.

![Create SIP Trunk](@video/api/_assets/sip-trunk-create.png)

## 3. Configure a routing rule

This determines where an incoming SIP call to the **Stream SIP bridge** should be routed within Stream, specifically to which **call ID (Stream call)**. You can choose between two routing options:

- **Fixed Call ID** - All incoming SIP calls are routed to a predefined Stream call ID, e.g. `hospital-fixed-line`
- **Dynamic Call ID** - The call ID is determined dynamically based on information provided using a template, e.g. `hospital-line-{{uuid}}`

| Fixed Call ID                                                      | Dynamic Call ID                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| ![Fixed Call ID routing](@video/api/_assets/sip-routing-fixed.png) | ![Dynamic Call ID routing](@video/api/_assets/sip-routing-dynamic.png) |

## 4. Copy credentials to your provider

Once created, you can copy the credentials to your provider. See the provider-specific guides for detailed instructions:

- [Twilio Quick Start](/video/docs/api/sip/twilio-quickstart/)
- [Telnyx Integration](/video/docs/api/sip/telnyx-integration/)


---

This page was last updated at 2026-04-17T17:34:03.138Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/sip/inbound-trunk/](https://getstream.io/video/docs/react-native/sip/inbound-trunk/).