const admin = require('firebase-admin');

// Initialize Firebase Admin with error handling
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    }
    
    return {
      auth: admin.auth(),
      firestore: admin.firestore(),
      storage: admin.storage(),
      admin
    };
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    console.log('💡 Running in development mode with mock data');
    return null;
  }
};

// Firebase helpers
const firebaseHelpers = {
  // Create user in Firebase Auth
  createUser: async (email, password, displayName) => {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });
      return userRecord;
    } catch (error) {
      throw new Error(`Firebase user creation failed: ${error.message}`);
    }
  },

  // Verify ID token
  verifyToken: async (idToken) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      throw new Error(`User lookup failed: ${error.message}`);
    }
  },

  // Update user claims (roles)
  setCustomUserClaims: async (uid, claims) => {
    try {
      await admin.auth().setCustomUserClaims(uid, claims);
      return true;
    } catch (error) {
      throw new Error(`Setting user claims failed: ${error.message}`);
    }
  }
};

module.exports = { initializeFirebase, firebaseHelpers };