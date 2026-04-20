# Call Stats Report

This guide explains how to interpret and use the data provided by the `useCallStatsReport()` hook.

## Basic Usage

The `useCallStatsReport` hook provides comprehensive call statistics including aggregated and raw stats for both publisher (local participant) and subscriber (remote participants). Stats include video and audio metrics with separate aggregations.

Reports emit every 2 seconds by default. Buffer reports in component state for historical data (e.g., charts).

```ts
const { useCallStatsReport } = useCallStateHooks();
const {
  datacenter, // The datacenter where this participant is connected to
  publisherStats, // Aggregated video stats for the publisher, which is the local participant
  publisherAudioStats, // Aggregated audio stats for the publisher, which is the local participant
  publisherRawStats, // Raw stats for the publisher, which is the local participant
  subscriberStats, // Aggregated video stats for the subscriber, which are the remote participants
  subscriberAudioStats, // Aggregated audio stats for the subscriber, which are the remote participants
  subscriberRawStats, // Raw stats for the subscriber, which are the remote participants
  participants, // Optional stats for individual participants
  timestamp, // The timestamp of the stats report
} = useCallStatsReport();

// aggregated video stats for the publisher
console.log("Publisher Video Stats:", {
  timestamp: publisherStats.timestamp,
  totalBytesSent: publisherStats.totalBytesSent,
  averageJitterInMs: publisherStats.averageJitterInMs,
  averageRoundTripTimeInMs: publisherStats.averageRoundTripTimeInMs,
  qualityLimitationReasons: publisherStats.qualityLimitationReasons,
  codec: publisherStats.codec,
});

// aggregated audio stats for the publisher
console.log("Publisher Audio Stats:", {
  timestamp: publisherAudioStats.timestamp,
  totalBytesSent: publisherAudioStats.totalBytesSent,
  averageJitterInMs: publisherAudioStats.averageJitterInMs,
  averageRoundTripTimeInMs: publisherAudioStats.averageRoundTripTimeInMs,
  codec: publisherAudioStats.codec,
});

// aggregated video stats for the subscriber
console.log("Subscriber Video Stats:", {
  timestamp: subscriberStats.timestamp,
  totalBytesReceived: subscriberStats.totalBytesReceived,
  averageJitterInMs: subscriberStats.averageJitterInMs,
  averageRoundTripTimeInMs: subscriberStats.averageRoundTripTimeInMs,
  highestFrameWidth: subscriberStats.highestFrameWidth,
  highestFrameHeight: subscriberStats.highestFrameHeight,
  highestFramesPerSecond: subscriberStats.highestFramesPerSecond,
});

// aggregated audio stats for the subscriber
console.log("Subscriber Audio Stats:", {
  timestamp: subscriberAudioStats.timestamp,
  totalBytesReceived: subscriberAudioStats.totalBytesReceived,
  averageJitterInMs: subscriberAudioStats.averageJitterInMs,
  averageRoundTripTimeInMs: subscriberAudioStats.averageRoundTripTimeInMs,
  codec: subscriberAudioStats.codec,
  totalConcealedSamples: subscriberAudioStats.totalConcealedSamples,
  totalConcealmentEvents: subscriberAudioStats.totalConcealmentEvents,
  totalPacketsReceived: subscriberAudioStats.totalPacketsReceived,
  totalPacketsLost: subscriberAudioStats.totalPacketsLost,
});
```

### Reporting interval adjustment

Adjust the default 2-second reporting interval before joining the call.

<admonition type="warning">

Keep the interval at 2 seconds or higher to avoid excessive CPU usage.

</admonition>

```ts
// to set the stats reporting interval to 3.5 seconds
call.setStatsReportingIntervalInMs(3500);
await call.join();

// to disable stats reporting
call.setStatsReportingIntervalInMs(0);
```

## Subscribing to individual participant stats

Subscribe to stats for individual participants to monitor specific participant performance.

<admonition type="warning">

This advanced feature adds CPU pressure. Use only when necessary.

</admonition>

Example:

```ts
const { useParticipants, useCallStatsReport } = useCallStateHooks();
const participants = useParticipants();

// to subscribe to stats for a specific participant,
const sara = participants.find((p) => p.user_id === "sara");
call.startReportingStatsFor(sara.sessionId);

// to consume the stats for that participant
const callStatsReport = useCallStatsReport();
const saraStats = callStatsReport.participants?.[sara.sessionId];

// returns an array of stats for every available video layer (q, h, f)
const saraVideoStats = saraStats?.streams.filter(
  (s) => s.trackType === SfuModels.TrackType.VIDEO,
);

for (const layer of saraVideoStats) {
  console.log("Sara's Video Stats:", {
    rid: layer.rid, // The RID of the layer (q, h, f)
    bytesSent: layer.bytesSent,
    codec: layer.codec,
    frameWidth: layer.frameWidth,
    frameHeight: layer.frameHeight,
    framesPerSecond: layer.framesPerSecond,
    jitter: layer.jitter,
    qualityLimitationReason: layer.qualityLimitationReason,
  });
}

// returns an array of stats for audio tracks
const saraAudioStats = saraStats?.streams.filter(
  (s) => s.trackType === SfuModels.TrackType.AUDIO,
);

for (const layer of saraAudioStats) {
  console.log("Sara's Audio Stats:", {
    bytesSent: layer.bytesSent,
    bytesReceived: layer.bytesReceived,
    codec: layer.codec,
    jitter: layer.jitter,
    audioLevel: layer.audioLevel,
    concealedSamples: layer.concealedSamples,
    concealmentEvents: layer.concealmentEvents,
    packetsReceived: layer.packetsReceived,
    packetsLost: layer.packetsLost,
  });
}

// to stop reporting stats for that participant
call.stopReportingStatsFor(sara.sessionId);
```



---

This page was last updated at 2026-04-17T17:34:03.644Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/stats/](https://getstream.io/video/docs/react-native/advanced/stats/).