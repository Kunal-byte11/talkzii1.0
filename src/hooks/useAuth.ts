
"use client";

import React, { type ReactNode } from 'react'; // Explicit React import
import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  firebaseLogin,
  firebaseLogout,
  firebaseSignUp,
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';

// Define the shape of the context data
type AuthContextType = {
  user: FirebaseUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  signup: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
};

// Create the context with an undefined initial value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = React.useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
    setIsLoading(true);
    try {
      const loggedInUser = await firebaseLogin(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setUser(null); // Ensure user state is cleared on error
      throw error as AuthError; // Re-throw to be caught by UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = React.useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, password);
      setUser(newUser);
      // Create a user profile in Firestore, but don't let this block signup success
      if (newUser?.uid) {
        createUserProfile(newUser.uid, newUser.email ?? null).catch(profileError => {
          // Log profile creation error, but don't fail the signup for it
          console.error("Error creating user profile during signup:", profileError);
        });
      }
      return newUser;
    } catch (error) {
      setUser(null); // Ensure user state is cleared on error
      throw error as AuthError; // Re-throw to be caught by UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      setUser(null);
      // Redirect to home page after logout if not already there
      if (pathname !== '/') {
         router.push('/');
      }
    } catch (error) {
      // Log logout error, UI might want to show a message
      console.error("Logout failed:", (error as AuthError).message);
      // Optionally clear user state here too, though firebaseLogout should trigger onAuthStateChanged
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const isLoggedIn = !!user;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isLoggedIn,
    isLoading,
    login,
    signup,
    logout,
  }), [user, isLoggedIn, isLoading, login, signup, logout]);

  // Added console.log for debugging this persistent parsing issue.
  // If this log appears, the issue is definitely in the JSX parsing of the return statement.
  console.log("AuthProvider rendering. User:", user, "isLoading:", isLoading);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
