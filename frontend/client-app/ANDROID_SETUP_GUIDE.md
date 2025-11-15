# Android Setup Guide for Firebase Phone Authentication

## Prerequisites

- Android Studio installed
- Firebase project created
- `google-services.json` downloaded from Firebase Console

---

## Step 1: Add google-services.json

1. Download `google-services.json` from Firebase Console:
   - Open [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Project Settings** (gear icon)
   - Under "Your apps", select your Android app
   - Click **Download google-services.json**

2. Place it in the correct location:
   ```bash
   # From the project root
   cp ~/Downloads/google-services.json android/app/
   ```

3. Verify file location:
   ```
   android/
   └── app/
       ├── build.gradle
       └── google-services.json  ← Must be here
   ```

---

## Step 2: Update Project-Level build.gradle

**File:** `android/build.gradle`

```gradle
buildscript {
    ext {
        buildToolsVersion = '34.0.0'
        minSdkVersion = 22
        compileSdkVersion = 34
        targetSdkVersion = 34
        androidxActivityVersion = '1.8.0'
        androidxAppCompatVersion = '1.6.1'
        androidxCoordinatorLayoutVersion = '1.2.0'
        androidxCoreVersion = '1.12.0'
        androidxFragmentVersion = '1.6.2'
        coreSplashScreenVersion = '1.0.1'
        androidxWebkitVersion = '1.9.0'
        junitVersion = '4.13.2'
        androidxJunitVersion = '1.1.5'
        androidxEspressoCoreVersion = '3.5.1'
    }

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'  // ← ADD THIS LINE
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

---

## Step 3: Update App-Level build.gradle

**File:** `android/app/build.gradle`

Add at the top (after existing plugins):

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // ← ADD THIS LINE
```

Add Firebase dependencies in the `dependencies` block:

```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
    
    // ⬇️ ADD FIREBASE DEPENDENCIES BELOW
    
    // Firebase BoM (Bill of Materials)
    implementation platform('com.google.firebase:firebase-bom:33.5.0')
    
    // Firebase Authentication
    implementation 'com.google.firebase:firebase-auth'
    
    // Google Play Services Auth (required for phone auth)
    implementation 'com.google.android.gms:play-services-auth:21.2.0'
    
    // ⬆️ END FIREBASE DEPENDENCIES
    
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}
```

**Complete dependencies section should look like:**

```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:33.5.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.android.gms:play-services-auth:21.2.0'
    
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}
```

---

## Step 4: Register Plugin in MainActivity

**File:** `android/app/src/main/java/com/property/app/MainActivity.java`

```java
package com.property.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

// ⬇️ ADD THIS IMPORT
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // ⬇️ REGISTER THE PLUGIN
        registerPlugin(FirebaseAuthenticationPlugin.class);
    }
}
```

---

## Step 5: Generate SHA Fingerprints

### For Debug Keystore

The debug keystore is automatically created by Android SDK:

```bash
# Navigate to android directory
cd android

# Generate signing report
./gradlew signingReport
```

**Look for output like:**

```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
SHA-256: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90
```

**Copy the SHA-1 and SHA-256 values.**

### For Release Keystore

If you have a release keystore:

```bash
keytool -list -v -keystore ~/path/to/your-release-key.jks -alias your-key-alias
```

Enter your keystore password when prompted.

### Alternative Method (Manual)

**For Debug:**

```bash
keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android
```

---

## Step 6: Add SHA Fingerprints to Firebase

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Under "Your apps", select your Android app
5. Scroll down to **SHA certificate fingerprints**
6. Click **Add fingerprint**
7. Paste the SHA-1 value and click **Save**
8. Click **Add fingerprint** again
9. Paste the SHA-256 value and click **Save**

**Important:** Add fingerprints for BOTH debug and release keystores.

---

## Step 7: Update AndroidManifest.xml (If Needed)

**File:** `android/app/src/main/AndroidManifest.xml`

Ensure you have the required permissions:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_SMS" />  <!-- Optional for auto-read -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />  <!-- Optional for auto-read -->

</manifest>
```

**Note:** SMS permissions are optional and only needed if you want automatic OTP detection.

---

## Step 8: Sync and Build

### Sync Capacitor

```bash
# From project root
cd metainflu/frontend/client-app

# Build Vue app
npm run build

# Sync with Capacitor
npx cap sync android
```

### Open in Android Studio

```bash
npx cap open android
```

### Build from Android Studio

1. Wait for Gradle sync to complete
2. Click **Build** > **Make Project**
3. Fix any errors that appear
4. Click **Run** (green play button) to install on device/emulator

### Build from Command Line

```bash
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 9: Enable Phone Authentication in Firebase

1. Go to Firebase Console > **Authentication**
2. Click **Sign-in method** tab
3. Find **Phone** in the list
4. Click **Phone** to expand
5. Toggle **Enable** switch
6. Click **Save**

### Add Test Phone Numbers (Optional)

For testing without SMS charges:

1. In Phone provider settings, scroll to **Phone numbers for testing**
2. Click **Add phone number**
3. Enter phone number: `+919876543210`
4. Enter verification code: `123456`
5. Click **Add**

---

## Step 10: Test on Device

### Prerequisites

- Android device with Google Play Services
- Device connected via USB with USB debugging enabled
- OR Android emulator with Google Play Store

### Run App

1. Connect your device or start emulator
2. In Android Studio, click **Run** (green play button)
3. Select your device
4. Wait for app to install and launch

### Test Phone Auth

1. Open the app
2. Navigate to phone authentication screen
3. Enter phone number (use test number if configured)
4. Click "Send Verification Code"
5. Check SMS for code (or use test code)
6. Enter verification code
7. Click "Verify Code"
8. Verify successful authentication

---

## Troubleshooting

### Error: "google-services.json not found"

**Solution:** Ensure `google-services.json` is in `android/app/` directory.

### Error: "SHA-1 fingerprint not found"

**Solution:** 
1. Generate SHA-1 using `./gradlew signingReport`
2. Add to Firebase Console
3. Wait 5 minutes for changes to propagate

### Error: "Play Services not available"

**Solution:**
1. Update Google Play Services on device
2. Use emulator with Play Store support
3. Verify `play-services-auth` dependency

### Error: "Plugin not registered"

**Solution:** Ensure `FirebaseAuthenticationPlugin` is registered in `MainActivity.java`

### Build fails with Gradle errors

**Solution:**
1. Clean and rebuild:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```
2. Sync Capacitor again:
   ```bash
   npx cap sync android
   ```

---

## Verification Checklist

- [ ] `google-services.json` in `android/app/`
- [ ] Google Services plugin applied in `build.gradle`
- [ ] Firebase dependencies added
- [ ] Plugin registered in `MainActivity.java`
- [ ] SHA-1 and SHA-256 added to Firebase Console
- [ ] Phone authentication enabled in Firebase Console
- [ ] App builds successfully
- [ ] App runs on device/emulator
- [ ] Phone authentication works

---

## Next Steps

After completing Android setup:

1. Test phone authentication flow
2. Integrate with existing auth system
3. Add error handling
4. Implement rate limiting
5. Prepare for production release

---

**Last Updated:** November 12, 2025  
**Branch:** `feature/firebase-phone-auth`
