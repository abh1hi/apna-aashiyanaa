# CORS and Endpoint Configuration Fix

## Issues Identified

### 1. CORS Error with HTTPS Localhost
**Problem**: Frontend running on `https://localhost:5173` but CORS config only allowed `http://localhost:5173`

**Error Message**:
```
Access to XMLHttpRequest at 'https://us-central1-apnaashiyanaa-app.cloudfunctions.net/auth/register' 
from origin 'https://localhost:5173' has been blocked by CORS policy
```

**Solution**: Added HTTPS localhost origins to CORS whitelist in `api.js`

### 2. Region Mismatch
**Problem**: Function deployed to `us-central1` but code configured for `asia-south1`

**Solution**: Updated function region in `api.js` from `asia-south1` to `us-central1`

### 3. Missing Preflight Handling
**Problem**: OPTIONS preflight requests returning 404 or not properly handled

**Solution**: Added explicit OPTIONS handler and proper CORS configuration

## Changes Made

### backend/functions/api.js

```javascript
// BEFORE
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
};

exports.api = functions
  .region('asia-south1')  // WRONG REGION
  .https.onRequest(app);

// AFTER
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:5173',  // Added HTTPS
    'https://localhost:5174'   // Added HTTPS
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS FIRST
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle preflight

exports.api = functions
  .region('us-central1')  // CORRECT REGION
  .https.onRequest(app);
```

## Deployment Instructions

### Option 1: Deploy from This Branch

```bash
# Switch to the fix branch
git checkout fix/cors-and-endpoint-issues

# Pull latest changes
git pull origin fix/cors-and-endpoint-issues

# Navigate to functions directory
cd backend/functions

# Install dependencies (if needed)
npm install

# Deploy to Firebase
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### Option 2: Test Locally First

```bash
# Switch to the fix branch
git checkout fix/cors-and-endpoint-issues

# Navigate to functions directory
cd backend/functions

# Start Firebase emulator
npm run serve

# Update your frontend .env to point to emulator
# VITE_API_URL=http://localhost:5001/apnaashiyanaa-app/us-central1/api
```

### Option 3: Merge to Main

```bash
# Create a Pull Request from fix/cors-and-endpoint-issues to main
# After review and testing, merge and deploy

git checkout main
git merge fix/cors-and-endpoint-issues
git push origin main

cd backend/functions
firebase deploy --only functions
```

## Testing the Fix

### 1. Test Health Endpoint

```bash
curl -X OPTIONS \
  https://us-central1-apnaashiyanaa-app.cloudfunctions.net/api/health \
  -H "Origin: https://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected Response Headers:
```
Access-Control-Allow-Origin: https://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Test Auth Endpoint

```bash
curl -X POST \
  https://us-central1-apnaashiyanaa-app.cloudfunctions.net/api/auth/register \
  -H "Origin: https://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "test-token"}' \
  -v
```

### 3. Test from Frontend

Update your frontend `authService.js` to verify the correct endpoint:

```javascript
const API_URL = 'https://us-central1-apnaashiyanaa-app.cloudfunctions.net/api/auth';

// Make sure your axios config includes:
axios.post(`${API_URL}/register`, data, {
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // Important for CORS with credentials
});
```

## Environment Variables (Optional)

For production, set CORS_ORIGINS environment variable:

```bash
# Set Firebase config
firebase functions:config:set cors.origins="https://your-production-domain.com,https://localhost:5173"

# Update api.js to use it
const corsOrigins = functions.config().cors?.origins?.split(',') || [
  'http://localhost:5173',
  // ... defaults
];
```

## Verification Checklist

- [ ] Branch created: `fix/cors-and-endpoint-issues`
- [ ] HTTPS localhost origins added to CORS config
- [ ] Function region changed to `us-central1`
- [ ] OPTIONS handler added
- [ ] Methods and headers configured in CORS
- [ ] Functions deployed successfully
- [ ] Health endpoint returns 200
- [ ] Auth endpoint returns proper CORS headers
- [ ] Frontend can successfully make requests
- [ ] No CORS errors in browser console
- [ ] No 404 errors for OPTIONS requests

## Troubleshooting

### Still Getting 404 on OPTIONS Request

1. Check deployed function name:
```bash
firebase functions:list
```

2. Verify the endpoint URL matches:
```
https://[region]-[project-id].cloudfunctions.net/api/auth/register
                                                    ^^^ Function name
```

3. Check Firebase Console:
   - Go to Firebase Console → Functions
   - Verify `api` function exists
   - Check the trigger URL

### Still Getting CORS Errors

1. Clear browser cache and hard reload (Ctrl+Shift+R)
2. Check Network tab in DevTools:
   - Look for OPTIONS request
   - Check response headers
   - Verify status code (should be 204 or 200)

3. Verify CORS middleware is first:
```javascript
// In api.js - order matters!
app.use(cors(corsOptions));  // MUST be first
app.options('*', cors(corsOptions));
app.use(express.json());  // Then other middleware
```

### Function Not Found

1. Check if you're calling the right function name:
   - Should be: `/api/auth/register` (not `/auth/register`)
   - The function name is `api`, and Express handles `/auth/register` route

2. Verify index.js exports the function:
```javascript
exports.api = api;  // Make sure this exists
```

## Additional Notes

- The error showed requests going to `us-central1`, so we matched the region in code
- If you prefer `asia-south1` for better latency in India, update:
  1. Change region in `api.js` back to `asia-south1`
  2. Redeploy functions
  3. Update frontend to use `asia-south1` in API URL

- For production, replace localhost origins with your actual domain
- Consider using Firebase Hosting with rewrites to avoid CORS issues

## Contact

If issues persist after deployment, check:
- Firebase Functions logs: `firebase functions:log`
- Browser Network tab for detailed error messages
- Firebase Console for function deployment status
