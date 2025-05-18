
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/talkzi/Logo';
import { useToast } from '@/hooks/use-toast';
import type { AuthError } from 'firebase/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, isLoading: authIsLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isLoggedIn) {
    router.replace('/aipersona'); // Redirect if already logged in
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      toast({ title: "Signup Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      toast({ title: "Signup Error", description: "Password should be at least 6 characters long.", variant: "destructive" });
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(email, password);
      toast({
        title: "Signup Successful!",
        description: "Welcome to Talkzi! Please choose your AI persona.",
      });
      router.push('/aipersona'); // Redirect to persona page after signup
    } catch (err) {
      const authError = err as AuthError;
      let friendlyMessage = "Signup failed. Please try again.";
      if (authError.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Try logging in.";
      } else if (authError.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (authError.code === 'auth/weak-password') {
        friendlyMessage = "Password is too weak. It should be at least 6 characters.";
      }
      setError(friendlyMessage);
      console.error("Signup error details:", authError);
      toast({
        title: "Signup Failed",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md neumorphic-shadow-soft">
        <CardHeader className="text-center">
          <Link href="/" passHref className="mb-4 inline-block">
             <Logo className="h-10 w-auto mx-auto" />
          </Link>
          <CardTitle className="text-2xl font-bold">Create your Account</CardTitle>
          <CardDescription>Join Talkzi and start chatting with your AI dost.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full gradient-button" disabled={isSubmitting || authIsLoading}>
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
           <Button variant="link" asChild className="p-0 h-auto text-xs">
             <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
