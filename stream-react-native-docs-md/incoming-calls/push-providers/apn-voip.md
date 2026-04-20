# Apple push notification service

Configure Stream Video push notifications using Apple Push Notification service ([APNs](https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns)).

**Prerequisites:**

- Paid Apple developer account
- [Registered App ID](https://developer.apple.com/help/account/identifiers/register-an-app-id/) with [Push Notification capability](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-app) enabled.

Delivering push notifications to iOS apps requires establishing an authenticated connection with APNs. There are two authentication options — a token-based approach using a `.p8 key` or a certificate-based approach using a `.p12 file`. You only need to set up one of them. We recommend using a `.p8 key`.

<tabs>

<tabs-item value="p8" label=".p8 key">

### Getting a .p8 key (Recommended)

The `.p8` authentication key is the preferred method because a single key works across all your apps and doesn't expire, unlike `.p12` certificates which must be renewed annually.

1. Sign in to your [Apple Developer Account](https://developer.apple.com/account/) and navigate to **Certificates, Identifiers & Profiles** > [**Keys**](https://developer.apple.com/account/resources/authkeys).

2. Click the **+** (plus) button to register a new key.

3. Give your key a descriptive name (e.g., "Stream Push Key") and tick the **Apple Push Notifications service (APNs)** checkbox. Make sure **Sandbox & Production** is selected under the APNs configuration, then click **Continue** followed by **Register**.

4. Click **Download** to save the `.p8` file. Store it in a secure location — Apple only lets you download this file once.

> **Important:** Apple limits you to two `.p8` keys per developer account. If you already have two and need a new one, you must revoke an existing key first — and any service relying on the revoked key will stop working.

5. Make a note of the following values — you'll need them when configuring the push provider in the Stream Dashboard:
   - **Key ID** — shown on the key details page and also embedded in the `.p8` filename (e.g., `AuthKey_ABC123.p8`).
   - **Team ID** — displayed in the upper-right corner of your [Apple Developer account](https://developer.apple.com/account/).
   - **Bundle ID** — your app's identifier, found under [**Identifiers**](https://developer.apple.com/account/resources/identifiers/list) in your developer account or in **Xcode > your target > Signing & Capabilities**.

</tabs-item>

<tabs-item value="p12" label=".p12 certificate file">

### Getting a .p12 certificate file (Alternative to p8)

1. In [Apple's Developer Portal](https://developer.apple.com/account/resources/certificates/add), select **Apple Push Notifications service SSL (Sandbox & Production)**, then click Continue.

![Selecting service for push notification certificate](@shared/assets/apple-appstore-push-notification-selection.png)

2. Choose your App ID and click Continue.

3. Create and upload a **Certificate Signing Request (CSR)** ([instructions](https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request)), then click Continue.

4. Download the _.cer_ file.

5. Convert the _.cer_ file to _.p12_:
   - Double-click the _.cer_ file to add it to the login keychain
   - Open Applications > Utilities > Keychain Access
   - Select the "login" keychain
   - In the Certificates tab, right-click the certificate and export as _.p12_
   - Leave the password empty when exporting

</tabs-item>

</tabs>

### Upload the certificate and create a push provider

In the [Stream Dashboard](https://dashboard.getstream.io/), select **Push Notifications**:

![Selecting Push Notifications menu in Stream Dashboard](@shared/assets/dashboard-push-notifications-menu.png)

Click **New Configuration** and select the **APN** provider. Configure these fields:

| Field Name                      | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `Name`                          | Provider identifier used in SDK/API calls                            |
| `Description`                   | Optional description for identifying this configuration              |
| `Bundle/Topic ID`               | Your app's bundle ID for push notifications                          |
| `TeamID`                        | Apple Team ID (found in top right of Apple developer account)        |
| `KeyID`                         | p8 key identifier (found in keys section of Apple developer account) |
| `.p8 Token or .p12 Certificate` | Authentication token or certificate for sending push notifications   |

Configuration steps:

1. Enter a name in the **Name** field (used in your code)
2. Add your app's bundle ID
3. Upload the _.p8_ key or _.p12_ file with the required Apple details
4. Enable the provider using the toggle
5. Click **Create**

Example configuration using `voip` as the name:

![Screenshot shows the upload of push certificate](@shared/assets/dashboard-voip-push-configuration-example.png)



---

This page was last updated at 2026-04-17T17:34:03.431Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/push-providers/apn-voip/](https://getstream.io/video/docs/react-native/incoming-calls/push-providers/apn-voip/).