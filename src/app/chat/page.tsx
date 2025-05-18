
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Cog, LogOut } from 'lucide-react';

export default function ChatPage() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login'); // Redirect to login page if not logged in
    }
  }, [isLoggedIn, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || (!isLoading && !isLoggedIn)) { // Check both isLoading and !isLoggedIn after isLoading is false
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && !isLoggedIn && ( // This condition ensures we only show login prompt after loading
          <>
            <p className="text-destructive text-center mb-4">Please log in to access the chat.</p>
            <Button onClick={() => router.push('/login')} className="gradient-button">
              Go to Login
            </Button>
          </>
        )}
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
             {isLoggedIn && (
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
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
