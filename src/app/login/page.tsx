
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      // The AuthProvider's onAuthStateChange will handle redirecting to /aipersona
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" passHref className="inline-block">
            <Logo className="h-12 w-auto mb-6 mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Sign in to continue your journey with Talkzii.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6 bg-card p-8 rounded-xl shadow-xl neumorphic-shadow-soft">
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
              placeholder="••••••••"
              required
              className="neumorphic-shadow-inset-soft"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full gradient-button text-lg py-3 rounded-lg">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

