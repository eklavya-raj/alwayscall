# Tasks
- [x] Task 1: Prepare the Expo app for Stream Video native requirements.
  - [x] Add the Stream Video SDK, WebRTC, and required Expo config plugin dependencies.
  - [x] Update app configuration for development builds, minimum Android SDK, and camera/microphone permissions.
  - [x] Ensure the app shell uses the required root wrappers and entry-point structure for Stream Video.
  - [x] Validation: confirm the app can build in a development build configuration intended for real-device testing.

- [x] Task 2: Implement Supabase magic-link authentication and session restoration.
  - [x] Add the email sign-in screen and magic-link request flow.
  - [x] Handle deep-link return and restore authenticated sessions on app launch.
  - [x] Add authenticated and unauthenticated route guards.
  - [x] Validation: confirm a user can request a magic link, sign in, and resume a valid session.

- [x] Task 3: Add first-login account creation and profile persistence.
  - [x] Define the minimum user profile fields required for app discovery and calling.
  - [x] Create the account completion screen shown only to newly authenticated users without a completed profile.
  - [x] Persist the profile in Supabase and route returning users past onboarding.
  - [x] Validation: confirm new users must complete the profile once, while returning users skip this step.

- [x] Task 4: Add secure Stream authentication bridging.
  - [x] Implement a trusted server-side path to mint Stream user tokens for authenticated Supabase users.
  - [x] Create a singleton Stream client with a token provider and logout cleanup.
  - [x] Align the Stream user identity with the app profile identity.
  - [x] Validation: confirm an authenticated user connects successfully to Stream and disconnects on logout.

- [x] Task 5: Implement room creation and room join flows.
  - [x] Define the room data model with owner, room identifier, and optional password protection.
  - [x] Build UI to create passwordless and password-protected rooms.
  - [x] Build UI to join a room and validate access for protected rooms.
  - [x] Validation: confirm room creation works and invalid passwords are rejected cleanly.

- [x] Task 6: Implement the active call experience with Stream Video.
  - [x] Create the room call screen and join the related Stream call.
  - [x] Add the minimum in-call controls for camera, microphone, leave, and participant visibility.
  - [x] Handle call lifecycle cleanup when leaving the room or logging out.
  - [x] Validation: confirm two authenticated users can join the same room and communicate on real devices.

- [x] Task 7: Implement user discovery and room invite flow.
  - [x] Add a user directory or search flow over registered app users.
  - [x] Allow the room owner to send an invite to any selected user for the current room.
  - [x] Show an in-app incoming invite/call prompt to the recipient and support accept-to-join.
  - [x] Structure the invite flow so Stream ringing and push support can be added later without reworking room ownership or membership.
  - [x] Validation: confirm the room owner can invite another registered user and the recipient can enter the room from the invite.

- [x] Task 8: Verify quality, permissions, and readiness for the next milestone.
  - [x] Validate camera, microphone, and auth edge cases.
  - [x] Run linting and any focused checks added during implementation.
  - [x] Review whether background ringing push support should be scheduled as a follow-up change after the in-app invite flow is stable.
  - [x] Validation: confirm the implementation satisfies all checklist items or create follow-up tasks for any gaps.

- [x] Task 9: Fix verification gaps in invite delivery and implementation readiness.
  - [x] Decouple in-app ringing from the long-lived room call by introducing a unique ringing-call identifier per invite.
  - [x] Update the invite persistence and root incoming-call matching flow to use the unique ringing-call identifier safely.
  - [x] Align repo guidance with the development-build requirement and add a concrete manual validation checklist for real devices.
  - [x] Validation: confirm the invite architecture no longer depends on reusing room call IDs and the repo guidance matches the implemented setup.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2] and [Task 3]
- [Task 5] depends on [Task 3] and [Task 4]
- [Task 6] depends on [Task 4] and [Task 5]
- [Task 7] depends on [Task 3], [Task 5], and [Task 6]
- [Task 8] depends on [Task 1] through [Task 7]
- [Task 9] depends on [Task 8]
