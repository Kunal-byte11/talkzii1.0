
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/talkzi/Logo';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      toast({
        title: "Signup Failed",
        description: signUpError.message,
        variant: "destructive",
      });
    } else if (signUpData.user) {
      // Optionally create a profile in your 'profiles' table here
      // For example:
      // await supabase.from('profiles').insert([{ id: signUpData.user.id, email: signUpData.user.email }]);
      
      toast({
        title: "Signup Successful!",
        description: "Please check your email to verify your account.",
      });
      // The AuthProvider's onAuthStateChange might redirect if session becomes active,
      // or you might want to redirect to login after verification.
      // For now, we'll let the user go to login manually after verification.
      router.push('/login'); 
    } else {
       setError("An unexpected error occurred during signup. Please try again.");
       toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" passHref className="inline-block">
            <Logo className="h-12 w-auto mb-6 mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">
            Join Talkzi and start your supportive conversations.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="space-y-6 bg-card p-8 rounded-xl shadow-xl neumorphic-shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="neumorphic-shadow-inset-soft"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min. 6 characters)"
              required
              className="neumorphic-shadow-inset-soft"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="neumorphic-shadow-inset-soft"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full gradient-button text-lg py-3 rounded-lg">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
