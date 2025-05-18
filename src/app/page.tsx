
"use client";

import { HeroSection } from '@/components/talkzi/HeroSection';
import { ConversationPreviewCarousel } from '@/components/talkzi/ConversationPreview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/talkzi/Logo';
import { Github, LogOut, LogIn, UserCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use the new Supabase auth
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // AuthProvider will handle redirect to /login
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" passHref>
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Button variant="ghost" disabled>Loading...</Button>
            ) : user ? (
              <>
                <Button onClick={() => router.push('/chat')} variant="outline" className="hidden sm:flex">
                  <MessageSquare className="mr-2 h-4 w-4"/> Go to Chat
                </Button>
                <Button onClick={handleSignOut} variant="ghost">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push('/login')} variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
                <Button onClick={() => router.push('/signup')} className="gradient-button">
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <HeroSection />
        <ConversationPreviewCarousel />
      </main>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="https://github.com/firebase/firebase-studio" target="_blank" rel="noopener noreferrer"><Github className="h-6 w-6 hover:text-primary transition-colors" /></Link>
            {/* <Link href="#" target="_blank" rel="noopener noreferrer"><Twitter className="h-6 w-6 hover:text-primary transition-colors" /></Link> */}
          </div>
          <p>&copy; {new Date().getFullYear()} Talkzi. All rights reserved. Made with ❤️ for Gen Z.</p>
        </div>
      </footer>
    </div>
  );
}
