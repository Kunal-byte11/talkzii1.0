
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types/talkzi'; // Assuming UserProfile might be extended

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null; // Added profile state
  isLoading: boolean;
  isLoadingProfile: boolean; // Added for profile loading
  signOut: () => Promise<void>;
  // Login and signup are handled on the /auth page directly using supabase client
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
        setIsLoading(false);

        if (currentUser) {
          // Fetch profile when user is available
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, which is fine if profile not created yet
            console.error('Error fetching profile:', error);
          }
          setProfile(userProfile as UserProfile | null);
        } else {
          setProfile(null); // Clear profile if no user
        }
        setIsLoadingProfile(false);

        const isAuthPage = pathname === '/auth';
        const isProtectedPage = pathname === '/chat' || pathname === '/aipersona';

        if (event === 'SIGNED_IN') {
          if (isAuthPage) {
            router.push('/aipersona'); // Or wherever you want to redirect after login
          }
        } else if (event === 'SIGNED_OUT') {
          if (isProtectedPage) {
            router.push('/auth');
          }
        }
      }
    );

    // Initial session and profile check
    const getInitialSession = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setIsLoading(false);

        if (currentUser) {
            const { data: userProfile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
            if (error && error.code !== 'PGRST116') {
                console.error('Initial profile fetch error:', error);
            }
            setProfile(userProfile as UserProfile | null);
        } else {
            setProfile(null);
        }
        setIsLoadingProfile(false);
    };
    getInitialSession();


    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange will handle setting user/session/profile to null and redirecting
    // No need to manually set isLoading to false here, onAuthStateChange will do it.
  };

  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading: isLoading || isLoadingProfile, // Combined loading state
    isLoadingProfile,
    signOut,
  }), [user, session, profile, isLoading, isLoadingProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
