// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// VERIFY THE API KEY IS CORRECT
console.log('🔥 Firebase API Key:', firebaseConfig.apiKey);
console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);

// Check if we're using the correct API key
const expectedApiKey = 'AIzaSyAKyH4N8mWq99-UZRG1nD_ZwCp7sxIHgLs';
if (firebaseConfig.apiKey !== expectedApiKey) {
  console.error('❌ WRONG API KEY! Expected:', expectedApiKey, 'Got:', firebaseConfig.apiKey);
} else {
  console.log('✅ CORRECT API KEY!');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;