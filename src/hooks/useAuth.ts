
"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  firebaseLogin,
  firebaseLogout,
  firebaseSignUp,
  type User,
  type AuthError
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';

// Define the shape of the context value
type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

// Create the context with an undefined initial value
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
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await firebaseLogin(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setUser(null); // Clear user on login failure
      throw error as AuthError; // Re-throw for the component to handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, password);
      // Ensure email is passed correctly; User type has email as string | null
      // Create user profile in Firestore, but don't block on it
      createUserProfile(newUser.uid, newUser.email ?? null).catch(profileError => {
        console.error("Error creating user profile during signup:", profileError);
        // Decide if this error should be surfaced to the user or just logged
      });
      setUser(newUser);
      return newUser;
    } catch (error) {
      setUser(null); // Clear user on signup failure
      throw error as AuthError; // Re-throw for the component to handle
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
      console.error("Logout failed:", (error as AuthError).message);
      // Optionally, set an error state or show a toast to the user
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const isLoggedIn = !!user;

  // Explicitly define the context value object with the correct type
  const contextValue: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    signup,
    logout,
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
