# User Profile Page Documentation

## Overview

This document describes the implementation of the user profile page for the Property Dealer App, including frontend components and backend API integration.

## Features Implemented

### Frontend (Vue.js)

#### Profile Page Component
**Location:** `metainflu/frontend/client-app/src/pages/user/Profile.vue`

**Key Features:**
1. **User Information Display**
   - User avatar with initials
   - Full name
   - Mobile number
   - Aadhaar number (optional)
   - Account role/type
   - User ID
   - Join date
   - Last update timestamp

2. **Edit Mode**
   - Toggle between view and edit modes
   - Inline form editing
   - Form validation
   - Cancel functionality to revert changes

3. **States**
   - Loading state with spinner
   - Error state with message
   - Success state after updates
   - Disabled inputs in view mode

4. **Design**
   - Blue and white color scheme
   - Mobile-responsive layout
   - Clean, modern UI
   - Accessible form elements

#### Data Flow

```
User navigates to profile
  ↓
Component mounted
  ↓
Fetch user data from backend
  ↓
Display profile information
  ↓
User clicks "Edit Profile"
  ↓
Enable form inputs
  ↓
User makes changes
  ↓
User submits form
  ↓
Send update request to backend
  ↓
Update local state and auth store
  ↓
Show success message
```

### Backend (Node.js/Express)

#### User Controller Updates
**Location:** `metainflu/backend/controllers/userController.js`

**Endpoints:**

1. **GET /api/users/:id**
   - Fetches user profile data
   - Returns: `_id`, `name`, `mobile`, `aadhaar`, `role`, `createdAt`, `updatedAt`
   - Protected route (requires authentication)

2. **PUT /api/users/:id**
   - Updates user profile data
   - Accepts: `name`, `mobile`, `aadhaar`
   - Returns: Updated user object with all fields
   - Protected route (requires authentication)

#### API Response Format

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "aadhaar": "123456789012",
  "role": "buyer",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-11-07T07:00:00.000Z"
}
```

## User Service

**Location:** `metainflu/frontend/client-app/src/services/userService.js`

```javascript
import { apiClient } from '../config/api';

const getUserProfile = (id) => {
  return apiClient.get(`/users/${id}`);
};

const updateUserProfile = (id, userData) => {
  return apiClient.put(`/users/${id}`, userData);
};

export default {
  getUserProfile,
  updateUserProfile,
};
```

## State Management

The profile page integrates with the Pinia auth store:

**Location:** `metainflu/frontend/client-app/src/store/auth.js`

- Retrieves user ID from authenticated user
- Updates user data after successful profile update
- Maintains authentication state

## Validation Rules

1. **Name**
   - Required field
   - Text input

2. **Mobile**
   - Required field
   - Pattern: 10 digits
   - Type: tel

3. **Aadhaar**
   - Optional field
   - Pattern: 12 digits
   - Maxlength: 12

4. **Role**
   - Read-only
   - Cannot be modified by user

## Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB running
- Backend server running
- Frontend dev server running

### Steps to Test

1. **Start Backend Server**
   ```bash
   cd metainflu/backend
   npm install
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   cd metainflu/frontend/client-app
   npm install
   npm run dev
   ```

3. **Navigate to Profile Page**
   - Login to the application
   - Navigate to `/profile` or click on user menu → Profile

## Usage Guide

### Viewing Profile
1. Navigate to the profile page
2. View all your user information
3. See your account creation date and last update

### Editing Profile
1. Click the "Edit Profile" button
2. Modify name, mobile, or aadhaar fields
3. Click "Save Changes" to update
4. Or click "Cancel" to discard changes

### Success/Error Handling
- Success messages appear after successful updates
- Error messages display if update fails
- Form validation prevents invalid data submission

## Security Considerations

1. **Authentication Required**
   - All profile endpoints require valid JWT token
   - Users can only access their own profile

2. **Data Validation**
   - Backend validates all input data
   - Pattern matching on frontend for mobile/aadhaar

3. **Role Protection**
   - User role cannot be modified through profile page
   - Role changes require admin privileges

## Color Scheme

- Primary: Blue (#2563EB - blue-600)
- Secondary: White (#FFFFFF)
- Background: Light gray (#F9FAFB - gray-50)
- Text: Dark gray (#111827 - gray-900)
- Success: Green (#10B981)
- Error: Red (#EF4444)

## Mobile Responsiveness

- Fully responsive design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px

## Future Enhancements

1. Profile picture upload
2. Email field
3. Address management
4. Password change functionality
5. Account deletion option
6. Activity log/history
7. Two-factor authentication

## Troubleshooting

### Common Issues

1. **"User not authenticated" error**
   - Solution: Ensure user is logged in and token is valid

2. **Profile not loading**
   - Solution: Check backend server is running
   - Verify API endpoint configuration

3. **Update fails**
   - Solution: Check form validation
   - Verify mobile/aadhaar format

## API Testing

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/users/:userId \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Profile
```bash
curl -X PUT http://localhost:5000/api/users/:userId \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9876543210",
    "aadhaar": "123456789012"
  }'
```

## Contributing

When making changes to the profile page:
1. Test all form validations
2. Verify mobile responsiveness
3. Check error handling
4. Update this documentation
5. Test with different user roles

## Version History

- **v1.0.0** (2025-11-07)
  - Initial implementation
  - Basic profile view and edit
  - Backend API integration
  - Mobile-responsive design
