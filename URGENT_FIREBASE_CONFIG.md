# 🔥 URGENT: Firebase Console Configuration Required

## Immediate Action Required

Before the code changes can work, you MUST configure these settings in Firebase Console:

### Step 1: Add Authorized Domain (CRITICAL)

1. Go to: https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/settings
2. Scroll to **Authorized domains** section
3. Click **Add domain**
4. Add: `127.0.0.1`
5. Click **Add**

**Why**: Firebase rejects phone auth requests from unauthorized domains with `auth/invalid-app-credential` error.

### Step 2: Configure reCAPTCHA

**Option A: Use reCAPTCHA v2 (RECOMMENDED FOR DEV)**

1. Go to: https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/providers
2. Click on **Phone** provider
3. Under **App verification**, ensure **reCAPTCHA Enterprise** is DISABLED
4. Save

**Option B: Configure reCAPTCHA Enterprise Properly**

If you need reCAPTCHA Enterprise:
1. Go to: https://console.cloud.google.com/security/recaptcha
2. Enable **reCAPTCHA Enterprise API**
3. Create a site key for your domain
4. Return to Firebase Console
5. Enable reCAPTCHA Enterprise with the site key
6. Add `127.0.0.1` and `localhost` to the allowed domains

### Step 3: Add Test Phone Number (OPTIONAL)

For testing without real SMS:

1. Go to: https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/providers
2. Click on **Phone** provider
3. Scroll to **Phone numbers for testing**
4. Click **Add phone number**
5. Add:
   - Phone: `+911234567890`
   - Verification code: `123456`
6. Save

### Step 4: Verify Current Settings

Check these are already enabled:
- ✅ Phone authentication provider is enabled
- ✅ Default domains include:
  - `localhost` 
  - `apnaashiyanaa-app.firebaseapp.com`
  - `apnaashiyanaa-app.web.app`

## After Firebase Console Configuration

Once you've completed the above steps:

1. Clear browser cache and reload your app
2. Try phone authentication again
3. Use `http://127.0.0.1:5173` instead of `https://localhost:5173` if issues persist

## Current Error Explanation

The errors you're seeing:

```
auth/invalid-app-credential
Failed to initialize reCAPTCHA Enterprise config
```

Occur because:
1. Your development URL (`localhost:5173`) is not in the authorized domains
2. reCAPTCHA Enterprise is partially enabled but not configured

These are **configuration issues**, not code issues, which is why they must be fixed in Firebase Console first.

## Quick Test

After configuration:

1. Open: http://127.0.0.1:5173
2. Navigate to Register page
3. Enter: `+911234567890`
4. Click "Send OTP"
5. Enter: `123456`
6. Click "Verify"

If configured correctly, you should see the user in Firebase Console → Authentication → Users.
