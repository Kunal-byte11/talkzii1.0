
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
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getInitialData = async () => {
      setIsAuthLoading(true);
      setIsProfileLoading(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError.message, sessionError);
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
        setIsAuthLoading(false);
        setIsProfileLoading(false);
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
          console.log('User signed out. Clearing profile and setting loading to false.');
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
          setIsAuthLoading(false); // Ensure auth loading is false on sign out
          return;
        }
        
        if (newCurrentUser) {
          setIsProfileLoading(true);
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newCurrentUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows found (no profile yet)
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
  }, []); // Empty dependency array: runs once on mount

  useEffect(() => {
    // Wait for both auth and profile loading to complete before making redirect decisions
    if (isAuthLoading || (session && isProfileLoading)) {
      return; 
    }

    const authPages = ['/auth']; // Login and Signup are now tabs on /auth
    const currentIsAuthPage = authPages.includes(pathname);

    // /aipersona is protected. /chat allows guests.
    const protectedPagesRequiringLogin = ['/aipersona']; 
    const isStrictlyProtectedPage = protectedPagesRequiringLogin.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (session) { // User is logged in (and profile should be resolved or null)
      if (currentIsAuthPage) {
        router.push('/aipersona'); // Send logged-in users away from auth pages to persona selection
      }
    } else { // User is not logged in (session is null)
      if (isStrictlyProtectedPage) { // If on a page that *always* requires login (like /aipersona)
        router.push('/auth'); 
      }
      // Guests are allowed on /chat, so no redirect from there if !session
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
    isLoading: isAuthLoading || (user ? isProfileLoading : false), // Profile is only loading if there's a user
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
    throw new Error('useAuth must be used within an AuthProvider. Check component tree and ensure AuthProvider is an ancestor, especially in layout files.');
  }
  return context;
};
