
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
import { AuthRequiredMessage } from '@/components/talkzi/AuthRequiredMessage';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Updated personaOptions with local image paths
const personaOptions = [
  {
    value: 'default',
    label: 'Talkzii',
    description: 'Your default, empathetic AI companion for all moods.',
    imageHint: 'abstract companion',
    imageUrl: '/icons/assets/talzii.png',
  },
  {
    value: 'wise_dadi',
    label: 'Wise Dadi',
    description: 'A comforting grandma with desi wisdom and love.',
    imageHint: 'grandmother wisdom',
    imageUrl: '/icons/assets/dadi.jpg',
  },
  {
    value: 'chill_bro',
    label: 'Chill Bro',
    description: 'A laid-back bestie to help you vibe and de-stress.',
    imageHint: 'friendly confident',
    imageUrl: '/icons/assets/chillbro.png',
  },
  {
    value: 'geeky_bhai',
    label: 'Geeky Bhai', // Label changed to match design more closely
    description: 'A nerdy topper for practical tips and quirky humor.',
    imageHint: 'smart glasses',
    imageUrl: '/icons/assets/nerdyfriend.png',
  },
  {
    value: 'flirty_diva', // value changed from flirty_dia
    label: 'Flirty Diva', // Label changed to match design more closely
    description: 'A sassy gal for playful, flirty chats.',
    imageHint: 'fashion glamour',
    imageUrl: '/icons/assets/Flirty Dia.png', // filename for Flirty Diva
  },
  {
    value: 'cheeky_lad',
    label: 'Cheeky Lad',
    description: 'A charming guy for cheeky, flirty banter.',
    imageHint: 'playful smile',
    imageUrl: '/icons/assets/Cheeky Lad.png',
  },
];

const getAIFriendTypeKey = (userId?: string) => userId ? `talkzii_ai_friend_type_${userId}` : 'talkzii_ai_friend_type_guest';
const getChatHistoryKey = (userId?: string) => userId ? `talkzii_chat_history_${userId}` : 'talkzii_chat_history_guest';


export default function AIPersonaPage() {
  const router = useRouter();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>(undefined);
  const [previousSavedPersona, setPreviousSavedPersona] = useState<string | undefined>(undefined);
  const [isPersonaLoading, setIsPersonaLoading] = useState(true);
  const { toast } = useToast();

  const AI_FRIEND_TYPE_KEY = useMemo(() => {
    if (user?.id) {
      return getAIFriendTypeKey(user.id);
    }
    // For guests, use the guest-specific key.
    // This handles the case where `user` is null.
    return getAIFriendTypeKey(undefined); 
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth state to resolve

    setIsPersonaLoading(true);
    // AI_FRIEND_TYPE_KEY is now guaranteed to be non-null by the useMemo hook logic
    try {
      const savedPersona = localStorage.getItem(AI_FRIEND_TYPE_KEY);
      const initialPersona = savedPersona || 'default';
      
      setPreviousSavedPersona(initialPersona); // Store what was actually saved or default
      setSelectedPersona(initialPersona);     // Set the current selection to match

    } catch (error) {
      console.error("Error reading persona from localStorage", error);
      setPreviousSavedPersona('default');
      setSelectedPersona('default');
    }
    setIsPersonaLoading(false);
  }, [isAuthLoading, AI_FRIEND_TYPE_KEY]);


  const handleConfirm = () => {
    if (!selectedPersona) {
        toast({ title: "Select a Persona", description: "Please select a persona to chat with." });
        return;
    }
     if (!AI_FRIEND_TYPE_KEY) { 
        toast({ title: "Error", description: "User context not available.", variant: "destructive"});
        return;
    }

    try {
      // Check if persona actually changed from what was loaded
      if (previousSavedPersona !== selectedPersona) {
        const currentChatHistoryKey = getChatHistoryKey(user?.id); // Get chat key for current user/guest
        localStorage.removeItem(currentChatHistoryKey);
        toast({
          title: "Persona Changed",
          description: "Your chat history has been cleared for the new persona.",
        });
      }

      // Save the new persona choice
      if (selectedPersona === 'default') {
        localStorage.removeItem(AI_FRIEND_TYPE_KEY);
      } else {
        localStorage.setItem(AI_FRIEND_TYPE_KEY, selectedPersona);
      }
    } catch (error) {
      console.error("Error during persona confirmation/localStorage operations", error);
      toast({
        title: "Error",
        description: "Could not save your persona preference or clear chat history.",
        variant: "destructive"
      });
      return; // Don't navigate if there was an error
    }
    router.push('/chat');
  };


  if (isAuthLoading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  if (!user) {
     // Redirect guests to auth page if they try to access /aipersona directly
     // as persona selection is tied to a user or a clearly defined guest experience from chat.
     // However, current setup allows guest selection of 'default' persona here.
     // For simplicity, we'll allow guest through but their persona choice is fixed to 'default' by ChatInterface if needed.
     // The AuthContext might redirect them anyway if they land here unauthenticated without prior flow.
  }

  if (isPersonaLoading) {
    return <LoadingSpinner message="Loading persona settings..." />;
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-background justify-between"
    >
      <div>
        <header className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/" passHref>
            <Logo className="h-7 w-auto" />
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
              onClick={() => setSelectedPersona(persona.value)}
              className={cn(
                "flex flex-col gap-3 text-center pb-3 items-center cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ease-in-out hover:shadow-lg",
                selectedPersona === persona.value ? 'border-primary ring-2 ring-primary shadow-xl bg-primary/5' : 'border-border bg-card hover:border-primary/50'
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
        
        <div className="px-4 py-6 mt-4">
          <Button
            onClick={handleConfirm}
            disabled={!selectedPersona || isAuthLoading || isPersonaLoading}
            className="w-full gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            aria-label="Confirm persona selection and start chatting"
          >
            Confirm & Chat
          </Button>
        </div>
      </div>

      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Talkzii. Change your AI's vibe anytime!</p>
        </div>
      </footer>
    </div>
  );
}
