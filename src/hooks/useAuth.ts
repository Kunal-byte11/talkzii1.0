
"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  firebaseLogin,
  firebaseLogout,
  firebaseSignUp,
  type User, // Firebase User type
  type AuthError
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await firebaseLogin(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setUser(null);
      // Re-throw the error so it can be caught by the caller (e.g., in LoginPage)
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, password);
      // Ensure email is passed correctly; User type has email as string | null
      await createUserProfile(newUser.uid, newUser.email);
      setUser(newUser);
      return newUser;
    } catch (error) {
      setUser(null);
      // Re-throw the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      setUser(null);
      // Redirect to home page after logout, only if not already on home page
      if (pathname !== '/') {
         router.push('/');
      }
    } catch (error) {
      // It's good practice to let the user know if logout failed,
      // but for now, console.error is fine.
      console.error("Logout failed:", (error as AuthError).message);
      // Optionally, re-throw or set an error state to display in UI
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const isLoggedIn = !!user;

  // Explicitly define the context value object
  const contextValue: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
