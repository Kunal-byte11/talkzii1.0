
"use client";

import { HeroSection } from '@/components/talkzi/HeroSection';
import { ConversationPreviewCarousel } from '@/components/talkzi/ConversationPreview';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/talkzi/Logo';
import { Github, Twitter } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" passHref>
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push('/aipersona')} className="gradient-button">Start Chatting</Button>
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
            {/* Placeholder social links */}
            <Link href="#" target="_blank" rel="noopener noreferrer"><Github className="h-6 w-6 hover:text-primary transition-colors" /></Link>
            <Link href="#" target="_blank" rel="noopener noreferrer"><Twitter className="h-6 w-6 hover:text-primary transition-colors" /></Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Talkzi. All rights reserved. Made with ❤️ for Gen Z.</p>
        </div>
      </footer>
    </div>
  );
}
