
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
  const [isAuthLoadingInternal, setIsAuthLoadingInternal] = React.useState(true); // Internal state for session check
  const [isProfileLoadingInternal, setIsProfileLoadingInternal] = React.useState(true); // Internal state for profile fetch

  const router = useRouter();
  const pathname = usePathname();

  // Effect for initial data load and auth state listener
  useEffect(() => {
    const getInitialData = async () => {
      setIsAuthLoadingInternal(true);
      setIsProfileLoadingInternal(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError.message);
          if (sessionError.message.includes("Invalid Refresh Token") || sessionError.message.includes("Refresh Token Not Found") || sessionError.message.includes("invalid_grant")) {
            console.warn("Invalid token detected during initial session fetch, attempting to sign out to clear state.");
            await supabase.auth.signOut();
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
            if (profileFetchError && profileFetchError.code !== 'PGRST116') {
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
        setIsAuthLoadingInternal(false);
        setIsProfileLoadingInternal(false);
      }
    };

    getInitialData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, sessionState: Session | null) => {
        console.log("Auth State Change Event:", event, sessionState);
        setIsAuthLoadingInternal(true);
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
              localStorage.removeItem(`talkzii_chat_memory_${oldUserId}`);
              localStorage.removeItem(`talkzii_memory_warning_shown_${oldUserId}`);
            } catch (e) {
              console.error("Error clearing user-specific localStorage on sign out", e);
            }
          }
          setProfile(null);
          setIsProfileLoadingInternal(false);
          setIsAuthLoadingInternal(false);
          return;
        }
        
        if (newCurrentUser) {
          setIsProfileLoadingInternal(true);
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newCurrentUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { 
            console.error('Error fetching profile on auth change:', profileError);
          }
          setProfile(userProfile as UserProfile | null);
          setIsProfileLoadingInternal(false);
        } else { 
          setProfile(null);
          setIsProfileLoadingInternal(false); 
        }
        setIsAuthLoadingInternal(false); 
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Effect for handling navigation based on auth state
  useEffect(() => {
    // Wait only for the core authentication check to complete before attempting navigation.
    // Profile loading will be handled by the destination pages.
    if (isAuthLoadingInternal) {
      return; 
    }

    const isOnAuthPage = pathname === '/auth';

    if (session) { // User is logged in
      if (isOnAuthPage) {
        router.push('/aipersona');
      }
    } else { // User is NOT logged in (guest)
      // Guest logic (if any specific redirections are needed for guests on protected routes)
      // Currently, guests are allowed on most pages, and pages manage their own content restrictions.
    }
  }, [session, pathname, router, isAuthLoadingInternal]); // Removed isProfileLoadingInternal from dependencies

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
    }
    // onAuthStateChange will handle setting user/session/profile to null and UI updates
  };

  const isLoading = isAuthLoadingInternal || (user ? isProfileLoadingInternal : false);

  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    signOut,
  }), [user, session, profile, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Check your component tree and ensure AuthProvider is an ancestor, especially in layout.tsx or equivalent files. If this error persists after confirming the provider setup, try deleting your .next folder and restarting the dev server to clear potential caching issues.');
  }
  return context;
};

