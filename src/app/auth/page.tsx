
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/talkzi/Logo';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import type { UserProfile } from '@/types/talkzi';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoadingState] = useState(false); // isLoading is the state, setIsLoadingState is the setter
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<UserProfile['gender'] | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.push('/aipersona');
    }
  }, [session, isAuthLoading, router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoadingState(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoadingState(false);

    if (signInError) {
      setError(signInError.message);
      toast({
        title: "Login Failed",
        description: signInError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
    }
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast({ title: "Validation Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      toast({ title: "Validation Error", description: "Please select your gender.", variant: "destructive" });
      return;
    }

    setIsLoadingState(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setIsLoadingState(false);
      setError(signUpError.message);
      toast({
        title: "Signup Failed",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    if (signUpData.user) {
      const emailPrefix = email.split('@')[0];
      const generatedUsername = emailPrefix || `user${Date.now().toString().slice(-6)}`;
      const profileData: Omit<UserProfile, 'created_at' | 'updated_at'> = {
        id: signUpData.user.id,
        username: generatedUsername,
        email: signUpData.user.email || '',
        gender: gender,
      };
      const { error: profileError } = await supabase.from('profiles').insert(profileData);
      if (profileError) {
        setIsLoadingState(false);
        setError(`Account created, but failed to save profile: ${profileError.message}.`);
        toast({
          title: "Profile Save Failed",
          description: `Your account was created, but we couldn't save other profile details. ${profileError.message}`,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Signup Successful!",
        description: "Welcome to Talkzii! Please check your email if confirmation is required.",
      });
    } else {
       setError("An unexpected error occurred during signup. User data not found. Please try again.");
       toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoadingState(false);
  };

  if (isAuthLoading && !session) { // Show loading only if auth is loading and there's no session yet
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-10 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background justify-between">
      <div>
        <header className="flex items-center bg-background p-4 pb-2 justify-center">
          <Link href="/" passHref>
            <Logo className="h-8 w-auto" />
          </Link>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto mt-2 sm:mt-4">
          <TabsList className="flex border-b border-border px-4 gap-8 justify-start bg-transparent p-0">
            <TabsTrigger 
              value="login" 
              className="flex flex-col items-center justify-center border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-foreground border-transparent text-muted-foreground pb-[13px] pt-4 px-1 sm:px-2 text-sm font-bold tracking-[0.015em] rounded-none shadow-none hover:text-foreground data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 sm:flex-initial"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="flex flex-col items-center justify-center border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-foreground border-transparent text-muted-foreground pb-[13px] pt-4 px-1 sm:px-2 text-sm font-bold tracking-[0.015em] rounded-none shadow-none hover:text-foreground data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 sm:flex-initial"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin} className="px-4 py-3 space-y-4">
              {error && activeTab === 'login' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="rounded-xl bg-input focus:border-none h-14 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal border-none focus-visible:ring-primary focus-visible:ring-1"
                />
              </div>
              <div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="rounded-xl bg-input focus:border-none h-14 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal border-none pr-10 focus-visible:ring-primary focus-visible:ring-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Link href="#" className="block text-muted-foreground text-sm font-normal leading-normal pt-1 px-0 underline">
                Forgot Password?
              </Link>
              <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 px-5 bg-primary text-primary-foreground text-base font-bold tracking-[0.015em] hover:bg-primary/90">
                {isLoading ? 'Logging In...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignup} className="px-4 py-3 space-y-4">
               {error && activeTab === 'signup' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="rounded-xl bg-input focus:border-none h-14 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal border-none focus-visible:ring-primary focus-visible:ring-1"
                />
              </div>
              
              <div className="pt-1">
                <Label className="text-muted-foreground font-normal text-sm mb-2 block">Gender</Label>
                <RadioGroup onValueChange={(value) => setGender(value as UserProfile['gender'])} value={gender} className="flex flex-wrap gap-x-4 gap-y-2">
                  {(['male', 'female', 'prefer_not_to_say'] as const).map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem value={g} id={`gender-${g}`} className="border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"/>
                      <Label htmlFor={`gender-${g}`} className="font-normal text-foreground capitalize">
                        {g === 'prefer_not_to_say' ? 'Prefer not to say' : g}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                 <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 6 characters)"
                    required
                    minLength={6}
                    className="rounded-xl bg-input focus:border-none h-14 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal border-none pr-10 focus-visible:ring-primary focus-visible:ring-1"
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <div>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"} // Link showPassword to confirm as well for consistency
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  minLength={6}
                  className="rounded-xl bg-input focus:border-none h-14 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal border-none focus-visible:ring-primary focus-visible:ring-1"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 px-5 bg-primary text-primary-foreground text-base font-bold tracking-[0.015em] hover:bg-primary/90">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="max-w-md mx-auto px-4 py-3 mt-2">
          <Button
            variant="outline"
            onClick={() => router.push('/chat')}
            className="w-full rounded-full h-12 px-5 bg-input text-foreground text-base font-bold tracking-[0.015em] border-none hover:bg-muted"
          >
            Continue as Guest
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4 mb-8 px-4">
          By signing up, you agree to our (non-existent) Terms of Service.
        </p>
      </div>
    </div>
  );
}
