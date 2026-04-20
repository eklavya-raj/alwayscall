# Audio and Video

Stream Video includes an API that allows you to take moderation actions—such as flagging, blocking, muting, banning, and deleting users—when necessary. These API endpoints can be used by moderators and automated content systems. This section explains how you can capture audio and video and send them to your own moderation models or external tools.

### Moderating Speech

You can capture speech from your calls and analyze it with moderation tools in three ways:

1. **Audio recordings**: Create recordings of your calls.
2. **Call transcriptions**: Generate text transcriptions after your calls.
3. **Live captions**: Use real-time captions for immediate moderation.

The first two methods provide a recording or transcription after the call is finished. For real-time moderation, use live captions and handle the corresponding caption events.

In all cases, set up a webhook handler on your backend to listen for events. Depending on your chosen approach, listen to the appropriate event type:

- [`call.recording_ready`](/video/docs/api/webhooks/events/#CallRecordingReadyEvent/)
- [`call.transcription_ready`](/video/docs/api/webhooks/events/#CallTranscriptionReadyEvent/)
- [`call.closed_caption`](/video/docs/api/webhooks/events/#ClosedCaptionEvent/)

### Moderating Video

You can also use moderation tools for video, which is useful for enforcing content policies in your calls. There are three ways to moderate video for calls running on Stream:

1. **Keyframe events**: Use the built-in keyframe recorder to receive keyframe events every few seconds during a call.
2. **Video recordings**: Create recordings of calls for moderation after the session.
3. **RTMP-out broadcasting**: Connect to an external provider using RTMP-out broadcasting.

The simplest and most cost-effective approach for live video moderation is using keyframe events. Each event contains the most recent keyframe (still image) from each participant in the call. You can find more information on how frame recording works [here](/video/docs/api/recording/frame-recording/).

Alternatively, you can use call recordings to perform video moderation after the call. To do this, set up a webhook handler on your server to process the [`call.recording_ready`](/video/docs/api/webhooks/events/#CallRecordingReadyEvent/) event.

The RTMP-out broadcasting approach relies on RTMP to integrate with some content moderation providers (e.g., Hive Moderation) by forwarding the video stream to their platform. Note that this method is usually more expensive.

### Integrating with Stream Moderation

Stream offers a moderation product that allows you to detect content, submit flagged content and provides a moderation dashboard for moderators to review all content flagged by users or by API integrations. More information and documentation about this can be found [here](https://getstream.io/moderation/).


---

This page was last updated at 2026-04-17T17:34:03.142Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/moderation/audio-video/](https://getstream.io/video/docs/react-native/moderation/audio-video/).