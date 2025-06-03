
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { LogOut, User as UserIcon, Home, LogIn, MessageSquareHeart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { personaOptions } from '@/lib/personaOptions';
import { ComingSoonBanner } from '@/components/talkzi/ComingSoonBanner';

const getAIFriendTypeKey = (userId?: string) => userId ? `talkzii_ai_friend_type_${userId}` : 'talkzii_ai_friend_type_guest';
const getChatHistoryKey = (userId?: string) => userId ? `talkzii_chat_history_${userId}` : 'talkzii_chat_history_guest';

export default function ExplorePage() {
  const router = useRouter();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const handlePersonaChat = (personaValue: string) => {
    if (!isClientReady) return;

    if (!user) { 
      if (personaValue === 'default') {
        try {
          localStorage.removeItem(getAIFriendTypeKey(undefined));
          localStorage.removeItem(getChatHistoryKey(undefined));
          toast({
            title: "Chatting with Talkzii",
            description: "You're continuing as a guest with the default AI.",
          });
        } catch (error) {
          console.error("Error clearing guest localStorage for default persona", error);
        }
        router.push('/chat');
      } else {
        const personaLabel = personaOptions.find(p => p.value === personaValue)?.label || "this persona";
        toast({
          title: "Login to Chat",
          description: `Please log in to chat with ${personaLabel}. Guests can only chat with Talkzii (default).`,
        });
      }
      return;
    }

    try {
      const AI_FRIEND_TYPE_KEY_USER = getAIFriendTypeKey(user.id);
      const CHAT_HISTORY_KEY_USER = getChatHistoryKey(user.id);
      const previousSavedPersona = localStorage.getItem(AI_FRIEND_TYPE_KEY_USER) || 'default';

      if (previousSavedPersona !== personaValue) {
        localStorage.removeItem(CHAT_HISTORY_KEY_USER);
        toast({
          title: "Persona Changed",
          description: `Chat history cleared for ${personaOptions.find(p => p.value === personaValue)?.label || 'the new persona'}.`,
        });
      }

      if (personaValue === 'default') {
        localStorage.removeItem(AI_FRIEND_TYPE_KEY_USER);
      } else {
        localStorage.setItem(AI_FRIEND_TYPE_KEY_USER, personaValue);
      }
    } catch (error) {
      console.error("Error during persona selection/localStorage operations for user", error);
      toast({
        title: "Error",
        description: "Could not save your persona preference or clear chat history.",
        variant: "destructive"
      });
      return;
    }
    router.push('/chat');
  };

  if (isAuthLoading || !isClientReady) {
    return <LoadingSpinner message={isAuthLoading ? "Verifying authentication..." : "Preparing explore page..."} />;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background justify-between">
      <div>
        <header className="flex items-center bg-background p-4 pb-2 justify-between border-b border-border">
          <Link href="/" passHref>
            <Logo width={100} height={34} />
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild title="Home Page">
              <Link href="/">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Select AI Persona" className="text-muted-foreground">
              <Link href="/aipersona">
                <MessageSquareHeart className="h-5 w-5" />
                <span className="sr-only">Select AI Persona</span>
              </Link>
            </Button>
            {user ? (
              <Button
                variant="link"
                onClick={signOut}
                className="text-muted-foreground text-base font-bold leading-normal tracking-[0.015em] shrink-0 p-0 h-auto hover:no-underline hover:text-primary"
                title="Logout"
              >
                <LogOut className="h-5 w-5 mr-1 sm:mr-0 md:mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            ) : (
              <Button variant="link" onClick={() => router.push('/auth')} className="text-primary text-base font-bold hover:no-underline">
                 <LogIn className="h-5 w-5 mr-1 sm:mr-0 md:mr-1" />
                 <span className="hidden md:inline">Login</span>
              </Button>
            )}
          </div>
        </header>
        <ComingSoonBanner />
        {user && (
            <div className="px-4 pt-3 text-left">
                <p className="text-sm text-muted-foreground mb-1 flex items-center justify-start">
                    <UserIcon className="h-4 w-4 mr-1 text-primary" /> Logged in as: {user.email}
                </p>
            </div>
        )}
        
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
              Meet Your AI Friends
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-10 md:mb-12 max-w-xl mx-auto">
              Discover the unique personalities you can connect with. Each AI Dost is here to support you in their own special way!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 @[480px]:gap-4 @lg:gap-6">
              {personaOptions.map((persona) => (
                <div
                  key={persona.value}
                  className={cn(
                    "flex flex-col items-center text-center p-4 md:p-6 rounded-xl border bg-card shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg",
                    !user && persona.value !== 'default' ? 'opacity-80' : 'hover:border-primary/60'
                  )}
                >
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-4">
                    <Image
                      src={persona.imageUrl}
                      alt={persona.label}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={persona.imageHint}
                      className="rounded-full shadow-md"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{persona.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4 px-2 min-h-[3rem]">{persona.description}</p>
                  <Button
                    onClick={() => handlePersonaChat(persona.value)}
                    className={cn(
                      "w-full mt-auto gradient-button text-base py-2.5 rounded-lg shadow hover:shadow-md transition-shadow",
                      !user && persona.value !== 'default' && "opacity-70 cursor-not-allowed"
                    )}
                    aria-label={`Chat with ${persona.label}`}
                    disabled={!user && persona.value !== 'default' && !isClientReady}
                  >
                    Chat with {persona.label}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="py-6 border-t border-border mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Talkzii. Explore and find your perfect AI companion!</p>
        </div>
      </footer>
    </div>
  );
}
