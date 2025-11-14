# Dual Authentication System Documentation

## Overview

This document describes the implementation of a dual authentication system that allows users to login using either **OTP (One-Time Password)** or **Password**, providing flexibility and improved user experience.

## Features

### User Registration
- Users can optionally set a password during signup
- If password is set, user can login with both OTP and password
- If no password is set, user can only login with OTP
- Password is hashed using bcrypt before storage

### Login Options
1. **OTP Login** - Always available for all users
2. **Password Login** - Available only if user has set a password

### Smart Login Flow
- System automatically detects available authentication methods
- Shows appropriate login options based on user's account setup

---

## Backend Implementation

### 1. User Model Updates
**File:** `metainflu/backend/models/User.js`

**Changes:**
- Added `password` field (optional, hashed)
- Password is excluded from queries by default (`select: false`)
- Pre-save hook to hash password with bcrypt
- `matchPassword` method to compare passwords

```javascript
password: {
  type: String,
  select: false, // Don't include in queries by default
},
```

### 2. Auth Controller
**File:** `metainflu/backend/controllers/authController.js`

**New Endpoints:**

#### a. Register User (Updated)
```
POST /api/auth/register
Body: { name, mobile, password (optional), aadhaar (optional) }
Response: { message, userId, hasPassword }
```

#### b. Check Authentication Method
```
POST /api/auth/check-auth-method
Body: { mobile }
Response: { mobile, hasPassword, availableMethods: ['otp', 'password'] }
```

#### c. Login with OTP
```
POST /api/auth/login/otp
Body: { mobile }
Response: { message, userId }
```

#### d. Login with Password
```
POST /api/auth/login/password
Body: { mobile, password }
Response: { _id, name, mobile, aadhaar, role, token }
```

#### e. Verify OTP (Unchanged)
```
POST /api/auth/verify-otp
Body: { userId, otp }
Response: { _id, name, mobile, aadhaar, role, token }
```

### 3. Routes
**File:** `metainflu/backend/routes/authRoutes.js`

```javascript
router.post('/register', registerValidationRules(), registerUser);
router.post('/login/otp', loginValidationRules(), loginWithOTP);
router.post('/login/password', loginWithPassword);
router.post('/verify-otp', verifyOTP);
router.post('/check-auth-method', checkAuthMethod);
```

---

## Frontend Implementation

### 1. Auth Service Updates
**File:** `metainflu/frontend/client-app/src/services/authService.js`

**New Methods:**
- `checkAuthMethod(mobile)` - Check available login methods
- `loginWithOTP(mobile)` - Request OTP for login
- `loginWithPassword(mobile, password)` - Login with password directly
- `register(userData)` - Now accepts optional password field

**Example Usage:**
```javascript
// Check available methods
const methods = await authService.checkAuthMethod('9876543210');
// Returns: { hasPassword: true, availableMethods: ['otp', 'password'] }

// Login with password
const user = await authService.loginWithPassword('9876543210', 'password123');

// Login with OTP
const { userId } = await authService.loginWithOTP('9876543210');
await authService.verifyOTP(userId, '123456');
```

### 2. Register Page Updates
**File:** `metainflu/frontend/client-app/src/pages/Register.vue`

**New Features:**
- Optional password field with visibility toggle
- Password strength validation (minimum 6 characters)
- Helper text explaining password usage
- Password field is clearly marked as optional

**UI Components:**
- Password input with show/hide toggle icon
- Informational text about dual authentication
- Blue and white color scheme

### 3. Login Page Updates
**File:** `metainflu/frontend/client-app/src/pages/Login.vue`

**New Features:**
- Multi-step login flow:
  1. Enter mobile number
  2. System checks available authentication methods
  3. Show login options (OTP and/or Password)
  4. User selects preferred method
  5. Complete authentication

**UI Components:**
- Auth method selection screen
- Password login form with visibility toggle
- OTP login flow (existing)
- Switch between methods
- Back button navigation

---

## User Flows

### Registration Flow

```
User enters registration details
  ↓
User optionally sets password
  ↓
Click "Send OTP"
  ↓
OTP sent to mobile
  ↓
User enters OTP
  ↓
Account created with/without password
  ↓
User logged in
```

### Login Flow (With Password Set)

```
User enters mobile number
  ↓
Click "Continue"
  ↓
System detects password is set
  ↓
Show both options:
  - Login with Password
  - Login with OTP
  ↓
User selects method
  ↓
Complete authentication
```

### Login Flow (Without Password)

```
User enters mobile number
  ↓
Click "Continue"
  ↓
System detects no password
  ↓
Automatically send OTP
  ↓
User enters OTP
  ↓
User logged in
```

---

## Security Features

### Password Security
1. **Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **No Plain Text**: Passwords are never stored in plain text
3. **Excluded by Default**: Password field is excluded from all queries unless explicitly selected
4. **Comparison**: Secure password comparison using bcrypt.compare()

### OTP Security
1. **Expiration**: OTP expires after 10 minutes
2. **6-Digit Code**: OTP is a random 6-digit number
3. **Single Use**: OTP is cleared after successful verification
4. **Mobile Validation**: OTP sent only to registered mobile numbers

### General Security
1. **JWT Tokens**: 30-day expiration
2. **Input Validation**: All inputs validated on both frontend and backend
3. **Protected Routes**: Authentication required for protected endpoints
4. **Error Handling**: Generic error messages to prevent information leakage

---

## API Examples

### 1. Register with Password

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9876543210",
    "password": "securepass123",
    "aadhaar": "123456789012"
  }'
```

**Response:**
```json
{
  "message": "OTP sent to mobile number",
  "userId": "507f1f77bcf86cd799439011",
  "hasPassword": true
}
```

### 2. Check Authentication Method

```bash
curl -X POST http://localhost:5000/api/auth/check-auth-method \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210"
  }'
```

**Response:**
```json
{
  "mobile": "9876543210",
  "hasPassword": true,
  "availableMethods": ["otp", "password"]
}
```

### 3. Login with Password

```bash
curl -X POST http://localhost:5000/api/auth/login/password \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "aadhaar": "123456789012",
  "role": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Login with OTP

```bash
curl -X POST http://localhost:5000/api/auth/login/otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210"
  }'
```

**Response:**
```json
{
  "message": "OTP sent to mobile number",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

## Migration Guide

### For Existing Users

**Existing users without passwords:**
- Can continue using OTP login
- No action required
- Can set password later through profile settings (future enhancement)

**Database Migration:**
- No migration required
- Password field is optional and defaults to undefined
- Existing users will have `hasPassword: false`

---

## Testing Guide

### Test Scenarios

#### 1. Register with Password
- [ ] User can register with password
- [ ] Password is hashed in database
- [ ] OTP is sent after registration
- [ ] User can verify OTP and complete registration

#### 2. Register without Password
- [ ] User can register without password
- [ ] OTP is sent after registration
- [ ] User can verify OTP and complete registration

#### 3. Login with Password
- [ ] User can check authentication method
- [ ] Password login option is shown
- [ ] User can login with correct password
- [ ] Error shown for incorrect password
- [ ] JWT token is returned

#### 4. Login with OTP
- [ ] User can request OTP
- [ ] OTP is sent to mobile
- [ ] User can verify OTP
- [ ] JWT token is returned
- [ ] Expired OTP is rejected

#### 5. Login Method Selection
- [ ] System correctly detects available methods
- [ ] Both options shown for users with password
- [ ] Only OTP shown for users without password
- [ ] User can switch between methods

---

## Future Enhancements

1. **Password Reset**: Allow users to reset password via OTP
2. **Set Password Later**: Allow OTP-only users to set password from profile
3. **Password Strength Meter**: Visual indicator of password strength
4. **Remember Device**: Option to stay logged in on trusted devices
5. **Two-Factor Authentication**: Add 2FA for extra security
6. **Login History**: Track and display login history
7. **Email Integration**: Add email as alternative authentication method

---

## Troubleshooting

### Common Issues

**1. "Password login not available" error**
- Solution: User hasn't set a password. Use OTP login instead.

**2. Password field not appearing in registration**
- Solution: Check frontend component is updated. Clear browser cache.

**3. Login method selection not showing**
- Solution: Ensure backend `check-auth-method` endpoint is working.

**4. Password not hashing**
- Solution: Check User model pre-save hook is configured correctly.

---

## Version History

**v1.0.0** (2025-11-07)
- Initial implementation of dual authentication
- Password field added to User model
- New auth endpoints created
- Frontend UI updated for both login methods
- Comprehensive documentation added

---

## Summary

The dual authentication system provides users with flexibility in how they access their accounts:

✅ **OTP Login**: Quick, passwordless access (always available)  
✅ **Password Login**: Traditional secure login (optional)  
✅ **Smart Detection**: System automatically shows appropriate options  
✅ **Backward Compatible**: Existing users can continue with OTP  
✅ **Secure**: Passwords hashed, OTPs expire, JWT tokens protected  
✅ **User-Friendly**: Clear UI, helpful messages, easy method switching  

This implementation balances security, convenience, and user choice while maintaining backward compatibility with existing OTP-only users.
