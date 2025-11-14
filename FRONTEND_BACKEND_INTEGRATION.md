# Frontend-Backend Integration Updates

**Note:** The files `metainflu/backend/BACKEND_DOCUMENTATION.md` and `metainflu/frontend/client-app/FRONTEND_CLIENT_DOCUMENTATION.md` are now obsolete. This document and `DUAL_AUTH_DOCUMENTATION.md` are the current sources of truth.

## Overview

This document outlines the updates made to properly connect the frontend Vue.js application with the backend Express API for the Property Dealer App.

## Changes Made

### 1. Authentication Service (`src/services/authService.js`)

**Problem**: The frontend was using email/password authentication, but the backend implements OTP-based authentication with mobile numbers.

**Solution**:
- Updated authentication flow to use mobile numbers instead of email/password
- Implemented three-step authentication:
  1. **Register/Login**: Send mobile number (and name/Aadhaar for registration)
  2. **OTP Generation**: Backend sends 6-digit OTP to mobile
  3. **Verification**: Verify OTP and receive JWT token

**Validation Added**:
- Mobile number: Must be exactly 10 digits
- Aadhaar (optional): Must be exactly 12 digits
- OTP: Must be exactly 6 digits

**API Endpoints**:
- `POST /api/auth/register` - Register with { name, mobile, aadhaar? }
- `POST /api/auth/login` - Login with { mobile }
- `POST /api/auth/verify-otp` - Verify with { userId, otp }

### 2. Property Service (`src/services/propertyService.js`)

**Problem**: Missing validation and improper data formatting for backend API.

**Solution**:
- Added comprehensive validation for all required fields:
  - `title` (required, non-empty string)
  - `description` (required, non-empty string)
  - `price` (required, positive number)
  - `address` (required, non-empty string)
  - `propertyType` (required, must be one of: 'apartment', 'house', 'land', 'commercial')
  - `bedrooms` (required, non-negative number)
  - `bathrooms` (required, non-negative number)
  - `area` (required, positive number)
  - `latitude` (optional, must be between -90 and 90)
  - `longitude` (optional, must be between -180 and 180)

- Added data formatting function to ensure proper types (numbers, arrays, trimmed strings)
- Implemented error handling with descriptive error messages

**API Endpoints**:
- `GET /api/properties` - Get all properties with optional filters
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)
- `GET /api/search` - Search properties with keyword

### 3. API Client Configuration (`src/config/api.js`)

**Problem**: API URL was constructed with double `/api` path, causing 404 errors.

**Solution**:
- Fixed URL construction to use `${API_BASE_URL}${endpoint}` instead of `${API_BASE_URL}/api${endpoint}`
- Updated `.env` to include `/api` in base URL: `https://3czzqk3l-5000.use2.devtunnels.ms/api`
- Improved error handling with better error message extraction
- Added query parameter support for GET requests
- Enhanced logging for debugging

### 4. Favorites Service (`src/services/favoriteService.js`)

**Solution**:
- Updated endpoints to match backend:
  - `GET /api/favorites` - Get all favorites
  - `POST /api/favorites` - Add to favorites with { propertyId }
  - `DELETE /api/favorites/:propertyId` - Remove from favorites
- Added validation for propertyId
- Implemented toggle functionality

### 5. OTP Verification Component (`src/components/OTPVerification.vue`)

**New Component**:
- Created reusable OTP input component with:
  - 6 separate input boxes for each digit
  - Auto-focus and auto-advance to next input
  - Backspace navigation
  - Paste support for 6-digit codes
  - 60-second countdown timer for resend
  - Input validation (numbers only)
  - Error handling and display
  - Mobile number masking for privacy

### 6. Login Page (`src/pages/Login.vue`)

**Updated**:
- Removed email/password fields
- Added mobile number input (10 digits)
- Implemented two-step flow:
  1. Enter mobile number → Send OTP
  2. Enter OTP → Verify and login
- Integrated OTPVerification component
- Added proper validation and error handling

### 7. Register Page (`src/pages/Register.vue`)

**Updated**:
- Removed email/password fields
- Added required fields:
  - Name (required)
  - Mobile number (required, 10 digits)
  - Aadhaar (optional, 12 digits)
- Implemented two-step flow:
  1. Enter details → Send OTP
  2. Enter OTP → Verify and register
- Integrated OTPVerification component
- Added comprehensive validation

## Backend API Structure

### Authentication Flow

```javascript
// Registration
1. POST /api/auth/register
   Body: { name, mobile, aadhaar?, password? }
   Response: { message, userId, hasPassword }

2. POST /api/auth/verify-otp
   Body: { userId, otp }
   Response: { _id, name, mobile, aadhaar, role, token }

// Login
1. POST /api/auth/check-auth-method
   Body: { mobile }
   Response: { mobile, hasPassword, availableMethods: ['otp', 'password'] }

2. (if hasPassword) POST /api/auth/login/password
   Body: { mobile, password }
   Response: { _id, name, mobile, aadhaar, role, token }

2. (if !hasPassword or user chooses OTP) POST /api/auth/login/otp
   Body: { mobile }
   Response: { message, userId }

3. POST /api/auth/verify-otp
   Body: { userId, otp }
   Response: { _id, name, mobile, aadhaar, role, token }
```

### Property Data Structure

```javascript
{
  title: String (required),
  description: String (required),
  price: Number (required),
  address: String (required),
  latitude: Number (optional, -90 to 90),
  longitude: Number (optional, -180 to 180),
  propertyType: String (required, enum: 'apartment'|'house'|'land'|'commercial'),
  bedrooms: Number (required),
  bathrooms: Number (required),
  area: Number (required),
  amenities: [String] (optional),
  images: [String] (optional),
  user: ObjectId (auto-populated from JWT),
  status: String (default: 'pending', enum: 'pending'|'approved'|'rejected')
}
```

## Environment Variables

Update your `.env` file:

```env
# Backend API URL (should include /api)
VITE_API_BASE_URL=https://3czzqk3l-5000.use2.devtunnels.ms/api

# For local development
# VITE_API_BASE_URL=http://localhost:5000/api

# For mobile/Capacitor development
# VITE_API_BASE_URL=http://YOUR_COMPUTER_IP:5000/api
```

## Testing the Integration

### 1. Test Authentication

```bash
# Test registration
1. Navigate to /register
2. Enter name, 10-digit mobile number, and optional 12-digit Aadhaar
3. Click "Send OTP"
4. Enter the 6-digit OTP from backend logs (or SMS if configured)
5. Verify successful registration and redirect to home

# Test login
1. Navigate to /login
2. Enter 10-digit mobile number
3. Click "Send OTP"
4. Enter the 6-digit OTP
5. Verify successful login and redirect
```

### 2. Test Property Operations

```bash
# Create property (requires authentication)
1. Login first
2. Navigate to property creation form
3. Fill all required fields:
   - Title
   - Description
   - Price (number)
   - Address
   - Property Type (apartment/house/land/commercial)
   - Bedrooms (number)
   - Bathrooms (number)
   - Area (number)
4. Optionally add:
   - Latitude/Longitude
   - Amenities (array)
   - Images (array of URLs)
5. Submit and verify property is created

# List properties
1. Navigate to properties list
2. Verify properties are loaded from backend
3. Test filters (propertyType, price range, bedrooms, etc.)

# View property details
1. Click on a property
2. Verify all details are displayed correctly

# Update property (requires authentication and ownership)
1. Login as property owner
2. Navigate to property edit page
3. Modify fields
4. Submit and verify updates

# Delete property (requires authentication and ownership)
1. Login as property owner
2. Delete property
3. Verify deletion
```

### 3. Test Favorites

```bash
# Add to favorites (requires authentication)
1. Login first
2. View a property
3. Click favorite/heart icon
4. Verify property is added to favorites

# View favorites
1. Navigate to favorites page
2. Verify all favorited properties are listed

# Remove from favorites
1. Navigate to favorites or property detail
2. Click favorite/heart icon again
3. Verify property is removed from favorites
```

## Error Handling

All services now include proper error handling:

1. **Validation Errors**: Client-side validation before API calls
2. **Network Errors**: Catch and display connection issues
3. **API Errors**: Extract and display error messages from backend
4. **Authentication Errors**: Redirect to login on 401 responses

## Common Issues and Solutions

### Issue: Double `/api` in URL

**Solution**: Ensure `.env` includes `/api` and services use endpoints without leading `/api`

### Issue: OTP not working

**Solution**: Check backend logs for generated OTP (currently using console.log, integrate SMS gateway for production)

### Issue: CORS errors

**Solution**: Backend already configured with proper CORS settings for dev tunnels and localhost

### Issue: 401 Unauthorized

**Solution**: Ensure JWT token is stored in localStorage after login/registration

### Issue: Validation errors

**Solution**: Check that all required fields match backend schema requirements

## Next Steps

1. **SMS Gateway Integration**: Replace console.log OTP with actual SMS service (Twilio, MessageBird, etc.)
2. **Image Upload**: Implement file upload functionality for property images
3. **Admin Dashboard**: Create admin panel for property approval/rejection
4. **Real-time Updates**: Consider WebSocket integration for chat and notifications
5. **Error Boundaries**: Add Vue error boundaries for better error handling
6. **Loading States**: Add skeleton loaders for better UX
7. **Offline Support**: Implement service workers for PWA functionality

## Files Modified

- `src/services/authService.js` - Complete rewrite for OTP auth
- `src/services/propertyService.js` - Added validation and formatting
- `src/config/api.js` - Fixed URL construction and improved error handling
- `src/services/favoriteService.js` - Updated endpoints
- `src/components/OTPVerification.vue` - New component
- `src/pages/Login.vue` - Updated for OTP flow
- `src/pages/Register.vue` - Updated for OTP flow with Aadhaar
- `.env` - Updated API base URL

## Backend Compatibility

All changes are fully compatible with the existing backend:

- User model: `{ name, mobile, aadhaar, otp, otpExpires, role }`
- Property model: Matches all backend fields and validations
- Authentication: JWT-based with Bearer token
- CORS: Pre-configured for development environments

## Commit Messages

1. "Update authService to match backend OTP-based authentication with validation"
2. "Update propertyService with validation and proper backend integration"
3. "Fix API base URL construction to avoid double /api path"
4. "Update favoriteService to match backend API endpoints"
5. "Add OTP verification component for mobile-based authentication"
6. "Update Login page to use OTP-based authentication flow"
7. "Update Register page to use OTP-based authentication with Aadhaar support"

---

**Last Updated**: November 6, 2025
**Branch**: frontend-backend-integration-fix
