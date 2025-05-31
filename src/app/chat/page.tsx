
"use client";

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Cog, LogOut, LogIn } from 'lucide-react'; // Added LogIn
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import { AuthRequiredMessage } from '@/components/talkzi/AuthRequiredMessage';
import { useRouter } from 'next/navigation'; // For redirecting to /auth

export default function ChatPage() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [isClientReady, setIsClientReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // If auth is still loading OR client is not ready, show loading spinner
  if (isAuthLoading || !isClientReady) {
    return <LoadingSpinner message="Preparing chat..." />;
  }

  // No AuthRequiredMessage here anymore, ChatInterface will handle guest state UI

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <Link href="/" passHref>
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {user && ( // Only show Cog and Logout if user is logged in
              <>
                <Button variant="ghost" size="icon" asChild title="Change AI Persona">
                  <Link href="/aipersona">
                    <Cog className="h-5 w-5" />
                    <span className="sr-only">Change AI Persona</span>
                  </Link>
                </Button>
                 <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
            {!user && ( // Show Login/Sign Up if user is not logged in
              <Button variant="outline" onClick={() => router.push('/auth')} title="Login / Sign Up">
                <LogIn className="h-5 w-5 mr-2 sm:mr-0" />
                <span className="hidden sm:inline ml-1">Login / Sign Up</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild title="Home">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
