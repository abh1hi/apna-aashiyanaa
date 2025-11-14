// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAS8phqV1SjtjsF7jZmxeZBg8cUbKdQVZA",
  authDomain: "apnaashiyanaa-app.firebaseapp.com",
  projectId: "apnaashiyanaa-app",
  storageBucket: "apnaashiyanaa-app.firebasestorage.app",
  messagingSenderId: "920496133974",
  appId: "1:920496133974:web:31ed935fab1f72d6d5a8f7",
  measurementId: "G-XEB52QYP1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth, analytics };
