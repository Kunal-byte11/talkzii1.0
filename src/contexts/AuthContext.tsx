
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, sessionState: Session | null) => {
        setSession(sessionState);
        setUser(sessionState?.user ?? null);
        setIsLoading(false);

        const isAuthPage = pathname === '/login' || pathname === '/signup';

        if (event === 'SIGNED_IN' && isAuthPage) {
          router.push('/aipersona');
        }
        if (event === 'SIGNED_OUT' && (pathname === '/chat' || pathname === '/aipersona')) {
          router.push('/login');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting user/session to null and redirecting
    setIsLoading(false);
  };

  const contextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    signOut,
  }), [user, session, isLoading]);

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
