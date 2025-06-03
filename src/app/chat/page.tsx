
"use client";

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/talkzi/ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon, Cog, LogOut, LogIn, Home, Users, MessageSquareHeart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/talkzi/Logo';
import { ComingSoonBanner } from '@/components/talkzi/ComingSoonBanner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <div className="flex items-center w-12">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title="Menu" className="text-foreground">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 pt-6 flex flex-col">
                <SheetHeader className="px-6 pb-4">
                  <SheetTitle className="text-left">
                    <Logo width={100} height={34} />
                  </SheetTitle>
                </SheetHeader>
                <Separator />
                <nav className="flex-grow p-4 space-y-2">
                  <SheetClose asChild>
                    <Link href="/" passHref>
                      <Button variant="ghost" className="w-full justify-start text-base py-3">
                        <Home className="mr-3 h-5 w-5" />
                        Home
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/aipersona" passHref>
                      <Button variant="ghost" className="w-full justify-start text-base py-3">
                        <MessageSquareHeart className="mr-3 h-5 w-5" />
                        Change AI Persona
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                     <Link href="/explore" passHref>
                      <Button variant="ghost" className="w-full justify-start text-base py-3">
                        <Users className="mr-3 h-5 w-5" />
                        Explore Personas
                      </Button>
                    </Link>
                  </SheetClose>
                </nav>
                <Separator />
                <div className="p-4 mt-auto">
                  {user ? (
                    <SheetClose asChild>
                      <Button variant="outline" onClick={signOut} className="w-full text-base py-3">
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/auth" passHref>
                        <Button variant="default" className="w-full text-base py-3 gradient-button">
                          <LogIn className="mr-3 h-5 w-5" />
                          Login / Sign Up
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
                <div className="px-6 py-3 text-center text-xs text-muted-foreground">
                   © {new Date().getFullYear()} Talkzii
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex-1 text-center">
            <Link href="/" passHref aria-label="Talkzii Home">
              <Logo width={90} height={30} />
            </Link>
          </div>

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
      <ComingSoonBanner />
      <main className="flex-grow overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
