
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { LogOut, User as UserIcon, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
// import { AuthRequiredMessage } from '@/components/talkzi/AuthRequiredMessage'; // Not used
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { personaOptions } from '@/lib/personaOptions'; // Using shared persona options

const getAIFriendTypeKey = (userId?: string) => userId ? `talkzii_ai_friend_type_${userId}` : 'talkzii_ai_friend_type_guest';
const getChatHistoryKey = (userId?: string) => userId ? `talkzii_chat_history_${userId}` : 'talkzii_chat_history_guest';


export default function AIPersonaPage() {
  const router = useRouter();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<string>('default');
  const [isPersonaLoading, setIsPersonaLoading] = useState(true);
  const { toast } = useToast();

  const AI_FRIEND_TYPE_KEY = useMemo(() => {
    return getAIFriendTypeKey(user?.id);
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) return; 

    setIsPersonaLoading(true);
    if (!user) { // Guest user
      setSelectedPersona('default');
    } else { // Logged-in user
      try {
        const savedPersona = localStorage.getItem(AI_FRIEND_TYPE_KEY);
        setSelectedPersona(savedPersona || 'default');     
      } catch (error) {
        console.error("Error reading persona from localStorage for user", error);
        setSelectedPersona('default');
      }
    }
    setIsPersonaLoading(false);
  }, [isAuthLoading, AI_FRIEND_TYPE_KEY, user]);

  const handleGuestPersonaConfirm = () => {
    try {
      localStorage.removeItem(getAIFriendTypeKey(undefined)); 
      localStorage.removeItem(getChatHistoryKey(undefined)); 
      toast({
        title: "Continuing as Guest",
        description: "You'll be chatting with Talkzii (default).",
      });
    } catch (error) {
      console.error("Error clearing guest localStorage", error);
    }
    router.push('/chat');
  };

  const handlePersonaSelect = (personaValue: string) => {
    if (!user) { // Guest user
      if (personaValue === 'default') {
        setSelectedPersona('default'); // Allow selecting default
        handleGuestPersonaConfirm(); // Directly proceed to chat for guests selecting default
      } else {
        const personaLabel = personaOptions.find(p => p.value === personaValue)?.label || "this persona";
        toast({
          title: "Login to Use Persona",
          description: `Please log in to chat with ${personaLabel}. Guests chat with Talkzii (default).`,
        });
      }
      return; 
    }

    // Logged-in user: direct navigation
    setSelectedPersona(personaValue);
    try {
      const previousSavedPersona = localStorage.getItem(AI_FRIEND_TYPE_KEY) || 'default';
      if (previousSavedPersona !== personaValue) {
        const currentChatHistoryKey = getChatHistoryKey(user.id); 
        localStorage.removeItem(currentChatHistoryKey);
        toast({
          title: "Persona Changed",
          description: "Your chat history has been cleared for the new persona.",
        });
      }

      if (personaValue === 'default') {
        localStorage.removeItem(AI_FRIEND_TYPE_KEY);
      } else {
        localStorage.setItem(AI_FRIEND_TYPE_KEY, personaValue);
      }
    } catch (error) {
      console.error("Error during persona confirmation/localStorage operations for user", error);
      toast({
        title: "Error",
        description: "Could not save your persona preference or clear chat history.",
        variant: "destructive"
      });
      return; 
    }
    router.push('/chat');
  };


  if (isAuthLoading || isPersonaLoading) {
    return <LoadingSpinner message={isAuthLoading ? "Verifying authentication..." : "Loading persona settings..."} />;
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-background justify-between"
    >
      <div>
        <header className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/" passHref>
            <Logo width={84} height={28} />
          </Link>
          <div className="flex items-center space-x-2">
             <Button variant="ghost" size="icon" asChild title="Home Page">
              <Link href="/">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Home</span>
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
              <Button variant="link" onClick={() => router.push('/auth')} className="text-primary text-base font-bold">Login</Button>
            )}
          </div>
        </header>

        {user && (
            <div className="px-4 pt-3 text-left">
                <p className="text-sm text-muted-foreground mb-1 flex items-center justify-start">
                    <UserIcon className="h-4 w-4 mr-1 text-primary" /> Logged in as: {user.email}
                </p>
            </div>
        )}
        
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 text-left">
          Choose your Talkzii
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4 @[480px]:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] @lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {personaOptions.map((persona) => (
            <div
              key={persona.value}
              onClick={() => handlePersonaSelect(persona.value)}
              className={cn(
                "flex flex-col gap-3 text-center pb-3 items-center p-3 rounded-xl border-2 transition-all duration-200 ease-in-out hover:shadow-lg cursor-pointer",
                selectedPersona === persona.value ? 'border-primary ring-2 ring-primary shadow-xl bg-primary/5' : 'border-border bg-card hover:border-primary/50',
                !user && persona.value !== 'default' && 'opacity-70 hover:border-border hover:shadow-none' // Keep visual cue but click handled by toast
              )}
            >
              <div className="relative px-4 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40">
                <Image
                  src={persona.imageUrl}
                  alt={persona.label}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={persona.imageHint}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-foreground text-base font-medium leading-normal">{persona.label}</p>
                <p className="text-muted-foreground text-sm font-normal leading-normal px-1">{persona.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* "Confirm & Chat" button only for guests */}
        {!user && (
          <div className="px-4 py-6 mt-4">
            <Button
              onClick={handleGuestPersonaConfirm}
              className="w-full gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              aria-label="Chat with Talkzii (Default)"
            >
              Chat with Talkzii (Default)
            </Button>
          </div>
        )}
      </div>

      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Talkzii. Change your AI's vibe anytime!</p>
        </div>
      </footer>
    </div>
  );
}
