# Role-Based Access Implementation

## Overview

This document describes the implementation of role-based access control (RBAC) in the Property Dealer App. All users are now automatically assigned the `buyer` role upon registration, with no option to choose between buyer and seller during the registration process.

## Changes Made

### 1. Backend Changes

#### User Model (`metainflu/backend/models/User.js`)

**Updated:**
- Changed default role from `'user'` to `'buyer'`
- Added role enum validation: `['buyer', 'seller', 'admin']`
- Role is automatically set to `'buyer'` for all new registrations

```javascript
role: {
  type: String,
  required: true,
  default: 'buyer',
  enum: ['buyer', 'seller', 'admin'],
}
```

#### Auth Controller (`metainflu/backend/controllers/authController.js`)

**Updated:**
- Added comment in `registerUser` function clarifying that role is automatically set by schema default
- Updated `verifyOTP` function to include `role` in the response payload
- Users can no longer specify their role during registration

**New Response Format:**
```javascript
res.json({
  _id: user.id,
  name: user.name,
  mobile: user.mobile,
  aadhaar: user.aadhaar,
  role: user.role, // Now included in response
  token: generateToken(user._id),
});
```

#### Auth Middleware (`metainflu/backend/middleware/authMiddleware.js`)

**Updated:**
- Removed `vendor` middleware (replaced with `seller`)
- Added new middleware functions:
  - `buyer`: Checks if user has buyer role
  - `seller`: Checks if user has seller role
  - `buyerOrSeller`: Checks if user has either buyer or seller role
- Kept existing `admin` and `protect` middleware

**Available Middleware Functions:**
```javascript
module.exports = { protect, admin, buyer, seller, buyerOrSeller };
```

### 2. Frontend Changes

#### Register Component (`metainflu/frontend/client-app/src/pages/Register.vue`)

**Status:** No changes required
- The registration form already did not include any role selection UI
- Users only provide: name, mobile number, and optional Aadhaar number
- Role is automatically assigned by the backend

## Role Hierarchy

### Buyer (Default Role)
- Automatically assigned to all new users
- Can browse properties
- Can add properties to favorites
- Can contact sellers
- Can manage their profile

### Seller
- Can be promoted from buyer by admin
- All buyer permissions plus:
- Can list properties
- Can manage their property listings
- Can respond to buyer inquiries

### Admin
- Full system access
- Can manage all users
- Can promote buyers to sellers
- Can manage all properties
- Can access admin dashboard

## Usage Examples

### Protecting Routes with Role Middleware

```javascript
// Protect route for buyers only
router.get('/api/favorites', protect, buyer, getFavorites);

// Protect route for sellers only
router.post('/api/properties', protect, seller, createProperty);

// Protect route for buyers or sellers
router.get('/api/profile', protect, buyerOrSeller, getProfile);

// Protect route for admins only
router.get('/api/admin/users', protect, admin, getAllUsers);
```

## Role Promotion Flow

### Buyer to Seller Promotion

To promote a buyer to seller, an admin can use the user management endpoint:

```javascript
// Admin updates user role
PUT /api/admin/users/:userId
Headers: { Authorization: 'Bearer <admin_token>' }
Body: { role: 'seller' }
```

## Testing

### Test New User Registration

1. Register a new user
2. Verify OTP
3. Check that the response includes `role: 'buyer'`
4. Confirm user can access buyer-only routes
5. Confirm user cannot access seller/admin routes

### Test Role-Based Access

```bash
# Test buyer access
curl -H "Authorization: Bearer <buyer_token>" \
  http://localhost:5000/api/buyer-only-route

# Test seller access (should fail for buyer)
curl -H "Authorization: Bearer <buyer_token>" \
  http://localhost:5000/api/seller-only-route
```

## Migration Guide

### Updating Existing Users

If you have existing users with `role: 'user'`, run this migration:

```javascript
// MongoDB migration script
db.users.updateMany(
  { role: 'user' },
  { $set: { role: 'buyer' } }
);
```

### Updating Existing Route Protection

Replace old middleware references:

```javascript
// Before
const { protect, vendor } = require('./middleware/authMiddleware');
router.post('/api/properties', protect, vendor, createProperty);

// After
const { protect, seller } = require('./middleware/authMiddleware');
router.post('/api/properties', protect, seller, createProperty);
```

## Security Considerations

1. **Role Validation**: All roles are validated against the enum in the User model
2. **Default Role**: New users always start with 'buyer' role, preventing privilege escalation
3. **Role Changes**: Only admins can change user roles through protected endpoints
4. **Token Claims**: User role is fetched fresh from database on each protected request

## Future Enhancements

1. **Self-Service Seller Registration**: Add a separate seller application flow
2. **Role Permissions Matrix**: Create a detailed permissions table for each role
3. **Multi-Role Support**: Allow users to have multiple roles simultaneously
4. **Role-Based UI**: Show/hide UI elements based on user role
5. **Activity Logging**: Track role changes and admin actions

## API Documentation Updates

### POST /api/auth/register

**Request Body:**
```json
{
  "name": "John Doe",
  "mobile": "1234567890",
  "aadhaar": "123456789012" // Optional
}
```

**Response:**
```json
{
  "message": "OTP sent to mobile number",
  "userId": "60d5ec49f1b2c8b1f8e4e1a1"
}
```

### POST /api/auth/verify-otp

**Request Body:**
```json
{
  "userId": "60d5ec49f1b2c8b1f8e4e1a1",
  "otp": "123456"
}
```

**Response:**
```json
{
  "_id": "60d5ec49f1b2c8b1f8e4e1a1",
  "name": "John Doe",
  "mobile": "1234567890",
  "aadhaar": "123456789012",
  "role": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Conclusion

This implementation provides a secure, scalable role-based access control system with a clear user journey starting from buyer role. The system can be easily extended to support additional roles and permissions as needed.
