# CallKit optional setup

## Custom ringtone setup

Below you can see ringtone audio resource requirements:

**Supported formats**:

- `.caf` (Core Audio Format) — recommended
- `.aiff` (Audio Interchange File Format)
- `.m4a` (MPEG-4 Audio)

**Duration**: under 30 seconds

**Naming**: simple name without spaces or special characters (e.g., ringtone.caf, my_ringtone.aiff)

### How to add custom ringtone file

#### Step 1: Add the Sound File to Your Xcode Project

Open your iOS project in Xcode:

```bash
cd ios
open YourAppName.xcworkspace
```

In Xcode:

1. Right-click your main app folder/group in the Project Navigator
2. Select "Add Files to [YourAppName]..."
3. Choose your sound file
4. Ensure:
   - ✅ "Copy items if needed" is checked
   - ✅ "Create groups" is selected (not "Create folder references")
   - ✅ Your app target is selected in "Add to targets"
5. Click "Add"
6. Verify:
   - The file appears in the Project Navigator
   - In the File Inspector (right panel), the file is included in your app target

#### Step 2: Update Your Configuration

In your React Native code where you configure `StreamVideoRN.setPushConfig()`, set the sound property to match your filename (without the extension):

```javascript
StreamVideoRN.setPushConfig({
  ios: {
    sound: "ringtone", // Match your file name (without extension)
    // ... rest options
  },
  // ... rest of your configuration
});
```

**Examples:**

- File: `ringtone.caf` → Use `sound: 'ringtone'`
- File: `my_custom_ringtone.aiff` → Use `sound: 'my_custom_ringtone'`
- File: `incoming_call.m4a` → Use `sound: 'incoming_call'`

#### Step 3: Rebuild and Test

Rebuild your iOS app:

```bash
npx react-native run-ios
# or
yarn ios
```

Test with an incoming call to verify the custom ringtone plays.

<admonition type="warning">
Custom ringtones for Expo will be added soon
</admonition>

## CallKit Icon setup

### Image Requirements

**Format:**

- `.png` (recommended)

**Design requirements:**

- Template image: monochrome (white/transparent or black/transparent)
- iOS will tint it automatically
- Square aspect ratio recommended
- Recommended sizes: 40x40pt, 60x60pt, or 80x80pt (provide @1x, @2x, @3x)

**Naming:**

- Simple name without spaces or special characters (e.g., `callkit_icon`, `app_icon`)

### How to add custom icon

#### Method 1: Using Images.xcassets (Recommended)

**Prepare your image:**

- Create a monochrome template image (white/transparent or black/transparent)
- Export at @1x, @2x, and @3x (e.g., 40x40, 80x80, 120x120 pixels)

**Add the image to your Xcode project:**

Open your iOS project in Xcode:

```bash
cd ios
open YourAppName.xcworkspace
```

In Xcode:

1. In the Project Navigator, locate `Images.xcassets` (usually under your app folder)
2. Right-click `Images.xcassets` → "New Image Set"
3. Name it (e.g., `callkit_icon`)
4. Drag your images into the slots:
   - **1x**: @1x image
   - **2x**: @2x image
   - **3x**: @3x image
5. In the Attributes Inspector, set "Render As" to "Template Image"

**Update your configuration:**

```javascript
StreamVideoRN.setPushConfig({
  ios: {
    imageName: "callkit_icon", // Match your image set name
    // ... rest options
  },
  // ... rest of your configuration
});
```

**Rebuild and test:**

```bash
npx react-native run-ios
# or
yarn ios
```

#### Method 2: Using Direct PNG Files

**Prepare your image:**

- Create a monochrome template PNG
- Name it simply (e.g., `callkit_icon.png`)

**Add the file to your Xcode project:**

Open your iOS project in Xcode:

```bash
cd ios
open YourAppName.xcworkspace
```

In Xcode:

1. Right-click your main app folder/group
2. Select "Add Files to [YourAppName]..."
3. Choose your PNG file
4. Ensure:
   - ✅ "Copy items if needed" is checked
   - ✅ "Create groups" is selected
   - ✅ Your app target is selected
5. Click "Add"

**Update your configuration:**

```javascript
StreamVideoRN.setPushConfig({
  ios: {
    imageName: "callkit_icon", // Match your file name (without .png extension)
  },
  // ... rest of your configuration
});
```

**Rebuild and test:**

```bash
npx react-native run-ios
# or
yarn ios
```

<admonition type="warning">
Custom CallKit icon for Expo will be added soon
</admonition>


---

This page was last updated at 2026-04-17T17:34:01.435Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/incoming-calls/callkit-optional-setup/](https://getstream.io/video/docs/react-native/incoming-calls/callkit-optional-setup/).