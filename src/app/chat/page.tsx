
"use client";

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon, Cog, LogOut, LogIn } from 'lucide-react'; // Changed Home to MenuIcon
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [isClientReady, setIsClientReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  if (isAuthLoading || !isClientReady) {
    return <LoadingSpinner message="Preparing chat..." />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <div className="flex items-center w-12"> {/* Left icon container */}
            <Button variant="ghost" size="icon" title="Menu" className="text-foreground">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
          
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">
            Talkzii
          </h2>

          <div className="flex items-center space-x-1 sm:space-x-2 w-auto justify-end">
            {user && (
              <>
                <Button variant="ghost" size="icon" asChild title="Change AI Persona" className="text-foreground">
                  <Link href="/aipersona">
                    <Cog className="h-5 w-5" />
                    <span className="sr-only">Change AI Persona</span>
                  </Link>
                </Button>
                 <Button variant="ghost" size="icon" onClick={signOut} title="Logout" className="text-foreground">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
            {!user && (
              <Button variant="outline" onClick={() => router.push('/auth')} title="Login / Sign Up">
                <LogIn className="h-5 w-5 mr-2 sm:mr-0" />
                <span className="hidden sm:inline ml-1">Login / Sign Up</span>
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
