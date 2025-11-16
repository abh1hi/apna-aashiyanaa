
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
// For more information on how to get this, visit: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  console.log('[Firebase] Connecting to local emulators');
  
  // Auth Emulator
  if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
    const authEmulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
    connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
    console.log(`[Firebase] Auth Emulator: http://${authEmulatorHost}`);
  }
  
  // Storage Emulator
  if (import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST) {
    const [host, port] = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST.split(':');
    connectStorageEmulator(storage, host, parseInt(port));
    console.log(`[Firebase] Storage Emulator: ${host}:${port}`);
  }
}

export { app, auth, storage };
