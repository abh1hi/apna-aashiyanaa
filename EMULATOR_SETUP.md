# Firebase Emulator Suite Setup

This guide sets up local Firebase emulators for Auth, Firestore, Storage, and Functions testing.

## Prerequisites

- Node.js 20+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Java Runtime Environment (JRE) 11+ for emulator

## Installation

### 1. Install Firebase Emulator Suite

```bash
# Install globally (recommended)
npm install -g firebase-tools

# Or install locally in your project
npm install --save-dev firebase-tools
```

### 2. Download Emulator Binaries

From the backend directory:

```bash
cd backend
firebase emulators:start --dry-run
```

This downloads all necessary emulator binaries.

## Configuration

The `firebase.json` in the backend folder is already configured with:

- **Auth Emulator**: `localhost:9099`
- **Firestore Emulator**: `localhost:8080`
- **Storage Emulator**: `localhost:9199`
- **Functions Emulator**: `localhost:5001`
- **Emulator Hub**: `localhost:4400`
- **Emulator UI**: `http://localhost:4000`

## Starting Emulators

### From Backend Directory

```bash
cd backend
firebase emulators:start
```

This starts all emulators and displays their endpoints.

### With Verbose Logging

```bash
firebase emulators:start --debug
```

## Environment Configuration

### For Backend (Node.js Functions)

The backend automatically detects emulators via:
- `FIRESTORE_EMULATOR_HOST` (set by firebase CLI)
- `FIREBASE_AUTH_EMULATOR_HOST` (set by firebase CLI)
- `FIREBASE_STORAGE_EMULATOR_HOST` (set by firebase CLI)

No code changes needed — the emulator environment variables are injected automatically.

### For Frontend (Vue.js)

Create a `.env.local` file in `frontend/client-app/`:

```env
VITE_API_URL=http://localhost:5001/apnaashiyanaa-app/us-central1/api
VITE_USE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

Update `frontend/src/services/api.js`:

```javascript
const baseURL = import.meta.env.VITE_USE_EMULATOR 
  ? import.meta.env.VITE_API_URL
  : process.env.REACT_APP_API_URL || '/api';
```

Update `frontend/src/services/authService.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Connect to emulator in dev
if (import.meta.env.VITE_USE_EMULATOR) {
  connectAuthEmulator(auth, `http://localhost:9099`);
}
```

Update `frontend/src/services/propertyService.js` to connect Storage emulator:

```javascript
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const storage = getStorage();

if (import.meta.env.VITE_USE_EMULATOR) {
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## Testing Image Upload Locally

### 1. Start Emulators

```bash
cd backend
firebase emulators:start
```

Wait for all services to start. Check the UI at `http://localhost:4000`.

### 2. Start Frontend Dev Server (in separate terminal)

```bash
cd frontend/client-app
npm run dev
```

### 3. Create Test User

In the Emulator UI (`http://localhost:4000`), go to **Auth** tab and create a test user:
- Email: `test@example.com`
- Password: `TestPassword123`

### 4. Sign In and Test Property Creation

1. Open frontend at `http://localhost:5173` (or port from `npm run dev`)
2. Sign in with test user credentials
3. Navigate to "Add Property"
4. Upload an image (the emulator will save it locally)
5. Submit the form

### 5. View Uploaded Files

Check the Emulator UI → **Storage** tab to see uploaded images.

Check the Emulator UI → **Firestore** tab to see created property documents.

## Clearing Emulator Data

### Reset All Emulators

```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

This saves data between restarts. To clear:

```bash
rm -rf emulator-data
firebase emulators:start
```

### Clear Specific Service

Stop emulators and delete the data directory:

```bash
rm -rf ~/.cache/firebase/emulators/*
```

## Troubleshooting

### Emulator Won't Start

Check if ports are in use:

```bash
# Windows (PowerShell)
Get-NetTcpConnection -LocalPort 8080, 9099, 9199, 5001 -ErrorAction SilentlyContinue

# macOS/Linux
lsof -i :8080
lsof -i :9099
lsof -i :9199
lsof -i :5001
```

Kill processes using those ports or change emulator ports in `firebase.json`.

### Auth Emulator Shows "Error: Connect ECONNREFUSED"

Ensure the Auth Emulator host is correct in `.env.local` and frontend config:

```javascript
// Should use http:// not https://
connectAuthEmulator(auth, 'http://localhost:9099');
```

### Storage Upload Fails

Check Storage Emulator is running (port 9199) and frontend has correct config:

```javascript
connectStorageEmulator(storage, 'localhost', 9199);
```

### Functions Emulator Not Triggering

Functions emulator runs on `:5001`. Update frontend API URL to point there:

```env
VITE_API_URL=http://localhost:5001/apnaashiyanaa-app/us-central1/api
```

## Switching Between Local and Production

### Use Local Emulators

```bash
VITE_USE_EMULATOR=true npm run dev
```

### Use Production Firebase

```bash
VITE_USE_EMULATOR=false npm run dev
```

Or remove `.env.local` and use defaults.

## Emulator UI

Access the Emulator UI at **http://localhost:4000** to:

- View and manage Auth users
- Inspect Firestore collections and documents
- Browse Storage buckets and files
- View Functions logs

## Next Steps

1. Start emulators: `firebase emulators:start`
2. Configure frontend `.env.local`
3. Test authentication
4. Test property creation and image upload
5. Once confident, deploy to production: `firebase deploy`
