import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      console.log('📝 Registering user:', userData);
      const { email, password, name, firstName, lastName, userType } = userData;
      
      // Use name field if firstName/lastName are not provided
      const userFirstName = firstName || name || 'User';
      const userLastName = lastName || '';
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase auth user created:', user.uid);

      // Prepare user data for Firestore
      const userProfile = {
        uid: user.uid,
        email: email,
        firstName: userFirstName,
        lastName: userLastName,
        userType: userType,
        role: userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        status: 'active'
      };

      console.log('💾 Saving user profile:', userProfile);

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('✅ User profile saved to Firestore');

      return { 
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userProfile 
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Login user
  async login(email, password) {
    try {
      console.log('🔐 Logging in user:', email);
      
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase auth successful:', user.uid);

      // Wait a moment to ensure Firestore is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get additional user data from Firestore with retry logic
      let userData = null;
      let retries = 3;
      
      while (retries > 0 && !userData) {
        try {
          console.log(`🔄 Attempting to fetch user data from Firestore (${retries} retries left)...`);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log('✅ User data from Firestore:', userData);
            break;
          } else {
            console.warn('⚠️ No user document found in Firestore for:', user.uid);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (firestoreError) {
          console.error('❌ Firestore error:', firestoreError);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // If still no user data, use default values
      if (!userData) {
        console.warn('⚠️ Using default user data after retries failed');
        userData = {
          firstName: 'User',
          lastName: '',
          userType: 'student', // Default to student
          status: 'active'
        };
      }

      // Ensure all required fields are present
      const fullUserData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: userData?.firstName || 'User',
        lastName: userData?.lastName || '',
        userType: userData?.userType || 'student',
        role: userData?.userType || userData?.role || 'student',
        status: userData?.status || 'active',
        ...userData
      };

      console.log('🔑 Final user data for context:', fullUserData);
      console.log('🎯 User role confirmed:', fullUserData.userType);
      return fullUserData;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Get current user
  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, 
        async (user) => {
          unsubscribe();
          if (user) {
            try {
              console.log('🔄 Getting current user data for:', user.uid);
              
              // Wait a moment to ensure Firestore is ready
              await new Promise(resolve => setTimeout(resolve, 500));

              // Get additional user data from Firestore with retry logic
              let userData = null;
              let retries = 3;
              
              while (retries > 0 && !userData) {
                try {
                  console.log(`🔄 Attempting to fetch current user data (${retries} retries left)...`);
                  const userDoc = await getDoc(doc(db, 'users', user.uid));
                  
                  if (userDoc.exists()) {
                    userData = userDoc.data();
                    console.log('✅ Current user data from Firestore:', userData);
                    break;
                  } else {
                    console.warn('⚠️ No user document found for current user:', user.uid);
                    retries--;
                    if (retries > 0) {
                      await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                  }
                } catch (firestoreError) {
                  console.error('❌ Firestore error getting current user:', firestoreError);
                  retries--;
                  if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }

              // If still no user data, use default values
              if (!userData) {
                console.warn('⚠️ Using default data for current user after retries failed');
                userData = {
                  firstName: 'User',
                  lastName: '',
                  userType: 'student', // Default to student
                  status: 'active'
                };
              }

              // Ensure all required fields are present
              const fullUserData = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                firstName: userData?.firstName || 'User',
                lastName: userData?.lastName || '',
                userType: userData?.userType || 'student',
                role: userData?.userType || userData?.role || 'student',
                status: userData?.status || 'active',
                ...userData
              };

              console.log('🔑 Final current user data:', fullUserData);
              console.log('🎯 Current user role confirmed:', fullUserData.userType);
              resolve(fullUserData);
            } catch (error) {
              console.error('Error getting user data:', error);
              // Return basic user data even if everything fails
              resolve({
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                firstName: 'User',
                userType: 'student',
                role: 'student',
                status: 'active'
              });
            }
          } else {
            console.log('🔐 No current user found');
            resolve(null);
          }
        },
        reject
      );
    });
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      console.log('✅ Logout successful');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  // Improved Error message helper
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/invalid-email': 'Invalid email address format',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/invalid-login-credentials': 'Invalid email or password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters long',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
      'auth/operation-not-allowed': 'Email/password authentication is not enabled. Please contact support.',
      'auth/requires-recent-login': 'Please log in again to complete this action.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
    };
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
};