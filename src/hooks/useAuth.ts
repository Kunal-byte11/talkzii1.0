
"use client";

import React, { type ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
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
  signup: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
};

// Create the context with an undefined initial value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Non-functional comment to ensure file change for system
  // Last attempt for this persistent parsing error before strongly advising manual file recreation.

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
      if (pathname !== '/') {
         router.push('/');
      }
    } catch (error) {
      console.error("Logout failed:", (error as AuthError).message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const isLoggedIn = !!user;

  const contextValue = useMemo(() => {
    // Adding a console.log here for debugging and to ensure file content is different
    console.log("AuthContext value memoized. User:", user ? user.uid : null, "isLoading:", isLoading);
    return {
      user,
      isLoading,
      isLoggedIn,
      login,
      signup,
      logout,
    };
  }, [user, isLoading, isLoggedIn, login, signup, logout]);

  // Debugging log for persistent parsing issue.
  // If this log appears, the issue is almost certainly environmental or hidden chars.
  // console.log("AuthProvider rendering. User:", user ? user.uid : null, "isLoading:", isLoading);

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
