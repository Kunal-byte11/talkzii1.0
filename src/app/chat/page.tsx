
"use client";

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Cog, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isClientReady, setIsClientReady] = useState(false);


  useEffect(() => {
    // Ensure this runs only on the client for potential localStorage access in ChatInterface
    setIsClientReady(true);
    // AuthProvider handles redirection if user is not authenticated and this page is protected.
    // No explicit router.push('/auth') here.
  }, []); // Empty dependency array: runs once on mount on client.

  if (isAuthLoading || !isClientReady) {
    // Show loading if auth is still resolving or client hasn't marked itself ready
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }
  
  if (!user) { 
     // This state should ideally be brief as AuthProvider should redirect.
     // If AuthProvider hasn't redirected yet, show a "please login" message.
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4" />
        <p className="text-muted-foreground mb-4">Please log in to chat.</p>
        <Button onClick={() => router.push('/auth')}>Go to Login</Button>
      </div>
    );
  }


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
        <ChatInterface />
      </main>
    </div>
  );
}

    