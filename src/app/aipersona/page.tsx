
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/talkzi/Logo';
import Link from 'next/link';
import { Home, Bot, Users, Brain, Clapperboard, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Updated useAuth

const personaOptions = [
  { value: 'default', label: 'Default Talkzi', description: 'Your general empathetic AI companion.', icon: Bot },
  { value: 'female_best_friend', label: 'Female Best Friend', description: 'Supportive & bubbly like a trusted didi.', icon: Users },
  { value: 'male_best_friend', label: 'Male Best Friend', description: 'Chill & emotionally aware bro.', icon: Users },
  { value: 'topper_friend', label: 'Topper Friend', description: 'Helpful, kind, offers practical advice.', icon: Brain },
  { value: 'filmy_friend', label: 'Filmy Friend', description: 'Dramatic, expressive, Bollywood style!', icon: Clapperboard },
];

const AI_FRIEND_TYPE_KEY_PREFIX = 'talkzi_ai_friend_type_'; // Prefix for user-specific key

export default function AIPersonaPage() {
  const { user, isLoggedIn, isLoading: authIsLoading, logout } = useAuth();
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | undefined>(undefined);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const getAiFriendTypeKey = () => user ? `${AI_FRIEND_TYPE_KEY_PREFIX}${user.uid}` : null;

  useEffect(() => {
    if (!authIsLoading && !isLoggedIn) {
      router.replace('/login'); // Redirect to login page if not logged in
    }
  }, [isLoggedIn, authIsLoading, router]);

  useEffect(() => {
    if (authIsLoading || !user) return; // Wait for auth and user

    const aiFriendTypeKey = getAiFriendTypeKey();
    if (aiFriendTypeKey) {
      try {
        const savedPersona = localStorage.getItem(aiFriendTypeKey);
        if (savedPersona && personaOptions.some(p => p.value === savedPersona)) {
          setSelectedPersona(savedPersona);
        } else {
          setSelectedPersona('default');
        }
      } catch (error) {
        console.error("Error reading persona from localStorage", error);
        setSelectedPersona('default');
      }
    } else {
      setSelectedPersona('default'); // Fallback if no user (should be caught by auth check)
    }
    setIsPageLoading(false);
  }, [user, authIsLoading]);


  const handleConfirm = () => {
    if (selectedPersona && user) {
      const aiFriendTypeKey = getAiFriendTypeKey();
      if (aiFriendTypeKey) {
        try {
          if (selectedPersona === 'default') {
            localStorage.removeItem(aiFriendTypeKey);
          } else {
            localStorage.setItem(aiFriendTypeKey, selectedPersona);
          }
        } catch (error) {
          console.error("Error saving persona to localStorage", error);
        }
      }
      router.push('/chat');
    } else if (!user) {
        router.push('/login'); // Should not happen if auth guard is effective
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authIsLoading || isPageLoading || (!authIsLoading && !isLoggedIn)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        { (authIsLoading || isPageLoading) && <p className="text-muted-foreground">Loading...</p>}
        { (!authIsLoading && !isLoggedIn) && (
          <>
            <p className="text-destructive text-center mb-4">Please log in to access this page.</p>
            <Button onClick={() => router.push('/login')} className="gradient-button">
              Go to Login
            </Button>
          </>
        )}
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
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild title="Home">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
            {isLoggedIn && (
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="text-center mb-8 sm:mb-10">
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
          disabled={!selectedPersona || isPageLoading || authIsLoading}
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
