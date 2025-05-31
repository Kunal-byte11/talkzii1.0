
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Home, Bot, Users, Brain, Skull, LogOut, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/talkzi/LoadingSpinner';
import { AuthRequiredMessage } from '@/components/talkzi/AuthRequiredMessage';

const personaOptions = [
  { value: 'default', label: 'Default Talkzii', description: 'Your general empathetic AI companion.', icon: Bot },
  { value: 'female_best_friend', label: 'Female Best Friend', description: 'Supportive & bubbly like a trusted didi.', icon: Users },
  { value: 'male_best_friend', label: 'Male Best Friend', description: 'Chill & emotionally aware bro.', icon: Users },
  { value: 'topper_friend', label: 'Topper Friend', description: 'Helpful, kind, offers practical advice.', icon: Brain },
  { value: 'toxic_friend', label: 'Toxic Friend ', description: 'Blunt, "tough love" advice, pushes for action.', icon: Skull },
];

const getAIFriendTypeKey = (userId: string) => `talkzii_ai_friend_type_${userId}`;

export default function AIPersonaPage() {
  const router = useRouter();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>(undefined);
  const [isPersonaLoading, setIsPersonaLoading] = useState(true);
  const { toast } = useToast();

  const AI_FRIEND_TYPE_KEY = useMemo(() => {
    if (user?.id) {
      return getAIFriendTypeKey(user.id);
    }
    return null; // No key if no user
  }, [user?.id]);

  useEffect(() => {
    if (user && !isAuthLoading && AI_FRIEND_TYPE_KEY) {
      setIsPersonaLoading(true);
      try {
        const savedPersona = localStorage.getItem(AI_FRIEND_TYPE_KEY);
        if (savedPersona && personaOptions.some(p => p.value === savedPersona)) {
          setSelectedPersona(savedPersona);
        } else {
          setSelectedPersona('default');
        }
      } catch (error) {
        console.error("Error reading persona from localStorage", error);
        setSelectedPersona('default');
      }
      setIsPersonaLoading(false);
    } else if (!user && !isAuthLoading) {
      // Not logged in, or auth state resolved to no user
      setIsPersonaLoading(false); 
    }
    // If isAuthLoading is true, we wait for it to resolve.
  }, [user, isAuthLoading, AI_FRIEND_TYPE_KEY]);

  const handleConfirm = () => {
    if (selectedPersona && user && AI_FRIEND_TYPE_KEY) {
      try {
        if (selectedPersona === 'default') {
          localStorage.removeItem(AI_FRIEND_TYPE_KEY);
        } else {
          localStorage.setItem(AI_FRIEND_TYPE_KEY, selectedPersona);
        }
      } catch (error) {
        console.error("Error saving persona to localStorage", error);
        toast({
          title: "Error",
          description: "Could not save your persona preference.",
          variant: "destructive"
        });
      }
      router.push('/chat');
    } else if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save preferences and chat.", variant: "destructive" });
      // AuthProvider should handle redirect, but this is a fallback message
    }
  };

  if (isAuthLoading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  if (!user) {
    // Auth is resolved, but no user. AuthProvider should redirect them.
    // This message is a fallback or shown briefly during redirection.
    return <AuthRequiredMessage message="You need to be logged in to choose a persona." actionButtonText="Go to Login" actionButtonPath="/auth" />;
  }

  // User is present, and auth is resolved.
  if (isPersonaLoading) {
    return <LoadingSpinner message="Loading persona settings..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <Link href="/" passHref>
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" asChild title="Home">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="text-center mb-8 sm:mb-10">
          <UserIcon className="mx-auto h-10 w-10 text-primary mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Logged in as: {user.email}</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            Choose Your AI Dost's Vibe!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Pick the personality you want Talkzii to have for your chat session.
          </p>
        </div>

        <RadioGroup
          value={selectedPersona}
          onValueChange={setSelectedPersona}
          className="space-y-4"
          aria-label="Select AI Persona"
        >
          {personaOptions.map((persona) => {
            const IconComponent = persona.icon;
            return (
              <Label
                key={persona.value}
                htmlFor={`persona-${persona.value}`}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${selectedPersona === persona.value ? 'ring-2 ring-primary border-primary shadow-xl bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <RadioGroupItem value={persona.value} id={`persona-${persona.value}`} className="mr-4 h-5 w-5 border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary" />
                <IconComponent className={`h-7 w-7 mr-3 ${selectedPersona === persona.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-grow">
                  <span className={`font-semibold text-lg ${selectedPersona === persona.value ? 'text-primary' : 'text-card-foreground'}`}>{persona.label}</span>
                  <p className="text-sm text-muted-foreground">{persona.description}</p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        <Button
          onClick={handleConfirm}
          disabled={!selectedPersona || isAuthLoading || !user || isPersonaLoading}
          className="w-full mt-8 sm:mt-10 gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          aria-label="Confirm persona selection and start chatting"
        >
          Confirm & Chat
        </Button>
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Talkzii. Change your AI's vibe anytime!</p>
        </div>
      </footer>
    </div>
  );
}
