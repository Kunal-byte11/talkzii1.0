
"use client";

import React, { useEffect, useState, useMemo, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types/talkzi';

// IMPORTANT: If you see "useAuth must be used within an AuthProvider"
// AND you've confirmed AuthProvider wraps your layout:
// 1. Delete your .next folder
// 2. Restart your dev server.
// This often resolves stubborn parsing/caching issues.

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
          // If the error is related to invalid tokens, try to sign out to clear Supabase's local state
          if (sessionError.message.includes("Invalid Refresh Token") || sessionError.message.includes("Refresh Token Not Found") || sessionError.message.includes("invalid_grant")) {
            console.warn("Invalid token detected during initial session fetch, attempting to sign out to clear state.");
            await supabase.auth.signOut(); // This will trigger onAuthStateChange with SIGNED_OUT
            // onAuthStateChange will handle setting user/session to null and loading states.
            // Setting states here as well for immediate effect on this initial load path.
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAuthLoading(false);
            setIsProfileLoading(false);
            return;
          }
          // For other session errors, just treat as logged out.
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAuthLoading(false);
          setIsProfileLoading(false);
          return;
        }

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        setIsAuthLoading(false); 

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
        setIsProfileLoading(false);
      } catch (e: unknown) {
        const error = e as Error;
        console.error("Critical error during initial data fetch (AuthProvider):", error.message, e);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAuthLoading(false);
        setIsProfileLoading(false);
      }
    };

    getInitialData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, sessionState: Session | null) => {
        setIsAuthLoading(true); 
        setSession(sessionState);
        const newCurrentUser = sessionState?.user ?? null;
        const oldUser = user; 
        setUser(newCurrentUser);

        if (event === 'SIGNED_OUT') {
          console.log('User signed out. Clearing profile and setting loading to false.');
          if (oldUser?.id) { 
            try {
              localStorage.removeItem(`talkzi_chat_history_${oldUser.id}`);
              localStorage.removeItem(`talkzi_ai_friend_type_${oldUser.id}`);
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
  }, []); 

  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }

    const isAuthPage = pathname === '/auth';
    // Consider /login and /signup as auth pages if they exist as separate routes
    const allAuthPages = ['/auth', '/login', '/signup'];
    const currentIsAuthPage = allAuthPages.includes(pathname);

    const protectedPages = ['/chat', '/aipersona'];
    const isProtectedPage = protectedPages.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (session) { 
      if (currentIsAuthPage) {
        router.push('/aipersona');
      }
    } else { 
      if (isProtectedPage) {
        router.push('/auth');
      }
    }
  }, [session, pathname, router, isAuthLoading]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
    }
    // onAuthStateChange will handle setting user/session/profile to null
    // and clearing relevant user-specific localStorage items.
  };

  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading: isAuthLoading || isProfileLoading,
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
    throw new Error('useAuth must be used within an AuthProvider. Check component tree and ensure AuthProvider is an ancestor.');
  }
  return context;
};
