// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS8phqV1SjtjsF7jZmxeZBg8cUbKdQVZA",
  authDomain: "apnaashiyanaa-app.firebaseapp.com",
  projectId: "apnaashiyanaa-app",
  storageBucket: "apnaashiyanaa-app.appspot.com",
  messagingSenderId: "33188383868",
  appId: "1:33188383868:web:12b3469d7c3150c4871037"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
