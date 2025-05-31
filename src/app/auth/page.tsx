
"use client";

import { useState, type FormEvent, useEffect, useMemo } from 'react';
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

  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Signup specific state
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<UserProfile['gender'] | undefined>(undefined);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.push('/aipersona');
    }
  }, [session, isAuthLoading, router]);


  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

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
      // AuthProvider's onAuthStateChange will handle redirecting
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

    setIsLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setIsLoading(false);
      setError(signUpError.message);
      toast({
        title: "Signup Failed",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    if (signUpData.user) {
      console.log("User signed up successfully (from signUp response):", signUpData.user);
      
      const emailPrefix = email.split('@')[0];
      const generatedUsername = emailPrefix || `user${Date.now().toString().slice(-6)}`;

      const profileData: Omit<UserProfile, 'created_at' | 'updated_at' | 'date_of_birth'> = { 
        id: signUpData.user.id,
        username: generatedUsername,
        email: signUpData.user.email || '',
        gender: gender,
      };
      console.log("Profile data to be inserted:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        setIsLoading(false);
        console.error("Profile save error raw:", profileError);
        const profileErrorAsAny = profileError as any;
        const detailedMessage = profileErrorAsAny.message || 'Unknown error';
        
        setError(`Account created, but failed to save profile: ${detailedMessage}. Please contact support or try updating your profile later.`);
        toast({
          title: "Profile Save Failed",
          description: `Your account was created, but we couldn't save other profile details. ${detailedMessage}`,
          variant: "destructive",
        });
        return; 
      }

      toast({
        title: "Signup Successful!",
        description: "Welcome to Talkzii! Please check your email if confirmation is required.",
      });
    } else {
       setError("An unexpected error occurred during signup. User data not found after sign up. Please try again.");
       toast({
        title: "Signup Failed",
        description: "An unexpected error occurred (user data not available post-signup). Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading authentication state...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" passHref className="inline-block">
            <Logo className="h-10 w-auto mb-6 mx-auto" />
          </Link>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg neumorphic-shadow-soft">
            <TabsTrigger value="login" className="py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:neumorphic-shadow-inset-soft rounded-md transition-all">Login</TabsTrigger>
            <TabsTrigger value="signup" className="py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:neumorphic-shadow-inset-soft rounded-md transition-all">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="bg-card p-6 sm:p-8 rounded-xl shadow-xl neumorphic-shadow-soft mt-4">
              <h2 className="text-2xl font-bold text-center text-foreground mb-1">Welcome Back!</h2>
              <p className="text-muted-foreground text-center mb-6">Sign in to continue your journey.</p>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="neumorphic-shadow-inset-soft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="neumorphic-shadow-inset-soft pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="bg-card p-6 sm:p-8 rounded-xl shadow-xl neumorphic-shadow-soft mt-4">
              <h2 className="text-2xl font-bold text-center text-foreground mb-1">Create Account</h2>
              <p className="text-muted-foreground text-center mb-6">Join Talkzii to start your journey.</p>
               {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="neumorphic-shadow-inset-soft"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <RadioGroup onValueChange={(value) => setGender(value as UserProfile['gender'])} value={gender} className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Female</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                      <Label htmlFor="prefer_not_to_say" className="font-normal">Prefer not to say</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                   <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (min. 6 characters)"
                      required
                      minLength={6}
                      className="neumorphic-shadow-inset-soft pr-10"
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="neumorphic-shadow-inset-soft pr-10"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full gradient-button text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>
            Or,{' '}
            <Link href="/chat" className="font-semibold text-primary hover:underline">
              Continue as Guest & Chat with Default Persona
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our (non-existent) Terms of Service.
        </p>
      </div>
    </div>
  );
}

