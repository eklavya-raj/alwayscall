# Client & Authentication

## Client & Auth

## Best Practices

- **Use singleton pattern** - Always use `getOrCreateInstance()` to avoid multiple client instances
- **Use tokenProvider** - Prefer `tokenProvider` over static tokens for automatic refresh on expiry
- **Clean up on logout** - Call `disconnectUser()` when the user logs out
- **Server-side token generation** - Never generate tokens client-side in production

Set up the video client before joining a call. Basic example:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { id: "sara" };
const apiKey = "my-stream-api-key";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const client = StreamVideoClient.getOrCreateInstance({ apiKey, token, user });
```

- **API Key** - Found in your dashboard
- **User types** - Authenticated, anonymous, or guest
- **Custom data** - Store additional data on the user object as needed

Initialize the client when your application loads and use a context provider to make it available throughout your app.

## Generating a token

Generate tokens server-side using our [server SDKs](/video/docs/api/authentication/). Integrate token generation into your login/registration flow. Tokens authenticate users and control call access.

<token-snippet app="meeting" style="credentials"></token-snippet>

<admonition type="note">

For development purposes, you can use our [Token Generator](/chat/docs/react/tokens_and_authentication/).

</admonition>

## Different types of users

- **Authenticated users** - Users with an account on your app
- **Guest users** - Temporary accounts with a name and image for joining calls
- **Anonymous users** - Unauthenticated users, typically for watching livestreams

For authenticated users (default `user.type`), pass either `token` or
`tokenProvider`. For guest users, do not pass `token` or `tokenProvider`.
For anonymous users, `token` and `tokenProvider` are optional.

### Guest users

Guest user setup:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { id: "jack-guest", type: "guest" };
const apiKey = "my-stream-api-key";
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  user,
});
```

### Anonymous users

Anonymous user setup:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { type: "anonymous" };
const apiKey = "my-stream-api-key";
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  user,
});
```

Anonymous users don't establish a WebSocket connection and won't receive events. They can only watch livestreams or join calls.

You can also provide a call-scoped token (or token provider) for anonymous users:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { type: "anonymous" };
const apiKey = "my-stream-api-key";
const token = "<anonymous-token-with-call_cids>";
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  user,
  token,
});
```

The anonymous user token must include the `call_cids` field - an array of call CIDs the user can join.

Example JWT token payload for anonymous users:

```json
{
  "iss": "@stream-io/dashboard",
  "iat": 1726406693,
  "exp": 1726493093,
  "user_id": "!anon",
  "role": "viewer",
  "call_cids": ["livestream:123"]
}
```

## Connecting a user and error handling

Connect users in two ways:

**Automatic connection** - when creating the client:

```typescript
const client = new StreamVideoClient({
  apiKey,
  user,
  token,
  options: {
    maxConnectUserRetries: 3,
    onConnectUserError: (err: Error, allErrors: Error[]) => {
      console.error("Failed to connect user", err, allErrors);
      // handle the connect error, i.e. ask the user to retry
      // later when they have better connection or show an error message
    },
  },
});
```

**Manual connection** - using `client.connectUser()`:

```ts
const client = new StreamVideoClient({ apiKey });
try {
  await client.connectUser(user, token);
} catch (err) {
  console.error("Failed to connect user", err);
  // handle the connect error
}
```

### Disconnecting a user

Discard a client instance or disconnect a user with `client.disconnectUser()`:

```ts
await client.disconnectUser();
```


## Client options

### `token` or `tokenProvider`

For authenticated users, pass either a string `token` or a `tokenProvider`
function returning `Promise<string>`. You can also provide both together.
Anonymous users can also pass `token` or `tokenProvider` when needed.

<admonition type="info">

When using a `tokenProvider`, the SDK will automatically execute it to refresh the token whenever the token expires.

</admonition>

```typescript
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const tokenProvider = async () => {
  const response = await fetch("/api/token");
  const data = await response.json();
  return data.token;
};

const user: User = { id: "sara" };
const apiKey = "my-stream-api-key";
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  tokenProvider,
  user,
});
```

Or initialize with a static token:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { id: "sara" };
const apiKey = "my-stream-api-key";
const token = "<token-from-your-server>";
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  user,
  token,
});
```

When both are provided, the SDK uses `token` first and then `tokenProvider` for subsequent token refreshes:

```ts
import { StreamVideoClient, User } from "@stream-io/video-react-native-sdk";

const user: User = { id: "sara" };
const apiKey = "my-stream-api-key";
const token = "<token-from-your-server>";
const tokenProvider = async () => fetchTokenFromYourServer(user.id);
const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  user,
  token,
  tokenProvider,
});
```

### Reject incoming call when busy

Configure the client to auto-reject incoming calls when the user is already in a call by setting `rejectCallWhenBusy` to `true`.

```ts
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  tokenProvider,
  user,
  options: { rejectCallWhenBusy: true },
});
```

The SDK plays a busy tone on the caller's side when the callee rejects due to being busy.

### Logging

The SDK uses scoped logging. Each scope represents a module or group of modules.

Configure a sink and log level per scope. The SDK uses the `default` scope when no specific settings exist. A sink is a function that receives logs with level, message, and additional arguments.

Log levels by severity:

- trace: 0
- debug: 1
- info: 2
- warn: 3
- error: 4

Setting log level to `warn` for `event-dispatcher` scope shows only errors and warnings for that scope.

<admonition type="info">

Note that our SDK only logs errors that do not get re-thrown. Using our API (producing HTTP request) might result in errors which should be handled within individual integrations.

</admonition>

```ts
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";

const client = StreamVideoClient.getOrCreateInstance({
  apiKey,
  token,
  user,
  options: {
    logOptions: {
      default: {
        level: "info",
      },
      coordinator: {
        level: "warn",
        sink: (logLevel, message, ...rest) => {
          switch (logLevel) {
            case "warn": {
              console.warn(message, ...rest);
              break;
            }
            case "error": {
              SuperLogger.error(message, ...rest);
            }
          }
        },
      },
    },
  },
});
```

Augment the `default` scope settings to avoid configuring each SDK scope individually.

```ts
import { videoLoggerSystem } from "@stream-io/video-client";

import SuperLogger from "./SuperLogger";

videoLoggerSystem.configureLoggers({
  default: {
    level: "info",
    sink: (logLevel, message, ...rest) => {
      SuperLogger[logLevel](message, ...rest);
    },
  },
});
```

Reset specific scopes to defaults at runtime:

```ts
import { videoLoggerSystem } from "@stream-io/video-client";

videoLoggerSystem.configureLoggers({
  "event-dispatcher": {
    level: null,
    sink: null,
  },
});
```

This resets only `event-dispatcher`; other scopes remain unchanged. To reset all defaults:

```ts
import { videoLoggerSystem } from "@stream-io/video-client";

videoLoggerSystem.restoreDefaults();
```

## StreamVideo context provider

Use the `StreamVideo` context provider to make the SDK client available throughout your application. This example uses `tokenProvider` for server-side auth:

```tsx
import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-native-sdk";

const apiKey = "my-stream-api-key";
const user: User = { id: "sara", name: "Sara" };

export const MyApp = () => {
  const [client, setClient] = useState<StreamVideoClient>();
  useEffect(() => {
    const tokenProvider = () => Promise.resolve("<token>");
    const myClient = StreamVideoClient.getOrCreateInstance({
      apiKey,
      user,
      tokenProvider,
    });
    setClient(myClient);
    return () => {
      myClient.disconnectUser();
      setClient(undefined);
    };
  }, []);

  if (!client) return null;

  return (
    <StreamVideo client={client}>
      <MyVideoApp />
    </StreamVideo>
  );
};
```


---

This page was last updated at 2026-04-17T17:34:02.753Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/client-auth/](https://getstream.io/video/docs/react-native/guides/client-auth/).