
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed to avoid conflict
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from './config'; // Your Firebase config and initialized auth instance

// Wrapper for onAuthStateChanged to simplify usage
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export const firebaseSignUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // console.error("Firebase SignUp Error:", error);
    throw error as AuthError;
  }
};

export const firebaseLogin = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // console.error("Firebase Login Error:", error);
    throw error as AuthError;
  }
};

export const firebaseLogout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    throw error as AuthError;
  }
};

// Get current user (can be null if not logged in)
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
