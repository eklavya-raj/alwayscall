# Deep Linking

This guide covers deep linking into video calls, extracting call IDs from URLs, and starting calls directly.

### Step 1 - Native Setup

<admonition type="note">

Prerequisites before following this guide is having an application with our Stream Video SDK integrated. You can follow our tutorials for the same to get started with an application.

</admonition>

<tabs>

<tabs-item value="android" label="Android">

Follow [this guide](https://developer.android.com/training/app-links/deep-linking#adding-filters) for Android deep linking setup.

#### Creating Intent Filters

Add intent filters to `AndroidManifest.xml` at `/android/app/src/main/AndroidManifest.xml`:

- **action** - ACTION_VIEW for Google Search reachability

```xml
<action android:name="android.intent.action.VIEW" />
```

- **data** - URI format tags with `android:scheme` attribute minimum

```xml
<data android:scheme="http" />
<data android:scheme="https" />
<!-- The URL here must exclude the scheme -->
<data android:host="`YOUR URL HERE`" />
```

- **category** - DEFAULT and BROWSABLE required for browser link resolution

```xml
<category android:name="android.intent.category.DEFAULT" />
<category android:name="android.intent.category.BROWSABLE" />
```

Complete intent filter:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="http" />
    <data android:scheme="https" />
    <!-- Example: "stream-calls-dogfood.vercel.app” -->
    <data android:host="`YOUR URL HERE`" />
</intent-filter>
```

#### Adding Asset Links

Android App Links use [Digital Asset Links API](https://developers.google.com/digital-asset-links) for automatic URL-to-app routing without user selection.

Verification steps:

1. Add `autoVerify` attribute to intent filters (as shown above)

2. [Declare association](https://developer.android.com/training/app-links/verify-android-applinks#web-assoc) by hosting Digital Asset Links JSON at:

```text
https://domain.name/.well-known/assetlinks.json
```

Generate `assetlink.json` using [this tool](https://developers.google.com/digital-asset-links/tools/generator):

- **Hosting site name** - Deep linking URL
- **App package name** - Found in `MainActivity.java` package declaration
- **App package fingerprint (SHA256)** - See [this guide](https://developers.google.com/android/guides/client-auth)

</tabs-item>

<tabs-item value="ios" label="iOS">

#### Adding deep linking support in AppDelegate

Link `RCTLinking` to handle incoming app links. Add to `AppDelegate.m` or `AppDelegate.mm`:

```objc
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
```

#### Setting up a URL scheme

In Xcode, open `YOUR_APP_NAME/ios/app-name.xcworkspace`, select project > **Info** tab > **URL types**:

1. **Identifier** - Your bundle ID
2. **URL Schemes** - Your URL prefix
3. **Role** - Editor

![Xcode Info URL Types](@video/react-native/_assets/advanced/deeplinking/xcode-info-url-types.png)

#### Setting up Universal schemes

<admonition type="note">

If your app is using [Universal Links](https://developer.apple.com/ios/universal-links/), you will need to add the following code as well.

</admonition>

```objc
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
```

##### Adding Associated Domains Entitlement

In **Signing & Capabilities**, add Associated Domains entitlement for Universal Links and web credentials support.

![Xcode Signing Capabilities](@video/react-native/_assets/advanced/deeplinking/xcode-signing-capabilitites.png)

1. Click + near **Capability**, search **Associated Domains**, add it
2. Add `applinks:your-domain.com`

This creates a `.entitlements` file in `ios/YOUR_APP_NAME`.

Create AASA file at `https://domain.name/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": ["<TeamID>.com.example.myapp"],
        "paths": ["*"]
      }
    ]
  }
}
```

Notes:

- **appID** - Prefix Bundle ID with Team ID from [Membership page](https://developer.apple.com/account/#/membership)
- **paths** - URIs to support; use wildcard (\*) for dynamic segments
- **apps** - Must be empty array

</tabs-item>

</tabs>

### Step 2 - Using the `Linking` API

Use React Native's [Linking](https://reactnative.dev/docs/linking) API:

- **App not open** - Use `getInitialURL()` to get initial URL
- **App open** - Listen via `addEventListener('url', callback)`

Example:

```tsx title="App.tsx"
const App = () => {
  useEffect(() => {
    const parseAndSetCallID = (url: string | null) => {
      const matchResponse = url?.match(`YOUR REGEX HERE`); // To match the paths and handle them accordingly
      if (matchResponse?.length) {
        // Your custom setup here.
      }
    };
    const { remove } = Linking.addEventListener("url", ({ url }) => {
      parseAndSetCallID(url);
    });
    const configure = async () => {
      const url = await Linking.getInitialURL();
      parseAndSetCallID(url);
    };
    configure();
    return remove;
  }, []);
};
```

Extract call ID from URL, start the call, and navigate accordingly.

### Recap

- **Android** - Intent filters in AndroidManifest, `assetlinks.json` on domain
- **iOS** - RCTLinking in AppDelegate, `apple-app-site-association` on domain
- **Handling** - Use React Native [Linking](https://reactnative.dev/docs/linking) API

Questions or feedback? Reach out to our team.


---

This page was last updated at 2026-04-17T17:34:03.569Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/advanced/deeplinking/](https://getstream.io/video/docs/react-native/advanced/deeplinking/).