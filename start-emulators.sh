#!/bin/bash

# Quick Start Script for Firebase Emulator Testing
# Run this script from the repository root to start emulators and frontend

echo -e "\033[1;36m=== Firebase Emulator Quick Start ===\033[0m"

# Check if Firebase CLI is installed
echo -e "\033[1;33mChecking Firebase CLI...\033[0m"
if ! command -v firebase &> /dev/null; then
  echo -e "\033[1;31mFirebase CLI not found. Install it with:\033[0m"
  echo -e "\033[1;33mnpm install -g firebase-tools\033[0m"
  exit 1
fi

firebase --version
echo -e "\033[1;32mFirebase CLI found.\033[0m"

# Check Node.js version
echo -e "\033[1;33mChecking Node.js version...\033[0m"
node --version
echo -e "\033[1;32mNode.js found.\033[0m"

# Step 1: Create .env.local if it doesn't exist
echo -e "\n\033[1;36m=== Step 1: Creating Frontend Config ===\033[0m"
ENV_LOCAL_PATH="frontend/client-app/.env.local"
if [ ! -f "$ENV_LOCAL_PATH" ]; then
  echo -e "\033[1;33mCreating $ENV_LOCAL_PATH from example...\033[0m"
  cp "frontend/client-app/.env.local.example" "$ENV_LOCAL_PATH"
  echo -e "\033[1;32m✓ Created $ENV_LOCAL_PATH\033[0m"
  echo -e "\033[0;90m  Edit this file if you need to change emulator ports.\033[0m"
else
  echo -e "\033[1;32m✓ $ENV_LOCAL_PATH already exists\033[0m"
fi

# Step 2: Install dependencies if needed
echo -e "\n\033[1;36m=== Step 2: Installing Dependencies ===\033[0m"

if [ ! -d "backend/functions/node_modules" ]; then
  echo -e "\033[1;33mInstalling backend dependencies...\033[0m"
  (cd backend/functions && npm install)
else
  echo -e "\033[1;32m✓ Backend dependencies already installed\033[0m"
fi

if [ ! -d "frontend/client-app/node_modules" ]; then
  echo -e "\033[1;33mInstalling frontend dependencies...\033[0m"
  (cd frontend/client-app && npm install)
else
  echo -e "\033[1;32m✓ Frontend dependencies already installed\033[0m"
fi

# Step 3: Start emulators
echo -e "\n\033[1;36m=== Step 3: Starting Firebase Emulators ===\033[0m"
echo -e "\033[1;33mThis will start:\033[0m"
echo -e "\033[0;90m  - Auth Emulator (port 9099)\033[0m"
echo -e "\033[0;90m  - Firestore Emulator (port 8080)\033[0m"
echo -e "\033[0;90m  - Storage Emulator (port 9199)\033[0m"
echo -e "\033[0;90m  - Functions Emulator (port 5001)\033[0m"
echo -e "\033[0;90m  - Emulator UI (http://localhost:4000)\033[0m"

echo -e "\n\033[1;33mStarting emulators in 2 seconds...\033[0m"
sleep 2

cd backend
firebase emulators:start
