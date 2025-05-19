
"use client";

import React, { useEffect, useState, useMemo, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types/talkzi';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    setIsLoadingProfile(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, sessionState: Session | null) => {
        setSession(sessionState);
        const currentUser = sessionState?.user ?? null;
        setUser(currentUser);
        setIsLoading(false); // Auth loading done

        if (currentUser) {
          setIsLoadingProfile(true); // Start profile loading
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, which is fine if profile not created yet
            console.error('Error fetching profile on auth change:', error);
          }
          setProfile(userProfile as UserProfile | null);
          setIsLoadingProfile(false); // Profile loading done
        } else {
          setProfile(null);
          setIsLoadingProfile(false); // No user, so profile loading "done"
        }

        const isAuthPage = pathname === '/auth';
        // Pages requiring auth to access
        const protectedPages = ['/chat', '/aipersona'];
        const isProtectedPage = protectedPages.some(p => pathname === p || pathname.startsWith(p + '/'));


        if (event === 'SIGNED_IN') {
          if (isAuthPage) {
            router.push('/aipersona');
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user-specific localStorage on sign out
          if (currentUser?.id) {
            try {
              localStorage.removeItem(`talkzi_chat_history_${currentUser.id}`);
              localStorage.removeItem(`talkzi_ai_friend_type_${currentUser.id}`);
            } catch (e) {
              console.error("Error clearing user-specific localStorage on sign out", e);
            }
          }
          if (isProtectedPage) {
            router.push('/auth');
          }
        }
      }
    );
    
    // Check initial session state
    const getInitialSession = async () => {
        setIsLoading(true);
        setIsLoadingProfile(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setIsLoading(false); // Auth loading done

        if (currentUser) {
            const { data: userProfile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
            if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
                console.error('Initial profile fetch error:', error);
            }
            setProfile(userProfile as UserProfile | null);
        } else {
            setProfile(null);
        }
        setIsLoadingProfile(false); // Profile loading done
    };
    getInitialSession();


    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]); // router and pathname are dependencies

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
    }
    // onAuthStateChange will handle setting user/session/profile to null and redirecting
  };

  const contextValue = React.useMemo(() => ({
    user,
    session,
    profile,
    isLoading: isLoading || isLoadingProfile, // Combined loading state for simplicity for consumers
    isLoadingProfile, // Consumers can use this if they need to distinguish
    signOut,
  }), [user, session, profile, isLoading, isLoadingProfile]);

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
