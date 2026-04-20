# Android custom ringtone

## Custom ringtone setup

### Audio File Requirements

**Supported formats:**

- `.mp3` (MPEG Audio)
- `.ogg` (Ogg Vorbis)
- `.wav` (Waveform Audio)
- `.m4a` (MPEG-4 Audio)

**Requirements:**

- **Duration**: under 30 seconds recommended
- **Naming**: lowercase, no spaces; use underscores instead of hyphens (e.g., `ringtone.mp3`, `my_custom_ringtone.ogg`)

<admonition type="note">
The system normalizes names to lowercase and replaces hyphens with underscores
</admonition>

### How to add custom ringtone file

#### Step 1: Prepare Your Sound File

- Ensure your sound file is in a supported format
- Name it using lowercase letters, numbers, and underscores only (e.g., `ringtone.mp3`, `incoming_call.ogg`)

#### Step 2: Add the Sound File to Your Android Project

**Locate the Android resources directory:**

- Navigate to `android/app/src/main/res/` in your project

**If the `raw` folder doesn't exist, create it:**

```bash
mkdir -p android/app/src/main/res/raw
```

**Copy your sound file to the raw folder:**

```bash
# Example: Copy your sound file
cp path/to/your/ringtone.mp3 android/app/src/main/res/raw/ringtone.mp3
```

**Or manually:**

1. Copy your sound file
2. Paste it into `android/app/src/main/res/raw/`
3. Ensure the filename uses lowercase letters, numbers, and underscores only

**Verify the file structure:**

```plaintext
android/app/src/main/res/
└── raw/
    └── ringtone.mp3  (or your sound file)
```

#### Step 3: Update Your Configuration

In your React Native code where you configure `StreamVideoRN.setPushConfig()`, set the sound property in the Android configuration:

```javascript
StreamVideoRN.setPushConfig({
  android: {
    incomingChannel: {
      sound: "ringtone", // Match your file name (without extension, or with extension)
    },
  },
  // ... rest of your configuration
});
```

**Examples:**

- File: `ringtone.mp3` → Use `sound: 'ringtone'` or `sound: 'ringtone.mp3'`
- File: `my_custom_ringtone.ogg` → Use `sound: 'my_custom_ringtone'` or `sound: 'my_custom_ringtone.ogg'`
- File: `incoming-call.wav` → Use `sound: 'incoming_call'` (hyphens are converted to underscores)

#### Step 4: Rebuild and Test

Clean and rebuild your Android app:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
# or
yarn android
```

Test with an incoming call to verify the custom ringtone plays.

<admonition type="warning">
Custom ringtones for Expo will be added soon
</admonition>


---

This page was last updated at 2026-04-17T17:34:03.475Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/android-custom-ringtone/](https://getstream.io/video/docs/react-native/incoming-calls/android-custom-ringtone/).