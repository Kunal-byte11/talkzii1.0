
"use client";

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Cog, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import { AuthRequiredMessage } from '@/components/talkzi/AuthRequiredMessage';

export default function ChatPage() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client for ChatInterface (potential localStorage access, etc.)
    setIsClientReady(true);
  }, []);

  if (isAuthLoading || !isClientReady) {
    return <LoadingSpinner message="Preparing chat..." />;
  }

  if (!user) {
    // Auth is resolved, client is ready, but no user. AuthProvider should redirect them.
    // This message is a fallback or shown briefly during redirection.
    return <AuthRequiredMessage message="You need to be logged in to chat." actionButtonText="Go to Login" actionButtonPath="/auth" />;
  }

  // User is present, auth is resolved, and client is ready.
  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <Link href="/" passHref>
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" asChild title="Change AI Persona">
              <Link href="/aipersona">
                <Cog className="h-5 w-5" />
                <span className="sr-only">Change AI Persona</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Home">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        {/* ChatInterface will handle its own internal loading for chat history */}
        <ChatInterface />
      </main>
    </div>
  );
}
