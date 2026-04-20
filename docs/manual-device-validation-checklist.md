# Manual Device Validation Checklist

Use two physical devices with different user accounts. This app relies on a development build, not Expo Go, for Stream Video and native media permissions.

## Prerequisites

- Install the latest development build on both devices.
- Confirm `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_STREAM_API_KEY` are set in the Expo environment.
- Confirm the `stream-token` Supabase Edge Function is deployed with valid `STREAM_API_KEY` and `STREAM_API_SECRET` secrets.
- Apply the latest Supabase migrations, including the invite ringing call ID migration.
- Sign in on both devices and complete onboarding.

## Core Validation

### Authentication and Stream bootstrap

- Request an email OTP on device A, enter the 6-digit code, and confirm the session restores after verification.
- Sign out and sign back in to confirm the Stream client reconnects cleanly.
- Confirm the home screen shows Stream as ready before entering a room.

### Room creation and join

- Create a room without a password on device A and open it.
- On device B, find the room by code, join it, and confirm both devices enter the same active room.
- Leave from device B and confirm device A remains stable in the room.
- Create a password-protected room on device A.
- On device B, verify an invalid password is rejected and the valid password allows the join.

### Camera and microphone permissions

- On first room join, deny camera and microphone permissions and confirm the app shows the permission guidance state.
- Re-open settings from the in-call UI, grant the blocked permission, and confirm the next join succeeds.
- Join the same room from both devices and confirm each device can hear and see the other.

### Invite persistence and unique ringing IDs

- From device A, open a joined room and invite device B.
- Confirm device B shows the incoming ringing overlay and the room invite also appears in the home screen invite list.
- Decline the ringing prompt on device B and confirm the invite disappears from the invite list.
- Send a new invite from device A to device B for the same room and confirm device B receives a fresh ringing prompt.
- While the second invite is still pending, verify the incoming call still resolves to the matching invite and room details instead of showing the sync error state.

### Accept flow

- Invite device B again from device A.
- Accept from the ringing overlay on device B and confirm the overlay dismisses, the app opens the target room, and both devices end up in the same room call.
- Repeat acceptance from the home screen invite list instead of the ringing overlay and confirm the result matches.

### Repeated and concurrent invite checks

- Invite device B to room 1, then invite the same device to room 2 from device A after handling the first invite.
- Confirm each ringing prompt resolves to the correct room metadata.
- Invite device B to the same room again after a decline and confirm the new ring still opens the correct room.

## Regression Notes

- Watch for stale incoming overlays after accept or decline.
- Watch for room navigation that opens the wrong room after a repeated invite.
- Watch for invite rows that remain pending after decline.
- Watch for call join failures caused by missing development-build native modules.
