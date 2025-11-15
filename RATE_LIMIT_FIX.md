# Firebase Rate Limit Error Fix

## Current Error

```
FirebaseError: Firebase: Error (auth/too-many-requests)
POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode 400 (Bad Request)
```

## What This Means

Firebase has **temporarily blocked** phone authentication requests from your device/IP because:

1. ✅ **Too many failed attempts** - Multiple tries with the previous `auth/invalid-app-credential` error
2. ✅ **Rate limiting protection** - Firebase's anti-abuse system kicked in
3. ✅ **No proper configuration** - Requests were failing, triggering rate limits

## Immediate Solutions

### Solution 1: Wait for Rate Limit to Reset (Quick)

**Time Required**: 30 minutes to 24 hours

1. **Stop all authentication attempts immediately**
2. **Close your browser completely**
3. **Wait 30-60 minutes** (Firebase typically resets after this)
4. **Clear browser cache and cookies**
5. **Try again using test phone numbers**

### Solution 2: Use Test Phone Numbers (Recommended)

This bypasses SMS sending and rate limits:

#### Add Test Phone Numbers in Firebase Console

1. Go to: [Firebase Console → Authentication → Sign-in method → Phone](https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/providers)
2. Scroll to **Phone numbers for testing**
3. Click **Add phone number**
4. Add:
   - **Phone**: `+911234567890`
   - **Verification code**: `123456`
5. Click **Add**
6. Add more test numbers if needed:
   - `+919876543210` → code `654321`
   - `+919999999999` → code `999999`

**Benefits**:
- ✅ No SMS sent (free)
- ✅ No rate limits
- ✅ Instant verification
- ✅ Works even when blocked

### Solution 3: Change IP Address

1. **Disconnect and reconnect WiFi/mobile data**
2. **Use a VPN** (changes your IP)
3. **Use mobile hotspot instead of WiFi**
4. **Try from a different device**

### Solution 4: Clear Firebase State

```javascript
// Add this to your browser console
localStorage.clear();
sessionStorage.clear();
// Clear all Firebase auth state
if (window.recaptchaVerifier) {
  window.recaptchaVerifier.clear();
  window.recaptchaVerifier = null;
}
// Reload the page
location.reload();
```

### Solution 5: Use Different Browser

1. If using Chrome, try **Firefox** or **Edge**
2. Use **Incognito/Private mode**
3. Firebase tracks rate limits per browser session

## Critical: Fix Root Cause (MUST DO)

The rate limit happened because the underlying issue wasn't fixed. You MUST:

### 1. Add Authorized Domain (From Previous Fix)

**This is STILL required**:

1. Go to: [Firebase Console → Authentication → Settings](https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/settings)
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add: `127.0.0.1`
5. Save

### 2. Configure reCAPTCHA Properly

**Choose ONE option**:

#### Option A: Disable reCAPTCHA Enterprise (Recommended)

1. Go to: [Firebase Console → Authentication → Providers → Phone](https://console.firebase.google.com/u/5/project/apnaashiyanaa-app/authentication/providers)
2. Under **App verification**, ensure **reCAPTCHA Enterprise** is **DISABLED**
3. Save

#### Option B: Configure reCAPTCHA Enterprise Properly

1. Go to: [Google Cloud Console](https://console.cloud.google.com/security/recaptcha)
2. Enable **reCAPTCHA Enterprise API**
3. Create a site key
4. Return to Firebase and add the key
5. Add `127.0.0.1` to allowed domains

## Code Updates for Better Error Handling

### Update authService.js

Add rate limit detection and user-friendly messages:

```javascript
// In authService.js loginWithOTP method
async loginWithOTP(phoneNumber) {
  try {
    // Clear any existing recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    const appVerifier = this.initializeRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Clear recaptcha on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    // Handle specific error codes
    if (error.code === 'auth/too-many-requests') {
      throw new Error(
        'Too many attempts. Please wait 30 minutes or use a test phone number: +911234567890 with code 123456'
      );
    } else if (error.code === 'auth/invalid-app-credential') {
      throw new Error(
        'Authentication not configured properly. Please contact support.'
      );
    } else if (error.code === 'auth/invalid-phone-number') {
      throw new Error(
        'Invalid phone number format. Use: +[country code][number]'
      );
    }
    
    throw error;
  }
}
```

### Update Register.vue

Add better error messages:

```javascript
// In Register.vue handleSendOTP method
async handleSendOTP() {
  try {
    loading.value = true;
    
    // Validate phone number format
    if (!phoneNumber.value.startsWith('+')) {
      phoneNumber.value = '+91' + phoneNumber.value.replace(/^0+/, '');
    }
    
    confirmationResult.value = await authService.loginWithOTP(
      phoneNumber.value
    );
    
    otpSent.value = true;
    console.log('OTP sent successfully');
    
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // User-friendly error messages
    if (error.message.includes('too many attempts')) {
      alert(
        '⏱️ Too many attempts detected.\n\n' +
        'Solutions:\n' +
        '1. Wait 30-60 minutes\n' +
        '2. Use test number: +911234567890 (code: 123456)\n' +
        '3. Try a different device/browser\n' +
        '4. Clear browser cache and reload'
      );
    } else if (error.message.includes('not configured')) {
      alert(
        '⚙️ Configuration issue detected.\n\n' +
        'Please ensure:\n' +
        '1. Authorized domains include 127.0.0.1\n' +
        '2. reCAPTCHA is properly configured\n' +
        '3. Phone authentication is enabled'
      );
    } else {
      alert(`Error: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
}
```

## Testing After Fix

### Using Test Phone Numbers

1. **Wait 30-60 minutes** for rate limit to reset
2. **Clear browser completely** (cache, cookies, local storage)
3. **Add test phone numbers** in Firebase Console
4. **Access via**: `http://127.0.0.1:5173`
5. **Enter test number**: `+911234567890`
6. **Click Send OTP**
7. **Enter test code**: `123456`
8. **Verify** - should work instantly

### Testing with Real Phone Number (After Rate Limit Clears)

1. **Ensure all Firebase Console configs are done**
2. **Wait for rate limit to clear** (30-60 minutes minimum)
3. **Use a different browser or incognito mode**
4. **Try only ONCE** - don't spam attempts
5. **If it fails**, go back to test numbers

## Prevention

### Avoid Future Rate Limits

1. ✅ **Always use test phone numbers during development**
2. ✅ **Ensure proper Firebase configuration before testing**
3. ✅ **Don't spam OTP requests** - wait between attempts
4. ✅ **Clear reCAPTCHA state between attempts**
5. ✅ **Use different test numbers for different tests**
6. ✅ **Enable proper error handling in code**

### Development Best Practices

```javascript
// Add a cooldown mechanism
let lastOTPAttempt = 0;
const OTP_COOLDOWN = 60000; // 60 seconds

async function handleSendOTP() {
  const now = Date.now();
  if (now - lastOTPAttempt < OTP_COOLDOWN) {
    const waitTime = Math.ceil((OTP_COOLDOWN - (now - lastOTPAttempt)) / 1000);
    alert(`Please wait ${waitTime} seconds before requesting another OTP`);
    return;
  }
  
  lastOTPAttempt = now;
  // ... rest of OTP logic
}
```

## Quick Checklist

### Immediate Actions (Do Now)

- [ ] Stop all authentication attempts
- [ ] Wait 30-60 minutes
- [ ] Add test phone numbers in Firebase Console
- [ ] Add `127.0.0.1` to authorized domains
- [ ] Disable reCAPTCHA Enterprise or configure it properly
- [ ] Clear browser cache and cookies

### After Rate Limit Clears

- [ ] Use test phone number: `+911234567890` (code: `123456`)
- [ ] Access via `http://127.0.0.1:5173`
- [ ] Test registration flow
- [ ] Verify user appears in Firebase Console

### Code Updates (Next PR)

- [ ] Add rate limit error handling in authService.js
- [ ] Add user-friendly error messages in Register.vue
- [ ] Add OTP request cooldown mechanism
- [ ] Add better phone number validation
- [ ] Add reCAPTCHA state cleanup

## Summary

The `auth/too-many-requests` error is a **consequence** of the previous `auth/invalid-app-credential` issue. To fully resolve:

1. **Immediate**: Wait and use test phone numbers
2. **Short-term**: Fix Firebase Console configuration (authorized domains, reCAPTCHA)
3. **Long-term**: Add better error handling and rate limit protection in code

**Priority Order**:
1. 🔴 Add test phone numbers (do now)
2. 🔴 Add authorized domain `127.0.0.1` (do now)
3. 🟡 Wait 30-60 minutes (automatic)
4. 🟢 Update code with better error handling (next PR)

---

**Status**: Rate limited due to repeated configuration errors
**Solution**: Test phone numbers + Firebase Console configuration + wait time
**Time to Resolution**: 30-60 minutes + configuration time
