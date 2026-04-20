# Rate limits

Stream enforces rate limits to ensure the stability of our service for our customers and to encourage a performant integration. Stream powers user interactions for some of the world's largest apps and has scaling infrastructure to accommodate. Rate limits can be increased at customers' requests and by upgrading to larger usage plans.

[Our default rate limits are documented below](#default-rate-limits-by-endpoint). Rate limits are higher for Enterprise plans depending on capacity and use case. Talk to your Customer Success Manager for increases.

Every Application has rate limits applied based on a combination of API endpoint and platform: these limits are set on a 1-minute time window. For example, different operations have different limits per endpoint. Likewise, different platforms such as iOS, Android or your server-side infrastructure have independent counters for each API endpoint's rate limit.

<admonition type="info">

**Dynamic Rate Limiting**: Rate limits may be adjusted based on overall platform load and your application's individual usage patterns for query endpoints. During periods of high demand, the platform may temporarily reduce rate limits to ensure stability and fair resource allocation for all users. Monitor the `X-RateLimit-*` headers in API responses to track your current limits.

</admonition>

## Types of rate limits

There are two kinds of rate limits:

- **User Rate Limits**: Apply to each user and platform combination and help to prevent a single user from consuming your Application rate limits.
- **App rate limits**: App rate limits are calculated per endpoint and platform combination for your application.

## User Rate Limits

To avoid individual users consuming your entire quota, every single user is limited to at most 60 requests per minute (per API endpoint and platform). When the limit is exceeded, requests from that user and platform will be rejected.

## App Rate Limits

Stream supports four different platforms via our official SDKs:

- **Server**: SDKs that execute on the server including Node, Python, Ruby, Go, C#, PHP, and Java.
- **Android**: SDKs that execute on an Android device including Kotlin, Java, Flutter, and React Native for Android clients.
- **iOS**: SDKs that execute on an iOS device including Swift, Flutter, and React Native for iOS clients.
- **Web**: SDKs that execute in a browser including React, Angular, or vanilla JavaScript clients.

Rate limit quotas are not shared across different platforms. This way if by accident a server-side script hits a rate limit, you will not have any impact on your mobile and web applications. When the limit is hit, all calls from the same app, platform, and endpoint will result in an error with a 429 HTTP status code.

App rate limits are administered both per minute and per second. The per-second limit is equal to the per-minute limit divided by 30 to allow for bursts.


## Default rate limits by endpoint

| API Endpoint            | Rate limit per minute |
| ----------------------- | --------------------- |
| AcceptCall              | 1000                  |
| BlockUser               | 1000                  |
| CheckExternalStorage    | 300                   |
| CollectUserFeedback     | 1000                  |
| CreateCallType          | 300                   |
| CreateDevice            | 300                   |
| CreateExternalStorage   | 300                   |
| CreateGuest             | 1000                  |
| DeleteCall              | 60                    |
| DeleteCallType          | 300                   |
| DeleteDevice            | 60                    |
| DeleteExternalStorage   | 300                   |
| DeleteRecording         | 1000                  |
| DeleteTranscription     | 1000                  |
| EndCall                 | 1000                  |
| GetCall                 | 1000                  |
| GetCallStats            | 60                    |
| GetCallType             | 300                   |
| GetEdges                | 300                   |
| GetOrCreateCall         | 1000                  |
| GoLive                  | 300                   |
| JoinCall                | 1000                  |
| ListCallTypes           | 300                   |
| ListDevices             | 60                    |
| ListExternalStorage     | 300                   |
| ListRecordings          | 1000                  |
| ListTranscriptions      | 1000                  |
| MuteUsers               | 1000                  |
| QueryAggregateCallStats | 60                    |
| QueryCallStats          | 60                    |
| QueryCalls              | 1000                  |
| QueryUserFeedback       | 60                    |
| QueryMembers            | 300                   |
| RejectCall              | 1000                  |
| RequestPermission       | 1000                  |
| SendEvent               | 10000                 |
| SendVideoReaction       | 1000                  |
| StartClosedCaptions     | 300                   |
| StartHLSBroadcasting    | 1000                  |
| StartRTMPBroadcasts     | 1000                  |
| StartRecording          | 300                   |
| StartTranscription      | 300                   |
| StopAllRTMPBroadcasts   | 1000                  |
| StopClosedCaptions      | 300                   |
| StopHLSBroadcasting     | 1000                  |
| StopLive                | 300                   |
| StopRTMPBroadcast       | 1000                  |
| StopRecording           | 300                   |
| StopTranscription       | 300                   |
| UnblockUser             | 1000                  |
| UpdateCall              | 1000                  |
| UpdateCallMembers       | 1000                  |
| UpdateCallType          | 300                   |
| UpdateExternalStorage   | 300                   |
| UpdateUserPermissions   | 1000                  |
| VideoConnect            | 10000                 |
| VideoPin                | 1000                  |
| VideoUnpin              | 1000                  |

## What To Do When You've Hit a Rate Limit

You should always review responses from Stream to watch for error conditions. If you receive 429 status, this means your API request was rate-limited and you will need to retry. We recommend implementing an exponential back-off retry mechanism.

Here are a few things to keep in mind to avoid rate limits on server-side:

1. **Slow down your scripts**: This is the most common cause of rate limits. You're running a cronjob or script that runs many API calls in succession. Adding a small timeout in between API calls typically solves the issue.

2. **Use batch endpoints**: Batch update endpoints exist for many operations. So instead of making many calls to update one resource each, use the batch endpoint to update multiple resources in one request.

3. **Query only when needed**: Sometimes apps will call a query endpoint to see if an entity exists before creating it. Many of Stream's endpoints have an upsert behaviour, so this isn't necessary in most cases.

4. If rate limits are still a problem, Stream can set higher limits for certain pricing plans:

- For Standard plans, Stream may also raise rate limits in certain instances. An integration review is required to ensure your integration is making optimal use of the default rate limits before any increase will be applied.
- For Enterprise plans, Stream will review your architecture, and set higher rate limits for your production application.


## Rate limit headers

API responses include rate limit information in headers.

| Header                | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| X-RateLimit-Limit     | the total limit allowed for the resource requested (i.e. 5000) |
| X-RateLimit-Remaining | the remaining limit (i.e. 4999)                                |
| X-RateLimit-Reset     | when the current limit will reset (Unix timestamp)             |


This is how you can access rate limit information on server-side SDKs:

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
const response = client.....;
const rateLimit = response.metadata.rateLimit;

// the total limit allowed for the resource requested
console.log(rateLimit.rateLimit);
// the remaining limit
console.log(rateLimit.rateLimitRemaining);
// when the current limit will reset - Date
console.log(rateLimit.rateLimitReset);

// or

try {
    client....
} catch (error) {
    const rateLimit = response.metadata.rateLimit;
    if (error.metadata.responseCode === 429) {
        // Wait until rate limit resets and then retry
    }
}
```

</tabs-item>

</tabs>

## Inspecting rate limits

Stream offers the ability to inspect an App's current rate limit quotas and usage in your App's dashboard. Alternatively you can also retrieve the API Limits for your application using the API directly.

<tabs groupId="examples">

<tabs-item value="js" label="JavaScript">

```js
// 1. Get Rate limits, server-side platform
limits = await client.getRateLimits({ server_side: true });

// 2. Get Rate limits, all platforms
limits = await client.getRateLimits();

// 3. Get Rate limits, iOS and Android
limits = await client.getRateLimits({ ios: true, android: true });

// 4. Get Rate limits for specific endpoints
limits = await client.getRateLimits({
  endpoints: "QueryCalls,GetOrCreateCall",
});
```

</tabs-item>

<tabs-item value="curl" label="cURL">

```bash
# 1. Get Rate limits, server-side platform
curl -X GET "https://video.stream-io-api.com/api/v2/rate_limits?api_key=${API_KEY}&server_side=true" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# 2. Get Rate limits, all platforms
curl -X GET "https://video.stream-io-api.com/api/v2/rate_limits?api_key=${API_KEY}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# 3. Get Rate limits, iOS and Android
curl -X GET "https://video.stream-io-api.com/api/v2/rate_limits?api_key=${API_KEY}&ios=true&android=true" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"

# 4. Get Rate limits for specific endpoints
PAYLOAD='QueryCalls,GetOrCreateCall';
ENCODED_PAYLOAD=$(echo ${PAYLOAD} | perl -MURI::Escape -lne 'print uri_escape($_)')

curl -X GET "https://video.stream-io-api.com/api/v2/rate_limits?api_key=${API_KEY}&endpoints=${ENCODED_PAYLOAD}" \
  -H "Authorization: ${TOKEN}" \
  -H "stream-auth-type: jwt"
```

</tabs-item>

</tabs>


---

This page was last updated at 2026-04-17T17:34:00.934Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/misc/rate_limits/](https://getstream.io/video/docs/react-native/misc/rate_limits/).