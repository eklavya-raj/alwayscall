import notifee, { EventType } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import {
    getMessaging,
    setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import {
    StreamVideoClient,
    StreamVideoRN,
    firebaseDataHandler,
    isFirebaseStreamVideoMessage,
    onAndroidNotifeeEvent,
    oniOSExpoNotificationEvent,
} from '@stream-io/video-react-native-sdk';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { getPersistedStreamUser, requestStreamUserToken } from '@/lib/stream';

const androidPushProviderName =
  process.env.EXPO_PUBLIC_STREAM_PUSH_PROVIDER_ANDROID ?? 'production-fcm-video';
let isInitialized = false;

async function createBackgroundStreamClient() {
  const persistedUser = await getPersistedStreamUser();

  if (!persistedUser) {
    return undefined;
  }

  return StreamVideoClient.getOrCreateInstance({
    apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
    options: {
      rejectCallWhenBusy: true,
    },
    tokenProvider: requestStreamUserToken,
    user: persistedUser,
  });
}

function navigateToCallCenter() {
  try {
    router.push('/(tabs)/invites' as never);
  } catch {
    // Ignore navigation errors during cold start. The call UI can still recover after boot.
  }
}

export function initializeStreamPush() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  StreamVideoRN.updateConfig({
    foregroundService: {
      android: {
        channel: {
          id: 'alwayscall-active-call',
          name: 'Active calls',
        },
        notificationTexts: {
          body: 'Tap to return to your call',
          title: 'Call in progress',
        },
      },
    },
  });

  const pushConfig = {
    android: {
      callChannel: {
        id: 'alwayscall-call-updates',
        importance: 4,
        name: 'Call updates',
      },
      callNotificationTextGetters: {
        getBody: (type: string) =>
          type === 'call.missed' ? 'Missed call.' : 'Tap to open AlwaysCall.',
        getTitle: (type: string, createdUserName: string) =>
          type === 'call.live_started'
            ? `${createdUserName} started a live call`
            : type === 'call.missed'
              ? `Missed call from ${createdUserName}`
              : `${createdUserName} sent a call update`,
      },
      incomingChannel: {
        id: 'alwayscall-incoming',
        name: 'Incoming calls',
        sound: 'default',
        vibration: true,
      },
      notificationTexts: {
        accepting: 'Joining call...',
        rejecting: 'Declining call...',
      },
      pushProviderName: androidPushProviderName,
      // Expo prebuild generates a notification icon resource with this name.
      smallIcon: 'notification_icon',
      titleTransformer: (memberName: string, incoming: boolean) =>
        incoming ? `${memberName} is calling` : `Calling ${memberName}`,
    },
    createStreamVideoClient: createBackgroundStreamClient,
    ios: {},
    isExpo: true,
    onTapNonRingingCallNotification: navigateToCallCenter,
    shouldRejectCallWhenBusy: true,
  } as const;

  StreamVideoRN.setPushConfig(pushConfig);

  if (Platform.OS === 'android') {
    const messagingInstance = getMessaging(getApp());

    setBackgroundMessageHandler(messagingInstance, async (message) => {
      if (isFirebaseStreamVideoMessage(message)) {
        await firebaseDataHandler(message.data);
      }
    });

    // Intentionally do NOT register a foreground `onMessage` handler for
    // Stream ringing pushes. The Stream WebSocket delivers the call event
    // directly to the running client, which renders the incoming call UI via
    // `RootIncomingCallOverlay`. Adding `firebaseDataHandler` in foreground
    // would show a duplicate system notification on top of our overlay.
    // See stream docs: incoming-calls/ringing-setup/expo.md.

    notifee.onBackgroundEvent(async (event) => {
      await onAndroidNotifeeEvent({ event });
    });

    notifee.onForegroundEvent((event) => {
      if (event.type !== EventType.UNKNOWN) {
        onAndroidNotifeeEvent({ event });
      }
    });
  }

  Notifications.addNotificationResponseReceivedListener((response) => {
    if (Platform.OS === 'ios') {
      oniOSExpoNotificationEvent(response.notification);
    } else {
      navigateToCallCenter();
    }
  });
}
