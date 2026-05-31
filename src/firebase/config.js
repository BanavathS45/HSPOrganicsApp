// HSP Organics Firebase Config and Initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// All credentials come from Vite environment variables (.env file)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app;
let auth = null;
let db = null;
let googleProvider = null;
let isMock = true;

// Only initialize real Firebase when all keys are present and look real
const isValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 10 &&
  !firebaseConfig.apiKey.startsWith("YOUR_");


if (isValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Request email + profile scopes so we get displayName and photoURL
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Force account selector every login (UX best-practice for multi-account users)
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    isMock = false;
    console.log("HSP Organics ✅ — Real Firebase SDK initialized.");
  } catch (error) {
    console.warn("HSP Organics ⚠️ — Firebase init failed, switching to LocalStorage mock:", error);
    isMock = true;
  }
} else {
  console.log("HSP Organics 🌿 — No Firebase credentials found. Using LocalStorage emulation mode.");
  isMock = true;
}

export { app, auth, db, googleProvider, isMock };
