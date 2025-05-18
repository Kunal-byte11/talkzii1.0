
"use client";

import { useState, type FormEvent, type ChangeEvent, useEffect, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isValid, subYears, getYear, getMonth, getDate } from 'date-fns';
import { AlertCircle, UserCircle } from "lucide-react"; // Removed ImageUp
import type { UserProfile } from '@/types/talkzi';

// Removed avatar constants
const MIN_AGE = 16;

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<UserProfile['gender'] | undefined>(undefined);
  
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [dob, setDob] = useState<Date | undefined>(undefined);

  // Removed avatarFile and avatarPreview states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentYear = getYear(new Date());
  const years = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => currentYear - MIN_AGE - i)
    .filter(year => year >= currentYear - 100), 
    [currentYear]
  );
  const months = useMemo(() => [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ], []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const day = parseInt(selectedDay, 10);
      const month = parseInt(selectedMonth, 10); 
      const year = parseInt(selectedYear, 10);
      const potentialDob = new Date(year, month - 1, day);
      if (getDate(potentialDob) === day && getMonth(potentialDob) === month - 1 && getYear(potentialDob) === year) {
        setDob(potentialDob);
      } else {
        setDob(undefined); 
      }
    } else {
      setDob(undefined);
    }
  }, [selectedDay, selectedMonth, selectedYear]);


  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Removed handleAvatarChange function

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    if (!dob) {
      setError("Please select a valid date of birth.");
      return;
    }
    if (!isValid(dob)) {
      setError("Invalid date of birth selected. Please check day, month, and year.");
      return;
    }

    const age = calculateAge(dob);
    if (age < MIN_AGE) {
      setError(`You must be at least ${MIN_AGE} years old to use Talkzi.`);
      toast({
        title: "Age Restriction",
        description: `You must be at least ${MIN_AGE} years old to sign up.`,
        variant: "destructive",
      });
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
      // Removed avatar upload logic
      const profileData: UserProfile = {
        id: signUpData.user.id,
        email: signUpData.user.email || undefined, // Ensure email is potentially undefined if not returned
        gender: gender,
        date_of_birth: format(dob, 'yyyy-MM-dd'),
        avatar_url: null, // Set avatar_url to null
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData); // Changed from upsert to insert

      if (profileError) {
        setIsLoading(false);
        console.error("Profile save error:", profileError);
        setError(`Account created, but failed to save profile: ${profileError.message}. Please contact support or try updating your profile later.`);
        toast({
          title: "Profile Save Failed",
          description: `Your account was created, but we couldn't save other profile details. ${profileError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Signup Successful!",
        description: "Welcome to Talkzi! Please check your email to verify your account (if email confirmation is enabled).",
      });
      router.push('/login'); 
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

        <form onSubmit={handleSignup} className="space-y-6 bg-card p-6 sm:p-8 rounded-xl shadow-xl neumorphic-shadow-soft">
          {/* Removed Avatar Upload UI */}
          
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
              minLength={6}
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
              minLength={6}
              className="neumorphic-shadow-inset-soft"
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup onValueChange={(value) => setGender(value as UserProfile['gender'])} value={gender} className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                <Label htmlFor="prefer_not_to_say">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="dob-day" className="text-xs text-muted-foreground">Day</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger id="dob-day" className="neumorphic-shadow-inset-soft">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob-month" className="text-xs text-muted-foreground">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="dob-month" className="neumorphic-shadow-inset-soft">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob-year" className="text-xs text-muted-foreground">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="dob-year" className="neumorphic-shadow-inset-soft">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">You must be at least {MIN_AGE} years old.</p>
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
