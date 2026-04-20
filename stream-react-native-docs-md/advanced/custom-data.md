# Custom Data

Custom data adds key-value pairs to users, events, and most domain models in the Stream Video SDK.

Type definition:

```typescript
export type Custom = {
  [key: string]: any; // where `any` should be JSON-serializable value
};
```

## Adding custom data

Add custom data via Server-Side or Client SDKs when creating/updating users, events, reactions, and other models.

Example adding a `topic` field to a call:

```typescript
const call = client.call(type, id);
await call.getOrCreate({
  data: { custom: { topic: "Monthly sync" } },
});

// or update a custom field
await call.update({
  custom: { topic: "Weekly sync" },
});
```

## Reading custom data

Access custom data via the `custom` state property or `useCallCustomData()` hook:

```typescript
import { useEffect } from "react";
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useCallCustomData } = useCallStateHooks();
const custom = useCallCustomData();

const topic = custom?.topic;
console.log("The topic of the current call is:", topic);

useEffect(() => {
  console.log("The topic is changed to:", custom?.topic);
}, [custom]);
```


---

This page was last updated at 2026-04-17T17:34:03.542Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/custom-data/](https://getstream.io/video/docs/react-native/advanced/custom-data/).