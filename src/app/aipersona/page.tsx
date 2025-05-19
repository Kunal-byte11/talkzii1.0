
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Home, Bot, Users, Brain, Skull, LogOut, User as UserIcon } from 'lucide-react'; // Renamed User to UserIcon
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const personaOptions = [
  { value: 'default', label: 'Default Talkzi', description: 'Your general empathetic AI companion.', icon: Bot },
  { value: 'female_best_friend', label: 'Female Best Friend', description: 'Supportive & bubbly like a trusted didi.', icon: Users },
  { value: 'male_best_friend', label: 'Male Best Friend', description: 'Chill & emotionally aware bro.', icon: Users },
  { value: 'topper_friend', label: 'Topper Friend', description: 'Helpful, kind, offers practical advice.', icon: Brain },
  { value: 'toxic_friend', label: 'Toxic Friend (Kabir Singh Vibe)', description: 'Blunt, "tough love" advice, pushes for action.', icon: Skull },
];

const getAIFriendTypeKey = (userId?: string) => userId ? `talkzi_ai_friend_type_${userId}` : 'talkzi_ai_friend_type_guest';


export default function AIPersonaPage() {
  const router = useRouter();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>(undefined);
  const [isLocalStorageReady, setIsLocalStorageReady] = useState(false); // Used to ensure localStorage access is client-side
  const { toast } = useToast();
  
  // AI_FRIEND_TYPE_KEY will update when user object changes (due to login/logout)
  const AI_FRIEND_TYPE_KEY = getAIFriendTypeKey(user?.id);

  useEffect(() => {
    // This effect runs when AI_FRIEND_TYPE_KEY changes (i.e., user logs in/out or on initial load)
    // or when auth state resolves after initial load.
    if (!isAuthLoading && user) {
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
      setIsLocalStorageReady(true); // Indicate localStorage has been accessed
    } else if (!isAuthLoading && !user) {
      // User is not logged in, and auth state is resolved.
      // AuthProvider should handle redirect. This page will show "Please log in".
      setIsLocalStorageReady(true); // Still mark as ready to stop showing page loader.
    }
  }, [user, isAuthLoading, AI_FRIEND_TYPE_KEY]);


  const handleConfirm = () => {
    if (selectedPersona && user) { 
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
        toast({ title: "Not Logged In", description: "Please log in to save preferences and chat.", variant: "destructive"});
        // AuthProvider should have already redirected, but as a fallback:
        router.push('/auth');
    }
  };
  
  if (isAuthLoading || (!isLocalStorageReady && user)) { 
    // Show loading if auth is loading OR if user is present but localStorage hasn't been checked yet
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading persona settings...</p>
      </div>
    );
  }

  if (!user) { 
     // This state should ideally be brief as AuthProvider should redirect.
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4" />
        <p className="text-muted-foreground mb-4">Please log in to choose your AI Dost's vibe.</p>
        <Button onClick={() => router.push('/auth')}>Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl mx-auto items-center justify-between px-4">
          <Link href="/" passHref>
             <Logo className="h-8 w-auto" />
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
            Pick the personality you want Talkzi to have for your chat session.
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
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${
                  selectedPersona === persona.value ? 'ring-2 ring-primary border-primary shadow-xl bg-primary/5' : 'border-border bg-card hover:border-primary/50'
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
          disabled={!selectedPersona || isAuthLoading || !user} // isAuthLoading check is good here
          className="w-full mt-8 sm:mt-10 gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          aria-label="Confirm persona selection and start chatting"
        >
          Confirm & Chat
        </Button>
      </main>
       <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Talkzi. Change your AI's vibe anytime!</p>
        </div>
      </footer>
    </div>
  );
}

    