# Firebase Phone Authentication Setup Guide

## Overview

This guide provides complete instructions for implementing Firebase Phone Authentication in your Capacitor Android app using the `@capacitor-firebase/authentication` plugin.

---

## Table of Contents

1. [Phase 1: Dependencies & Configuration](#phase-1-dependencies--configuration)
2. [Phase 2: Firebase Console Setup](#phase-2-firebase-console-setup)
3. [Phase 3: Android Project Configuration](#phase-3-android-project-configuration)
4. [Phase 4: Frontend Integration](#phase-4-frontend-integration)
5. [Phase 5: Testing](#phase-5-testing)
6. [Phase 6: Production Deployment](#phase-6-production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Phase 1: Dependencies & Configuration

### ✅ Completed

#### 1.1 Install Dependencies

```bash
cd metainflu/frontend/client-app
npm install @capacitor-firebase/authentication@^6.1.0
npm install firebase@^12.5.0  # Already installed
npx cap sync android
```

#### 1.2 Updated Files

**package.json**
- Added `@capacitor-firebase/authentication` dependency

**capacitor.config.json**
- Configured `FirebaseAuthentication` plugin with `phone` provider

**Created Files:**
- `src/services/phoneAuthService.js` - Phone authentication service
- `src/components/PhoneAuthInput.vue` - Phone auth UI component

---

## Phase 2: Firebase Console Setup

### 🔴 Action Required

#### 2.1 Enable Phone Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Phone** provider
5. Click **Save**

#### 2.2 Add Test Phone Numbers (Optional)

For testing without SMS charges:

1. In **Phone** provider settings, scroll to **Phone numbers for testing**
2. Add test numbers with verification codes:
   ```
   +919876543210 -> 123456
   +911234567890 -> 654321
   ```

#### 2.3 Configure reCAPTCHA (Web)

For web platform testing:

1. Add your domain to authorized domains:
   - Go to **Authentication** > **Settings** > **Authorized domains**
   - Add `localhost` for local testing

---

## Phase 3: Android Project Configuration

### 🔴 Action Required

#### 3.1 Add google-services.json

1. Download `google-services.json` from Firebase Console:
   - Go to **Project Settings** > **Your apps** > Android app
   - Click **Download google-services.json**

2. Place it in the Android app directory:
   ```bash
   cp ~/Downloads/google-services.json android/app/
   ```

#### 3.2 Update android/build.gradle

Add Google Services plugin:

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'  // Add this
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

#### 3.3 Update android/app/build.gradle

Apply Google Services plugin and add Firebase dependencies:

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // Add this

android {
    namespace "com.property.app"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.property.app"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    
    // Firebase BoM
    implementation platform('com.google.firebase:firebase-bom:33.5.0')
    
    // Firebase Authentication
    implementation 'com.google.firebase:firebase-auth'
    
    // Play Services Auth (for phone auth)
    implementation 'com.google.android.gms:play-services-auth:21.2.0'
    
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}
```

#### 3.4 Register Plugin in MainActivity

Update `android/app/src/main/java/com/property/app/MainActivity.java`:

```java
package com.property.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register Firebase Authentication plugin
        registerPlugin(FirebaseAuthenticationPlugin.class);
    }
}
```

#### 3.5 Generate SHA-1 and SHA-256 Fingerprints

**For Debug Build:**

```bash
cd android
./gradlew signingReport
```

Look for output like:
```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: androiddebugkey
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA256: XX:XX:...
```

**For Release Build:**

If you have a release keystore:

```bash
keytool -list -v -keystore ~/path/to/your-release-key.jks -alias your-key-alias
```

#### 3.6 Add SHA Fingerprints to Firebase

1. Go to Firebase Console > **Project Settings**
2. Select your Android app
3. Scroll to **SHA certificate fingerprints**
4. Click **Add fingerprint**
5. Add both SHA-1 and SHA-256 for debug and release builds

---

## Phase 4: Frontend Integration

### ✅ Partially Completed

#### 4.1 Service Layer (Completed)

**phoneAuthService.js** provides:
- `sendVerificationCode(phoneNumber)` - Send OTP
- `verifyCode(code)` - Verify OTP
- `resendVerificationCode(phoneNumber)` - Resend OTP
- `getCurrentUser()` - Get authenticated user
- `signOut()` - Sign out user

#### 4.2 UI Component (Completed)

**PhoneAuthInput.vue** provides:
- Phone number input with country code selector
- OTP input interface
- Resend functionality with timer
- Loading states and error handling

#### 4.3 Integration with Auth Flow (To Do)

Update your login page to include phone authentication:

```vue
<template>
  <div class="login-page">
    <!-- Existing Aadhaar/Password Login -->
    <div class="existing-auth">
      <!-- Your existing auth form -->
    </div>

    <!-- OR Divider -->
    <div class="divider">
      <span>OR</span>
    </div>

    <!-- Phone Authentication -->
    <PhoneAuthInput 
      @success="handlePhoneAuthSuccess"
      @error="handlePhoneAuthError"
    />
  </div>
</template>

<script>
import PhoneAuthInput from '@/components/PhoneAuthInput.vue'
import { useAuthStore } from '@/store/auth'

export default {
  components: {
    PhoneAuthInput
  },
  
  setup() {
    const authStore = useAuthStore()

    const handlePhoneAuthSuccess = async (user) => {
      console.log('Phone auth successful:', user)
      
      // Update auth store
      await authStore.setUser(user)
      
      // Redirect to dashboard
      router.push('/dashboard')
    }

    const handlePhoneAuthError = (error) => {
      console.error('Phone auth error:', error)
    }

    return {
      handlePhoneAuthSuccess,
      handlePhoneAuthError
    }
  }
}
</script>
```

---

## Phase 5: Testing

### 5.1 Local Testing

#### Build and Run on Device

```bash
# Build the Vue app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### Test Flow:

1. **Enter Phone Number**
   - Input a valid phone number
   - Click "Send Verification Code"
   - Verify SMS is received

2. **Verify OTP**
   - Enter 6-digit code
   - Click "Verify Code"
   - Check authentication success

3. **Test Resend**
   - Wait for timer to expire
   - Click "Resend Code"
   - Verify new SMS received

4. **Test Error Cases**
   - Invalid phone number
   - Invalid OTP
   - Network errors

### 5.2 Test Phone Numbers

Use Firebase test numbers (no SMS charges):

```javascript
// In Firebase Console: Authentication > Phone > Test numbers
+919876543210 -> 123456
```

### 5.3 Firebase Emulator Testing (Optional)

```bash
# In backend directory
firebase emulators:start --only auth

# Update frontend to use emulator
// In src/config/firebase.js
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## Phase 6: Production Deployment

### 6.1 Security Rules

Update Firestore security rules to include phone-authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users (including phone auth)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6.2 Rate Limiting

Implement rate limiting for phone auth to prevent abuse:

1. Use Firebase App Check
2. Configure Cloud Functions to limit requests
3. Monitor usage in Firebase Console

### 6.3 Production Build

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### 6.4 Add Release SHA Fingerprints

Ensure release keystore SHA-1 and SHA-256 are added to Firebase Console.

---

## Troubleshooting

### Issue: "SMS not received"

**Solutions:**
1. Verify phone number is in E.164 format (+919876543210)
2. Check Firebase Console quota limits
3. Ensure SHA fingerprints are correct
4. Try test phone numbers first

### Issue: "Play Services not available"

**Solutions:**
1. Update Google Play Services on device
2. Ensure device has Google Play Store
3. Check `play-services-auth` dependency version

### Issue: "Invalid verification code"

**Solutions:**
1. Verify correct verification ID is being used
2. Check code hasn't expired (10 minutes)
3. Ensure no typos in OTP entry

### Issue: "App not authorized"

**Solutions:**
1. Verify SHA-1 and SHA-256 are added to Firebase
2. Check package name matches Firebase registration
3. Re-download and replace `google-services.json`

### Issue: "Network error"

**Solutions:**
1. Check internet connectivity
2. Verify Firebase project is active
3. Check Firebase Console for service outages

---

## SMS Costs

### Firebase Phone Authentication Pricing

- **First 10K verifications/month:** Free
- **Additional verifications:** $0.06/verification

### Optimization Tips

1. Use test phone numbers during development
2. Implement proper rate limiting
3. Cache authenticated sessions
4. Consider using third-party SMS providers for high volume

---

## Next Steps

1. ✅ Phase 1 completed - Dependencies installed
2. 🔴 Complete Phase 2 - Firebase Console setup
3. 🔴 Complete Phase 3 - Android configuration
4. 🔴 Complete Phase 4 - Frontend integration
5. 🔴 Complete Phase 5 - Testing
6. 🔴 Complete Phase 6 - Production deployment

---

## Resources

- [Capacitor Firebase Authentication Docs](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/authentication)
- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/android/phone-auth)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Capacitor Docs](https://capacitorjs.com/docs)

---

**Last Updated:** November 12, 2025  
**Branch:** `feature/firebase-phone-auth`
