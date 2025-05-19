
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
      setIsProfileLoading(true); // Start profile loading assuming we might find a user

      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError.message);
          // If there's any error fetching the session (e.g., invalid token), treat as logged out.
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAuthLoading(false);
          setIsProfileLoading(false); // No user, so profile loading is done.
          return; // Exit early
        }

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        setIsAuthLoading(false); // Initial auth check done

        if (currentUser) {
          const { data: userProfile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116: no rows found
            console.error('Initial profile fetch error:', profileFetchError);
          }
          setProfile(userProfile as UserProfile | null);
        } else {
          setProfile(null);
        }
        setIsProfileLoading(false); // Initial profile check done (or not needed)
      } catch (e: unknown) {
        const error = e as Error;
        console.error("Critical error during initial data fetch (AuthProvider):", error.message, e);
        // If a critical error occurs, ensure user is in a logged-out state within the app
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
        setIsAuthLoading(true); // Mark as loading since auth state is changing
        setSession(sessionState);
        const newCurrentUser = sessionState?.user ?? null;
        setUser(newCurrentUser);

        const signingOutUserId = user?.id; // Capture previous user's ID for localStorage cleanup

        if (event === 'SIGNED_OUT' && signingOutUserId) {
          try {
            localStorage.removeItem(`talkzi_chat_history_${signingOutUserId}`);
            localStorage.removeItem(`talkzi_ai_friend_type_${signingOutUserId}`);
          } catch (e) {
            console.error("Error clearing user-specific localStorage on sign out", e);
          }
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
          setIsProfileLoading(false); // No user, so profile loading "done"
        }
        setIsAuthLoading(false); // Auth state change and any profile fetching processed
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array: runs once on mount

  useEffect(() => {
    if (isAuthLoading) {
      return; // Don't attempt redirects while initial auth state is still being determined
    }

    const isAuthPage = pathname === '/auth';
    const protectedPages = ['/chat', '/aipersona'];
    const isProtectedPage = protectedPages.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (session) { // User is logged in
      if (isAuthPage) {
        router.push('/aipersona');
      }
    } else { // User is not logged in
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
