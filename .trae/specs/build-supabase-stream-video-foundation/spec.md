# Supabase + Stream Video Calling Spec

## Why
The app needs a clear v1 foundation for authenticated video calling with Supabase and the Stream Video React Native SDK. The current project is an Expo Router app, so the spec must also capture the native development-build requirements needed to make Stream Video work correctly.

## What Changes
- Integrate Supabase magic-link authentication with session restore.
- Add a first-login account creation flow for newly authenticated users.
- Add secure Stream user token issuance tied to authenticated Supabase users.
- Add room creation with owner, shareable room identifier, and optional password protection.
- Add room join flow for authenticated users.
- Add Stream-powered audio/video call screens so two users can join the same room and talk.
- Add an owner-to-user invite flow so a room owner can invite any registered user in the app.
- Support in-app incoming invite/call handling for the first milestone, while structuring the app so Stream ringing push setup can be added later for background and terminated states.
- Configure the Expo app for Stream Video native requirements, including development builds, config plugins, permissions, and real-device testing expectations.

## Impact
- Affected specs: authentication, onboarding, video calling, room management, invite delivery, mobile native configuration
- Affected code: `app`, `components`, `hooks`, `app.json`, Supabase integration layer, Stream client/token integration, room and invite data models

## ADDED Requirements
### Requirement: Stream Video Mobile Foundation
The system SHALL configure the Expo-based React Native app to run the Stream Video SDK in a development build instead of Expo Go.

#### Scenario: App is prepared for native video dependencies
- **WHEN** the mobile app is configured for Stream Video
- **THEN** it uses the required Stream/React Native WebRTC dependencies and Expo config plugins
- **AND** Android minimum SDK and camera/microphone permission requirements are declared
- **AND** the implementation assumes testing on real devices for end-to-end calling behavior

### Requirement: Magic Link Authentication
The system SHALL authenticate users through Supabase magic link email sign-in.

#### Scenario: User signs in from email link
- **WHEN** a user requests a magic link and completes sign-in
- **THEN** the app creates or restores the authenticated Supabase session
- **AND** the app routes the user into the authenticated portion of the application

### Requirement: First Login Account Completion
The system SHALL require a newly authenticated user to complete an account creation page before using calling features.

#### Scenario: New user completes account setup
- **WHEN** a user authenticates for the first time and has no completed profile record
- **THEN** the app opens an account creation screen
- **AND** the user can save the minimum required profile fields needed for discovery and calling
- **AND** the app routes the user to the main calling experience after the profile is saved

#### Scenario: Returning user skips account setup
- **WHEN** an authenticated user already has a completed profile
- **THEN** the app skips the account creation page
- **AND** the user lands directly in the authenticated app flow

### Requirement: Stream Auth Bridging
The system SHALL connect authenticated app users to Stream Video using server-issued tokens and a client-side token provider.

#### Scenario: Authenticated user connects to Stream
- **WHEN** an authenticated user enters the calling area of the app
- **THEN** the app requests a Stream token from a trusted server-side integration
- **AND** the Stream client is initialized as a singleton for that user
- **AND** logout disconnects the Stream client and clears user-specific session state

### Requirement: Room Creation and Access Control
The system SHALL allow authenticated users to create rooms that are either passwordless or password-protected.

#### Scenario: Owner creates passwordless room
- **WHEN** a user creates a room without a password
- **THEN** the system stores the room with the user as owner
- **AND** the room can be joined by authorized authenticated users without entering a password

#### Scenario: Owner creates password-protected room
- **WHEN** a user creates a room with a password
- **THEN** the system stores the room with protected access
- **AND** non-owners must provide the correct password before joining

#### Scenario: User enters wrong room password
- **WHEN** a user attempts to join a protected room with an invalid password
- **THEN** the system denies room entry
- **AND** the app shows a clear error state without joining the call

### Requirement: Room Join and Active Call
The system SHALL let multiple authenticated users join the same room and participate in an active Stream Video call.

#### Scenario: Two users talk in the same room
- **WHEN** two authenticated users join the same room successfully
- **THEN** both users enter the same Stream call
- **AND** both users can use microphone and camera controls according to granted permissions
- **AND** both users can hear and see each other while connected

#### Scenario: User leaves the call
- **WHEN** a participant exits the room or logs out
- **THEN** the app leaves the Stream call cleanly
- **AND** the app disposes call-related state to avoid stale audio/video sessions

### Requirement: User Directory and Invites
The system SHALL let a room owner invite any registered app user to join the room.

#### Scenario: Owner invites another user
- **WHEN** a room owner searches or selects a registered user from the app directory
- **THEN** the system creates an invite linked to the target room and user
- **AND** the recipient can see an incoming in-app invite or call prompt while active in the app

#### Scenario: Recipient accepts an invite
- **WHEN** the invited user accepts the incoming invite
- **THEN** the app navigates the user into the target room
- **AND** the user joins the associated Stream call if access checks pass

### Requirement: Ringing Extension Path
The system SHALL keep the invite and call architecture compatible with Stream ringing support for a later milestone.

#### Scenario: Future background ringing support is added
- **WHEN** background or terminated-state incoming calling is implemented later
- **THEN** the app can extend the invite flow with Stream ringing, push providers, and native incoming-call handling without redesigning the room model

## MODIFIED Requirements
- None.

## REMOVED Requirements
- None.
