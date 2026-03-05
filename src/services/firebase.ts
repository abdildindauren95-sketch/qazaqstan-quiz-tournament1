import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is configured
export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analytics: Analytics | undefined;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Analytics only works in browser environments
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

// Providers
const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
const appleProvider = isFirebaseConfigured ? new OAuthProvider('apple.com') : null;

export { analytics };

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error("Firebase is not configured. Please add your API keys to .env");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

export const loginWithApple = async () => {
  if (!auth || !appleProvider) {
    throw new Error("Firebase is not configured. Please add your API keys to .env");
  }
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (error) {
    console.error("Apple Login Error:", error);
    throw error;
  }
};

export const logout = () => {
  if (auth) return signOut(auth);
  return Promise.resolve();
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  // If no auth, just return a dummy unsubscribe function
  callback(null);
  return () => {};
};
