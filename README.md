# AlwaysCall

AlwaysCall is an Expo Router app that uses Supabase for passwordless email OTP authentication and room access control, plus Stream Video for real-time calling and in-app invite ringing.

## Stack

- Expo Router with native development builds
- Supabase Auth, Postgres, and Edge Functions
- Stream Video React Native SDK

## Development Build Requirement

This app does **not** support Expo Go for calling flows. Stream Video, WebRTC, device permissions, and ringing behavior require a native development build.

Use these scripts:

```bash
npm run ios
npm run android
npm start
```

- `npm run ios` and `npm run android` build and install the native development client.
- `npm start` runs `expo start --dev-client`, which expects that development build to already be installed on the simulator or device.
- Real devices are strongly recommended for validating camera, microphone, and invite ringing behavior.

## Environment

Copy the values into your local Expo environment:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
EXPO_PUBLIC_STREAM_API_KEY=your-stream-api-key
```

See `.env.example` for the same keys and notes about the legacy anon-key fallback.

## Supabase Setup

Apply database changes:

```bash
supabase db push
```

Set the Stream secrets used by the token bridge:

```bash
supabase secrets set STREAM_API_KEY=your-stream-api-key
supabase secrets set STREAM_API_SECRET=your-stream-api-secret
```

Deploy the Edge Function:

```bash
supabase functions deploy stream-token
```

## Local Run Flow

1. Install dependencies with `npm install`.
2. Ensure the Expo public env vars are available locally.
3. Apply Supabase migrations and deploy `stream-token`.
4. Install a development build with `npm run ios` or `npm run android`.
5. Start Metro with `npm start`.
6. Open the already-installed development build and connect to the Metro server.

## Calling Architecture

- Rooms use a long-lived `stream_call_id` so every participant joins the same active room call.
- Room invites now also store a unique `ringing_call_id` per invite so incoming Stream ringing can be matched safely even when the same room is invited repeatedly.
- Accepting an invite opens the room and joins the room call; the ringing call is only used as the incoming signal layer.

## Validation

- Run lint with `npm run lint`.
- Use the manual device checklist in [manual-device-validation-checklist.md](file:///Users/eklavya/Desktop/alwayscall/docs/manual-device-validation-checklist.md) for two-device verification of auth, permissions, room joins, and invite ringing.

## Notes

- `npm run prebuild` and `npm run prebuild:clean` are available if native projects need to be regenerated.
- The repo includes Stream documentation snapshots under `stream-react-native-docs-md` for local reference while implementing calling features.
