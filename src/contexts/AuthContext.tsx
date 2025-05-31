
"use client";

// IMPORTANT: If you see "useAuth must be used within an AuthProvider"
// AND you've confirmed AuthProvider wraps your layout:
// 1. Delete your .next folder
// 2. Restart your dev server.
// This often resolves stubborn parsing/caching issues.

import React, { useEffect, useState, useMemo, type ReactNode, useContext } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types/talkzi';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean; // True if either auth state or profile is still loading
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true); // Separate loading for profile

  const router = useRouter();
  const pathname = usePathname();

  // Effect for initial data load and auth state listener
  useEffect(() => {
    const getInitialData = async () => {
      setIsAuthLoading(true);
      setIsProfileLoading(true); // Assume profile needs loading if session might exist
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError.message);
          if (sessionError.message.includes("Invalid Refresh Token") || sessionError.message.includes("Refresh Token Not Found") || sessionError.message.includes("invalid_grant")) {
            console.warn("Invalid token detected during initial session fetch, attempting to sign out to clear state.");
            await supabase.auth.signOut(); // Attempt to clear bad token
          }
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          setSession(initialSession);
          const currentUser = initialSession?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            const { data: userProfile, error: profileFetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116: 0 rows found
              console.error('Initial profile fetch error:', profileFetchError);
            }
            setProfile(userProfile as UserProfile | null);
          } else {
            setProfile(null);
          }
        }
      } catch (e: unknown) {
        const error = e as Error;
        console.error("Critical error during initial data fetch (AuthProvider):", error.message, e);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsAuthLoading(false);
        setIsProfileLoading(false); // Profile loading is done, whether successful or not
      }
    };

    getInitialData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, sessionState: Session | null) => {
        console.log("Auth State Change Event:", event, sessionState);
        setIsAuthLoading(true); 
        setSession(sessionState);
        const newCurrentUser = sessionState?.user ?? null;
        const oldUserId = user?.id;
        setUser(newCurrentUser);

        if (event === 'SIGNED_OUT') {
          console.log('User signed out. Clearing profile.');
          if (oldUserId) {
            try {
              localStorage.removeItem(`talkzi_chat_history_${oldUserId}`);
              localStorage.removeItem(`talkzi_ai_friend_type_${oldUserId}`);
            } catch (e) {
              console.error("Error clearing user-specific localStorage on sign out", e);
            }
          }
          setProfile(null);
          setIsProfileLoading(false); 
          setIsAuthLoading(false);
          return; 
        }
        
        if (newCurrentUser) {
          setIsProfileLoading(true);
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newCurrentUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { 
            console.error('Error fetching profile on auth change:', profileError);
          }
          setProfile(userProfile as UserProfile | null);
          setIsProfileLoading(false);
        } else { 
          setProfile(null);
          setIsProfileLoading(false); 
        }
        setIsAuthLoading(false); 
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Effect for handling navigation based on auth state
  useEffect(() => {
    // Wait for initial auth check and profile loading (if session exists) to complete.
    if (isAuthLoading || (session && isProfileLoading)) {
      return; 
    }

    const isOnAuthPage = pathname === '/auth';

    if (session) { // User is logged in
      if (isOnAuthPage) {
        // If logged in and on auth page, redirect to aipersona.
        router.push('/aipersona');
      }
      // If logged in and on other pages (like /chat, /aipersona, /), no automatic redirect needed from here.
    } else { // User is NOT logged in (guest)
      // Guests are allowed on /chat, /aipersona and the homepage (/) without redirection.
      // The /aipersona page itself will handle guest limitations.
    }
  }, [session, pathname, router, isAuthLoading, isProfileLoading]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
    }
    // onAuthStateChange will handle setting user/session/profile to null and UI updates
  };

  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading: isAuthLoading || (user ? isProfileLoading : false), // Overall loading state
    signOut,
  }), [user, session, profile, isAuthLoading, isProfileLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    // This error message provides guidance for a common setup issue.
    throw new Error('useAuth must be used within an AuthProvider. Check your component tree and ensure AuthProvider is an ancestor, especially in layout.tsx or equivalent files. If this error persists after confirming the provider setup, try deleting your .next folder and restarting the dev server to clear potential caching issues.');
  }
  return context;
};
