# Firebase Cloud Messaging

Configure Stream Video push notifications using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging).

### Get the Firebase Credentials

Provide your Firebase credentials to Stream to enable push notifications.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project (or create one if needed).

2. Click the gear icon next to **Project Overview** and navigate to **Project settings**:

![Opening Firebase's Project settings](@shared/assets/notifications_firebase_setup_step_1.jpeg)

3. Navigate to the **Service Accounts** tab. Under **Firebase Admin SDK**, click **Generate new private key** to download the credentials JSON file.

![Generate your Firebase Credentials json file](@shared/assets/notifications_firebase_setup_step_2.png)

### Upload the credentials and create a push provider

In the [Stream Dashboard](https://dashboard.getstream.io/), select **Push Notifications**:

![Selecting Push Notifications menu in Stream Dashboard](@shared/assets/dashboard-push-notifications-menu.png)

Click **New Configuration** and select the **Firebase** provider. Configure these fields:

| Field Name         | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `Name`             | Provider identifier used in SDK/API calls               |
| `Description`      | Optional description for identifying this configuration |
| `Credentials JSON` | Firebase credentials for sending push notifications     |

Configuration steps:

1. Enter a name in the **Name** field (referenced in your code)
2. Upload the Firebase credentials JSON file
3. Enable the provider using the toggle
4. Click **Create**

Example configuration using `firebase` as the name:

![Setting up your Firebase Credentials on the Stream Dashboard](@shared/assets/dashboard-firebase-push-configuration-example.png)



---

This page was last updated at 2026-04-17T17:34:01.371Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/push-providers/firebase/](https://getstream.io/video/docs/react-native/incoming-calls/push-providers/firebase/).