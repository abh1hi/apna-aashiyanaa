// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Get environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAS8phqV1SjtjsF7jZmxeZBg8cUbKdQVZA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apnaashiyanaa-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apnaashiyanaa-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apnaashiyanaa-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920496133974",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:920496133974:web:31ed935fab1f72d6d5a8f7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XEB52QYP1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Connection Settings ---

// Check if we should use emulators
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators && window.location.hostname === "localhost") {
  console.log('🔧 Using Firebase Emulators for local development');
  
  // Connect to Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  
  // Connect to Firestore Emulator
  connectFirestoreEmulator(db, "localhost", 8080);
  
  // Connect to Storage Emulator
  connectStorageEmulator(storage, "localhost", 9199);
} else {
  console.log('🔥 Using LIVE Firebase backend');
}

// Log configuration (only in development)
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    useEmulators
  });
}

export { auth, db, storage, analytics };
