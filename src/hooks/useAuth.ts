// Firebase Studio: Attempt to fix persistent parsing error - v_final_attempt_env_issue_likely
"use client";

import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
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
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
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

  const signup = useCallback(async (email: string, password: string): Promise<FirebaseUser> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, password);
      setUser(newUser);
      if (newUser?.uid) {
        // Ensure profile creation doesn't block signup flow if it fails
        createUserProfile(newUser.uid, newUser.email ?? null).catch(profileError => {
          console.error("Error creating user profile during signup:", profileError);
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

  const logout = useCallback(async () => {
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

  const contextValue = useMemo(() => {
    return {
      user,
      isLoading,
      isLoggedIn,
      login,
      signup,
      logout,
    };
  }, [user, isLoading, isLoggedIn, login, signup, logout]);
  
  // If the error persists, the issue is almost certainly environmental.
  // Please clean the .next cache and manually recreate this file.
  // console.log("AuthProvider rendering. User:", user, "isLoading:", isLoading);

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
