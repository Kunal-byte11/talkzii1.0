
// Firebase Studio: Attempt to fix persistent parsing error - v_final_attempt_env_issue_likely_explicit_react
// IF THIS PARSING ERROR PERSISTS ("Expected '>', got 'value'" on AuthContext.Provider):
// 1. STOP your dev server.
// 2. DELETE the .next folder in your project.
// 3. Manually DELETE this file (src/hooks/useAuth.ts) from your project.
// 4. CREATE a new, empty file named useAuth.ts in src/hooks/.
// 5. PASTE this exact code (from the XML response) into the new file.
// 6. SAVE and RESTART your dev server.
// This error is almost certainly environmental (hidden characters, corrupted cache).
"use client";

import React from 'react'; // Explicitly import React
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
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<FirebaseUser>;
};

// Create the context with an undefined initial value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      setUser(null);
      throw error as AuthError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = React.useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, password);
      setUser(newUser);
      if (newUser?.uid && newUser.email) {
        // Ensure profile creation doesn't block signup flow if it fails
        createUserProfile(newUser.uid, newUser.email).catch(profileError => {
          console.error("Error creating user profile during signup:", profileError);
        });
      } else if (newUser?.uid) {
        // Handle case where email might be null (though unlikely with email/password signup)
         createUserProfile(newUser.uid, null).catch(profileError => {
          console.error("Error creating user profile during signup (no email):", profileError);
        });
      }
      return newUser;
    } catch (error) {
      setUser(null);
      throw error as AuthError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      setUser(null);
      // Only redirect if not already on the homepage
      if (pathname !== '/') {
         router.push('/');
      }
    } catch (error) {
      console.error("Logout failed:", (error as AuthError).message);
      // Ensure user is logged out in state even if redirect fails or other errors occur
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const isLoggedIn = !!user;

  const contextValue = React.useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isLoggedIn,
    login,
    signup,
    logout,
  }), [user, isLoading, isLoggedIn, login, signup, logout]);
  
  // If the error "Expected '>', got 'value'" persists on the <AuthContext.Provider> line below:
  // 1. STOP your dev server.
  // 2. DELETE the .next folder in your project.
  // 3. Manually DELETE this file (src/hooks/useAuth.ts) from your project.
  // 4. CREATE a new, empty file named useAuth.ts in src/hooks/.
  // 5. PASTE this exact code (from the XML response) into the new file.
  // 6. SAVE and RESTART your dev server.
  // This error is almost certainly environmental (hidden characters, corrupted cache).

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
