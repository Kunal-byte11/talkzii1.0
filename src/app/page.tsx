
"use client";

import { HeroSection } from '@/components/talkzi/HeroSection';
import { ConversationPreviewCarousel } from '@/components/talkzi/ConversationPreview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/talkzi/Logo';
import { Github, MessageSquare, LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function HomePage() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth(); // Use the auth context

  const handleStartChatting = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth'); // Redirect to new auth page
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" passHref>
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center space-x-2">
            <Button onClick={handleStartChatting} className="gradient-button">
              <MessageSquare className="mr-2 h-4 w-4"/> Start Chatting
            </Button>
            {!isLoading && (
              user ? (
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.push('/auth')}>
                  <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
                </Button>
              )
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
          </div>
          <p>&copy; {new Date().getFullYear()} Talkzii. All rights reserved. Made with ❤️ for Gen Z.</p>
        </div>
      </footer>
    </div>
  );
}

