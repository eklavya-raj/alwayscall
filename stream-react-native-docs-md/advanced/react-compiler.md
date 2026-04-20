# React Compiler

Migrate `useCallStateHooks()` usage for React Compiler compatibility.

React Compiler enforces stricter hook constraints for build-time optimization. `eslint-plugin-react-compiler` reports incompatible patterns.

## Problem

Calling `useCallStateHooks()` inside components violates React Compiler's static analysis:

```text
ESLint: Hooks must be the same function on every render, but this value may change over time to a different function.
See https://react.dev/reference/rules/react-calls-components-and-hooks#dont-dynamically-use-hooks (react-compiler/react-compiler)
```

### Why this breaks with React Compiler

`useCallStateHooks()` is a factory function, not a hook. Calling it inside components creates hook references during render that React Compiler cannot statically verify.

## Solution

Call `useCallStateHooks()` once at module scope, then use destructured hooks in components.

### Migration pattern

1. Alias import as `getCallStateHooks`
2. Call factory at module scope
3. Destructure hooks at top level
4. Use hooks in components

### What not to do

Don't call the factory inside components:

```tsx
import { useCallStateHooks as getCallStateHooks } from "@stream-io/video-react-native-sdk";

const MyComponent = () => {
  const hooks = getCallStateHooks(); // ❌ still dynamic, still triggers error
  const { useCallCallingState } = hooks;
  // ...
};
```

### Before / After

**Before:**

```tsx {5}
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";
import { View, Text } from "react-native";

const MyComponent = () => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  return (
    <View>
      <Text>State: {callingState}</Text>
      <Text>Participants: {participants.length}</Text>
    </View>
  );
};
```

**After:**

```tsx {1,4,7-8}
import { useCallStateHooks as getCallStateHooks } from "@stream-io/video-react-native-sdk";
import { View, Text } from "react-native";

const { useCallCallingState, useParticipants } = getCallStateHooks();

const MyComponent = () => {
  const callingState = useCallCallingState();
  const participants = useParticipants();

  return (
    <View>
      <Text>State: {callingState}</Text>
      <Text>Participants: {participants.length}</Text>
    </View>
  );
};
```

### Why alias to `getCallStateHooks`

Required because ESLint treats `use*` functions as hooks that cannot be called outside components. The alias clarifies it's a factory function.

## Automated Migration with Codemod

Use [`@stream-io/video-codemod`](https://www.npmjs.com/package/@stream-io/video-codemod) for automatic transformation.

### Usage

```bash
npx @stream-io/video-codemod use-call-state-hooks ./src \
  --extensions=ts,tsx \
  --parser=tsx \
  --run-prettier # optional, runs prettier on the transformed files
```


---

This page was last updated at 2026-04-17T17:34:01.690Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/react-compiler/](https://getstream.io/video/docs/react-native/advanced/react-compiler/).