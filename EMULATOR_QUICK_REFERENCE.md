# Firebase Emulator Setup & Testing Guide

## Overview

This project is configured to run Firebase services locally using the Firebase Emulator Suite. This allows you to:

- Test authentication without using production Firebase
- Upload and manage images to a local Storage emulator
- Create and query Firestore documents locally
- Run Cloud Functions locally
- See real-time logs and inspect data via the Emulator UI

## Quick Start (2 minutes)

### Windows (PowerShell)

```powershell
# From the repository root
.\start-emulators.ps1
```

### macOS / Linux

```bash
# From the repository root
chmod +x start-emulators.sh
./start-emulators.sh
```

This script will:
1. Create `.env.local` if it doesn't exist
2. Install dependencies
3. Start all emulators

The Emulator UI will be available at **http://localhost:4000**

## Manual Setup

### Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Java Runtime Environment (JRE) 11+ (for emulator binaries)

### 1. Configure Frontend

Copy the example config:

```bash
cp frontend/client-app/.env.local.example frontend/client-app/.env.local
```

Edit `frontend/client-app/.env.local`:

```env
VITE_USE_EMULATOR=true
VITE_API_URL=http://localhost:5001/apnaashiyanaa-app/us-central1/api
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

### 2. Start Emulators

From the `backend` directory:

```bash
cd backend
firebase emulators:start
```

You should see output like:

```
✔  All emulators ready! It is now safe to connect your app.
┌─────────────────────────────────────────────────────────────┐
│ Auth Emulator listening at localhost:9099                   │
│ Firestore Emulator listening at localhost:8080              │
│ Storage Emulator listening at localhost:9199                │
│ Functions Emulator listening at localhost:5001              │
│ Emulator UI available at http://localhost:4000              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Start Frontend (in a separate terminal)

```bash
cd frontend/client-app
npm run dev
```

Frontend will be available at **http://localhost:5173** (or similar, check console output)

## Testing Image Upload

### Create a Test User

1. Open **http://localhost:4000** (Emulator UI)
2. Click **Authentication**
3. Click **Create User**
4. Enter:
   - Email: `test@example.com`
   - Password: `Test@12345` (must be strong)
5. Click **Create**

### Test Property Creation with Images

1. Open frontend at `http://localhost:5173`
2. Click **Sign In** (or navigate to login page)
3. Sign in with `test@example.com` / `Test@12345`
4. Click **Add Property**
5. Fill in the form:
   - **Name**: Test Property
   - **Description**: Test description
   - **Price**: 500000
   - **Property Type**: Apartment
   - **Bedrooms**: 2
   - **Bathrooms**: 1
   - **Area**: 1000 sqft
   - **Images**: Upload 1-3 test images
   - **Amenities**: Select at least one (e.g., Parking, Gym)
6. Click **Submit**

### Verify Upload Success

#### In Emulator UI (http://localhost:4000):

**Firestore Tab:**
- You should see a `properties` collection
- Click to view the created property document
- Check that the `images` array contains URLs

**Storage Tab:**
- You should see uploaded images in the `properties/` folder
- Each image has a UUID filename

#### In Browser Console:

- Check the network tab for successful POST to `/api/properties`
- Response should include the created property with image URLs

#### In Backend Logs:

You should see logs like:

```
[multer.fileFilter] Processing file: image1.jpg, mimetype: image/jpeg
[multer.fileFilter] ✓ File accepted: image1.jpg
[processAndAttachUrls] Processing 1 files to properties
[processAndUploadImage] Starting upload for image1.jpg
[processAndUploadImage] ✓ Upload successful: properties/abc123.jpg
[processAndUploadImage] ✓ File made public: https://storage.googleapis.com/...
```

## Emulator Configuration

### Ports

| Service | Port | URL |
|---------|------|-----|
| Auth | 9099 | http://localhost:9099 |
| Firestore | 8080 | http://localhost:8080 |
| Storage | 9199 | http://localhost:9199 |
| Functions | 5001 | http://localhost:5001 |
| Hub | 4400 | http://localhost:4400 |
| UI | 4000 | http://localhost:4000 |

These are defined in `backend/firebase.json`.

### Environment Variables

Key `.env.local` variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_USE_EMULATOR` | `true` | Enable emulator mode |
| `VITE_API_URL` | `http://localhost:5001/...` | Backend Functions API |
| `VITE_FIREBASE_AUTH_EMULATOR_HOST` | `localhost:9099` | Auth Emulator |
| `VITE_FIREBASE_STORAGE_EMULATOR_HOST` | `localhost:9199` | Storage Emulator |

## Troubleshooting

### Port Already in Use

Check which process is using the port:

```bash
# Windows (PowerShell)
Get-NetTcpConnection -LocalPort 8080 -ErrorAction SilentlyContinue

# macOS/Linux
lsof -i :8080
```

Stop the process or change the port in `firebase.json`.

### Emulator Won't Start

Check Java is installed:

```bash
java -version
```

If not installed:
- **Windows**: Download from oracle.com or use `choco install jdk20`
- **macOS**: `brew install openjdk@20`
- **Linux**: `apt-get install default-jre` or similar

### Images Not Uploading

Check:
1. Frontend `.env.local` has `VITE_USE_EMULATOR=true`
2. Storage Emulator is running (check port 9199)
3. Backend logs show `[processAndUploadImage]` messages
4. Firestore document was created (check in Emulator UI)

### Auth Emulator Errors

If you see "Error: Connect ECONNREFUSED":

1. Verify Auth Emulator is running (port 9099)
2. Check frontend config: `connectAuthEmulator(auth, 'http://localhost:9099')`
3. Clear browser cache and localStorage

### Functions API Not Responding

Check:
1. Functions Emulator is running (port 5001)
2. Frontend API URL is correct: `http://localhost:5001/apnaashiyanaa-app/us-central1/api`
3. Backend code has no syntax errors

Run with debug logging:

```bash
cd backend
firebase emulators:start --debug
```

## Data Persistence

By default, emulator data is cleared when you stop the emulator.

### Save Data Between Sessions

```bash
cd backend
firebase emulators:start --import=./emulator-data --export-on-exit
```

This will:
- Load data from `./emulator-data` on start
- Save data to `./emulator-data` on exit

### Clear All Emulator Data

```bash
rm -rf emulator-data
rm -rf ~/.cache/firebase/emulators/*
```

## Switching to Production

### Use Production Firebase

1. Remove or rename `.env.local`
2. Restart frontend dev server
3. Frontend will use production Firebase endpoints

### Deploy to Production

```bash
cd backend
firebase deploy
```

This will deploy:
- Cloud Functions
- Firestore rules
- Storage rules

## Next Steps

Once you've tested locally:

1. Fix any bugs found during emulator testing
2. Deploy: `firebase deploy`
3. Test in production (with real users if applicable)
4. Monitor logs: https://console.cloud.google.com/logs

## File Locations

- **Emulator Config**: `backend/firebase.json`
- **Frontend Config**: `frontend/client-app/.env.local`
- **Frontend Setup**: `frontend/client-app/src/firebaseConfig.js`
- **API Service**: `frontend/client-app/src/services/propertyService.js`
- **Backend Code**: `backend/functions/`

## More Info

- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Local Emulator Configuration](https://firebase.google.com/docs/emulator-suite/connect_emulator)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
