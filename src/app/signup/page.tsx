
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
import { AlertCircle, ImageUp, UserCircle } from "lucide-react";
import Image from 'next/image';
import type { UserProfile } from '@/types/talkzi';

const MAX_AVATAR_SIZE_MB = 2;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        setError(`Image is too large. Max ${MAX_AVATAR_SIZE_MB}MB allowed.`);
        setAvatarFile(null);
        setAvatarPreview(null);
        event.target.value = ""; 
        return;
      }
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
        setAvatarFile(null);
        setAvatarPreview(null);
        event.target.value = "";
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null); 
    }
  };

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
      let avatarPublicUrl: string | null = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        if (!fileExt) {
            setError("Invalid file type or name. Could not determine file extension.");
            setIsLoading(false);
            return;
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        // Simplified file path: USER_ID/fileName
        const filePath = `${signUpData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Target 'avatars' bucket
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          const supabaseErrorMessage = (uploadError as any)?.message || (uploadError as any)?.error || JSON.stringify(uploadError);
          console.error('Avatar upload error object:', uploadError);
          console.error('Supabase specific error message:', supabaseErrorMessage);
          setError(`Avatar upload failed: ${supabaseErrorMessage}. Your account was created, but you can add a picture later.`);
          toast({
            title: "Avatar Upload Failed",
            description: `Your account was created, but we couldn't upload your profile picture. Error: ${supabaseErrorMessage}. You can try adding one later.`,
            variant: "destructive", 
          });
          // We don't return here, try to save profile without avatar
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatarPublicUrl = urlData?.publicUrl || null;
        }
      }

      const profileData: UserProfile = {
        id: signUpData.user.id,
        email: signUpData.user.email,
        gender: gender,
        date_of_birth: format(dob, 'yyyy-MM-dd'),
        avatar_url: avatarPublicUrl,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        setIsLoading(false);
        setError(`Account created, but failed to save profile: ${profileError.message}. Please contact support or try updating your profile later.`);
        toast({
          title: "Profile Save Failed",
          description: `Your account was created (and avatar might be uploaded), but we couldn't save other profile details. ${profileError.message}`,
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
          <div className="space-y-2">
            <Label htmlFor="avatar-upload" className="block text-sm font-medium text-foreground mb-1">Profile Picture (Optional, Max {MAX_AVATAR_SIZE_MB}MB)</Label>
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover neumorphic-shadow-soft"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center neumorphic-shadow-soft">
                    <UserCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="flex-grow">
                <div className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed rounded-md cursor-pointer border-input hover:border-primary neumorphic-shadow-inset-soft">
                  <ImageUp className="h-6 w-6 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">{avatarFile ? avatarFile.name : "Upload (PNG, JPG, WEBP)"}</span>
                </div>
                <Input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept={ALLOWED_AVATAR_TYPES.join(",")}
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

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

    