
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Cog, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use new Supabase Auth

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login'); // Redirect if not logged in
      } else {
        setIsPageLoading(false); // User is logged in, proceed to load chat
      }
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    // AuthProvider will handle redirect to /login
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading chat...</p>
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
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
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
