# Firebase Phone Authentication Error Fix

## Issue Summary

The application was experiencing Firebase phone authentication errors when attempting to send OTP verification codes:

```
auth/invalid-app-credential: Invalid token.
Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.
POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode 400 (Bad Request)
```

## Root Causes

### 1. Unauthorized Domain for Phone Auth

**Problem**: Firebase Phone Authentication requires all domains to be explicitly authorized in the Firebase Console. The localhost development URL (`https://localhost:5173`) was not in the authorized domains list.

**Why This Happens**: 
- Firebase security requires domain whitelisting for phone authentication
- Localhost URLs need to be added separately from the default domains
- The error manifests as `auth/invalid-app-credential`

### 2. reCAPTCHA Enterprise Misconfiguration

**Problem**: The Firebase console shows "Failed to initialize reCAPTCHA Enterprise config", indicating that reCAPTCHA Enterprise was either:
- Enabled but not properly configured with a site key
- Partially disabled but Firebase still tries to use it
- Not compatible with the current setup

**Why This Happens**:
- reCAPTCHA Enterprise requires additional setup beyond enabling phone auth
- Once enabled, it can persist in Firebase backend even when disabled in the console
- Development environments may not have proper reCAPTCHA configuration

### 3. Missing Favicon (Minor Issue)

**Problem**: Browser requests `GET https://localhost:5173/favicon.ico` returns 404

**Impact**: This is cosmetic but clutters the console with errors

## Solutions

### Solution 1: Add Authorized Domains in Firebase Console (REQUIRED)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `apnaashiyanaa-app`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:
   - `127.0.0.1` (for localhost IP-based access)
   - If using custom hosts file entries, add those domains too

**Note**: `localhost` is typically included by default, but `127.0.0.1` often needs to be added manually.

### Solution 2: Configure reCAPTCHA Properly

#### Option A: Use reCAPTCHA v2 (Recommended for Development)

1. In Firebase Console → **Authentication** → **Settings** → **App verification**
2. Ensure **reCAPTCHA Enterprise** is DISABLED
3. Use the standard reCAPTCHA v2 flow
4. Add reCAPTCHA container in your Register.vue:

```vue
<template>
  <div>
    <!-- Your form -->
    <div id="recaptcha-container"></div>
  </div>
</template>
```

5. Ensure RecaptchaVerifier is properly initialized in authService.js:

```javascript
import { RecaptchaVerifier } from 'firebase/auth';

// Initialize before phone auth
window.recaptchaVerifier = new RecaptchaVerifier(
  'recaptcha-container',
  {
    size: 'invisible', // or 'normal' for visible
    callback: (response) => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  },
  auth
);
```

#### Option B: Properly Configure reCAPTCHA Enterprise

If you need reCAPTCHA Enterprise:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **reCAPTCHA Enterprise API**
3. Create a reCAPTCHA Enterprise site key
4. In Firebase Console → **Authentication** → **Settings** → **App verification**
5. Click **Enable reCAPTCHA Enterprise**
6. Add your site key
7. Add your domains (including `127.0.0.1` and `localhost`)

### Solution 3: Add Favicon

Add a `favicon.ico` file to `frontend/client-app/public/` directory:

```bash
# You can use any .ico file or generate one from an image
cp path/to/your/favicon.ico frontend/client-app/public/
```

### Solution 4: Add Test Phone Numbers (For Development)

For development without using real phone numbers:

1. Firebase Console → **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test phone numbers with verification codes:
   - Phone: `+911234567890`
   - Code: `123456`

## Implementation Steps

### Step 1: Update Firebase Console Settings

**Immediately Required (Manual Step)**:

1. ✅ Add `127.0.0.1` to authorized domains
2. ✅ Verify Phone authentication is enabled
3. ✅ Choose reCAPTCHA option (v2 or Enterprise)
4. ✅ Add test phone numbers if needed

### Step 2: Code Changes

The following files need to be verified/updated:

#### frontend/client-app/src/services/authService.js

```javascript
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier 
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export class AuthService {
  
  // Initialize reCAPTCHA verifier
  initializeRecaptcha(containerId = 'recaptcha-container') {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA solved', response);
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
            window.recaptchaVerifier = null;
          }
        },
        auth
      );
    }
    return window.recaptchaVerifier;
  }

  // Send OTP
  async loginWithOTP(phoneNumber) {
    try {
      // Ensure recaptcha is initialized
      const appVerifier = this.initializeRecaptcha();
      
      // Sign in with phone number
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
      
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(confirmationResult, otp) {
    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
}

export default new AuthService();
```

#### frontend/client-app/src/pages/Register.vue

```vue
<template>
  <div class="register-container">
    <!-- Phone input -->
    <input 
      v-model="phoneNumber" 
      type="tel" 
      placeholder="+91 1234567890"
    />
    
    <!-- OTP input (show after sending OTP) -->
    <input 
      v-if="otpSent"
      v-model="otp" 
      type="text" 
      placeholder="Enter OTP"
    />
    
    <!-- reCAPTCHA container (invisible) -->
    <div id="recaptcha-container"></div>
    
    <!-- Buttons -->
    <button 
      v-if="!otpSent" 
      @click="handleSendOTP"
      :disabled="loading"
    >
      Send OTP
    </button>
    
    <button 
      v-if="otpSent" 
      @click="handleVerifyOTP"
      :disabled="loading"
    >
      Verify OTP
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '@/services/authService';

const phoneNumber = ref('+91');
const otp = ref('');
const otpSent = ref(false);
const loading = ref(false);
const confirmationResult = ref(null);

const handleSendOTP = async () => {
  try {
    loading.value = true;
    
    // Validate phone number
    if (!phoneNumber.value || phoneNumber.value.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    // Send OTP
    confirmationResult.value = await authService.loginWithOTP(
      phoneNumber.value
    );
    
    otpSent.value = true;
    console.log('OTP sent successfully');
    
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // User-friendly error messages
    if (error.code === 'auth/invalid-phone-number') {
      alert('Invalid phone number format. Use: +[country code][number]');
    } else if (error.code === 'auth/too-many-requests') {
      alert('Too many requests. Please try again later.');
    } else if (error.code === 'auth/invalid-app-credential') {
      alert('Authentication configuration error. Please contact support.');
    } else {
      alert(`Error: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
};

const handleVerifyOTP = async () => {
  try {
    loading.value = true;
    
    if (!otp.value || otp.value.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    
    const user = await authService.verifyOTP(
      confirmationResult.value,
      otp.value
    );
    
    console.log('User authenticated:', user);
    // Redirect to dashboard or home
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      alert('Invalid OTP. Please try again.');
    } else if (error.code === 'auth/code-expired') {
      alert('OTP expired. Please request a new one.');
    } else {
      alert(`Error: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
};
</script>
```

### Step 3: Add Favicon

Create or copy a favicon.ico to:
```
frontend/client-app/public/favicon.ico
```

### Step 4: Update .env.development

Ensure your environment variables are correct:

```env
VITE_FIREBASE_API_KEY=AIzaSyAS8phqV1SjtjsF7jZmxeZBg8cUbKdQVZA
VITE_FIREBASE_AUTH_DOMAIN=apnaashiyanaa-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apnaashiyanaa-app
# ... other config
```

## Testing Steps

1. **Start the development server**:
   ```bash
   cd frontend/client-app
   npm run dev
   ```

2. **Access via IP instead of localhost** (if needed):
   ```
   http://127.0.0.1:5173
   ```

3. **Test phone authentication**:
   - Enter a test phone number: `+911234567890`
   - Click "Send OTP"
   - Check browser console for reCAPTCHA initialization
   - Enter test OTP: `123456`
   - Click "Verify OTP"

4. **Verify in Firebase Console**:
   - Check Authentication → Users to see new authenticated user

## Common Issues and Solutions

### Issue: Still getting auth/invalid-app-credential

**Solutions**:
1. Clear browser cache and cookies
2. Verify `127.0.0.1` is in authorized domains
3. Try using `localhost` instead of `127.0.0.1` or vice versa
4. Check if reCAPTCHA Enterprise is properly configured or disabled
5. Restart your development server

### Issue: reCAPTCHA not loading

**Solutions**:
1. Check browser console for CSP errors
2. Ensure `<div id="recaptcha-container"></div>` exists in DOM
3. Verify Firebase config is correct
4. Clear window.recaptchaVerifier and reinitialize

### Issue: Cannot receive SMS

**Solutions**:
1. Use test phone numbers from Firebase Console
2. Check Firebase project billing (SMS requires Blaze plan for production)
3. Verify phone number format: `+[country code][number]`

## References

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Authorized Domains](https://firebase.google.com/docs/auth/web/phone-auth#enable-phone-number-sign-in)
- [reCAPTCHA Enterprise Setup](https://cloud.google.com/recaptcha-enterprise/docs/instrument-web-apps)

## Checklist

- [ ] Add `127.0.0.1` to Firebase authorized domains
- [ ] Verify Phone authentication is enabled in Firebase Console  
- [ ] Choose reCAPTCHA option (v2 recommended for dev)
- [ ] Add test phone numbers in Firebase Console
- [ ] Update authService.js with proper RecaptchaVerifier
- [ ] Update Register.vue with recaptcha-container div
- [ ] Add favicon.ico to public folder
- [ ] Test with test phone number
- [ ] Verify user appears in Firebase Authentication users list

## Status

✅ Issue identified
✅ Solutions documented
⏳ Awaiting Firebase Console configuration
⏳ Code changes pending
