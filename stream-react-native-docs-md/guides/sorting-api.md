# Participant sorting

The Participant Sorting API provides flexible participant sorting with common comparators and built-in presets.

## Best Practices

- **Use stable comparator references** - Define comparators outside component scope or memoize with `useMemo`
- **Use built-in presets** - Start with `defaultSortPreset`, `speakerLayoutSortPreset`, or `livestreamOrAudioRoomSortPreset`
- **Combine comparators** - Use `combineComparators` for complex sorting criteria
- **Disable when unnecessary** - Use `noopComparator()` or `useRawParticipants` to avoid sorting overhead

## `Comparator<T>` API overview

The `Comparator<T>` function takes two arguments and returns `-1`, `0`, or `1`. Works with `Array.sort` for any data type.

```ts
import {
  Comparator,
  combineComparators,
  conditional,
  descending,
} from "@stream-io/video-react-native-sdk";

type Participant = {
  id: number;
  name: string;
};

// comparator that sorts by name in ascending order
const byName: Comparator<Participant> = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

// comparator that sorts by id in ascending order
const byId: Comparator<Participant> = (a, b) => {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

// comparator that sorts by age in ascending order
const byAge: Comparator<Participant> = (a, b) => {
  if (a.age < b.age) return -1;
  if (a.age > b.age) return 1;
  return 0;
};

// creates a new comparator that sorts by name in descending order
const byNameDescending: Comparator<Participant> = descending(byName);

// `conditional` creates a new comparator that applies the provided comparator only
// if the provided predicate returns `true`. The `predicate` itself, takes the two arguments
// and returns a boolean value.
const byAgeIfEnabled: Comparator<Participant> = conditional(
  (a, b) => opts.isSortByAgeEnabled,
)(descending(byAge));

// combineComparator creates a new Comparator<T> that combines the provided comparators in one.
// this comparator will sort by name in descending order, by age if enabled,
// and then by id in ascending order
const sortingCriteria = combineComparators(
  byNameDescending,
  byAgeIfEnabled,
  byId,
);

// participants array
const sorted = [p1, p2, p3].sort(sortingCriteria);
```

<admonition type="tip">

The `Comparator<T>` API is quite generic and can be used to sort any type of data.
Works great in a pair with the [`Array.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) API.

</admonition>

## Built-in common comparators

Available comparators for participant sorting:

- `dominantSpeaker`: Sorts participants based on their dominance in the call.
- `speaking`: Sorts participants based on whether they are currently speaking.
- `screenSharing`: Sorts participants based on whether they are currently screen sharing.
- `publishingVideo`: Sorts participants based on whether they are currently publishing video.
- `publishingAudio`: Sorts participants based on whether they are currently publishing audio.
- `pinned`: Sorts participants based on whether they are pinned in the user interface.
- `reactionType(type)`: Sorts participants based on the type of reaction they have.
- `role(...roles)`: Sorts participants based on their assigned role.
- `name`: Sorts participants based on their names.
- `withParticipantSource`: Sorts participants based on their participant source.

Import from `@stream-io/video-react-native-sdk`:

```ts
import {
  dominantSpeaker,
  speaking,
  screenSharing,
  publishingVideo,
  publishingAudio,
  pinned,
  reactionType,
  role,
  name,
  withParticipantSource,
} from "@stream-io/video-react-native-sdk";

// ...
```

Use individually or combine for complex sorting.

## Sorting customization on the call level

Use `call.setSortParticipantsBy(comparator)` for dynamic runtime sorting based on user interactions or app logic.

Example:

```ts
import {
  useCall,
  combineComparators,
  dominantSpeaker,
  publishingVideo,
  publishingAudio,
  screensharing,
  speaking,
  reactionType,
  pinnned,
  SfuModels,
} from "@stream-io/video-react-native-sdk";

// ... boilerplate code

// we take the existing call instance
const call = useCall();

// we create a new comparator that combines the built-in comparators
// and sorts participants by the following criteria:
const comparator = combineComparators(
  pinned, // 1. pinned participants first
  screenSharing, // 2. participants who are screensharing
  dominantSpeaker, // 3. dominant speaker
  reactionType("raised-hand"), // 4. participants with raised hand
  speaking, // 5. participants currently speaking
  withParticipantSource(
    SfuModels.ParticipantSource.RTMP,
    SfuModels.ParticipantSource.SRT,
  ), // 6. participants with video ingress source (e.g.: OBS)
  publishingVideo, // 7. participants publishing video
  publishingAudio, // 8. participants publishing audio
  // 9. everyone else
);

// will apply the new sorting criteria immediately
call.setSortParticipantsBy(comparator);
```

<admonition type="note">

In some scenarios, we might want to have special sorting criteria for a specific component in our app.
For example, in the participant list component, we might want to sort participants by name.

</admonition>

For this purpose, we have extended the built-in `useParticipants` hook with a `sortBy: Comparator<StreamVideoParticipant>` option parameter.

```ts
import {
  combineComparators,
  name,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const { useParticipants } = useCallStateHooks();
// this will override the call's default sorting criteria
// and will return a list of participants sorted by name
const participants = useParticipants({ sortBy: name });

// you can also provide your custom comparator
const myComparator = combineComparators(/* ... */);
const participants = useParticipants({ sortBy: myComparator });
```

<admonition type="warning">

When using custom comparator in combination with the `useParticipants` hook, please make sure to provide a stable reference to the comparator.
Otherwise, you might end up with unexpected behavior (unexpected re-renders, etc.).

Our proposal is to use stateless comparators defined outside the component's scope.
In case you need to use a stateful comparator, please make sure to memoize it using [`React.useMemo`](https://react.dev/reference/react/useMemo) or [`React.useCallback`](https://react.dev/reference/react/useCallback) hooks.

```ts
// stateless comparator
const myStatelessComparator = combineComparators(/* ... */);

export const MyComponent = () => {
  const { useParticipants } = useCallStateHooks();
  // component scope
  const participants1 = useParticipants({ sortBy: myStatelessComparator });

  // memoized comparator
  const myStatefulComparator = React.useMemo(
    () => combineComparators(/* ... */),
    [dependency1, dependency2],
  );
  const participants2 = useParticipants({ sortBy: myStatefulComparator });

  // ...
};
```

</admonition>

## Built-in sorting presets

Pre-configured sorting criteria for specific call types:

- `defaultSortPreset`: The default sorting preset applicable to general call scenarios.
- `speakerLayoutSortPreset`: A preset specifically designed for the [`'default'` call type](/video/docs/react-native/guides/configuring-call-types/#default/), optimizing participant sorting for speaker layout view.
- `livestreamOrAudioRoomSortPreset`: A preset tailored for the [`'livestream'`](/video/docs/react-native/guides/configuring-call-types#livestream/) and [`'audio_room'`](/video/docs/react-native/guides/configuring-call-types#audio-room/) call types, ensuring optimal participant sorting in livestream or audio room scenarios.

Presets are auto-applied based on call type. Custom types use `defaultSortPreset` by default.

Import presets:

```ts
import {
  defaultSortPreset,
  speakerLayoutSortPreset,
  livestreamOrAudioRoomSortPreset,
} from "@stream-io/video-react-native-sdk";
```

<admonition type="tip">

For your custom call types, you can define your participant sorting presets and register them generally in the SDK.

Check the next section to learn how.

</admonition>

## Sorting customization on the call type

Define sorting per call type using the `CallTypes` registry:

```ts
import { combineComparators, CallTypes, CallType } from '@stream-io/video-react-native-sdk';

// setup your custom sorting preset
const myCustomSortPreset = combineComparators(/* ... */);

// update existing type
CallTypes.get('default').options.sortParticipantsBy = myCustomSortPreset;

// register new type
CallTypes.register(new CallType('my-custom-type', {
  options: {
    sortParticipantsBy: myCustomSortPreset,
  },
});
```

## Disabling participant sorting

Disable sorting with `noopComparator`:

```ts
import { noopComparator, useCall } from "@stream-io/video-react-native-sdk";

const call = useCall();
call.setSortParticipantsBy(noopComparator());
```

For specific components where order is irrelevant, use `useRawParticipants`:

```ts
import { useCallStateHooks } from "@stream-io/video-react-native-sdk";

const { useRawParticipants } = useCallStateHooks();
const unsortedParticipants = useRawParticipants();
```


---

This page was last updated at 2026-04-17T17:34:00.856Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/guides/sorting-api/](https://getstream.io/video/docs/react-native/guides/sorting-api/).