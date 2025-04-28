// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqX2UKQgFuy0AAlDXwzrZGvwFgEsQ5ePQ",
  authDomain: "mvps-7adb0.firebaseapp.com",
  projectId: "mvps-7adb0",
  storageBucket: "mvps-7adb0.appspot.com",
  messagingSenderId: "617672630606",
  appId: "1:617672630606:web:25dcaa6f784e266e677e1f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

export { auth, googleProvider };
