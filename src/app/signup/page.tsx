
"use client";

import { useState, type FormEvent, type ChangeEvent } from 'react';
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon, ImageUp, UserCircle } from "lucide-react";
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setError("Image is too large. Max 2MB allowed.");
        setAvatarFile(null);
        setAvatarPreview(null);
        event.target.value = ""; 
        return;
      }
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
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
      setError("Please select your date of birth.");
      return;
    }
    if (!isValid(dob)) {
      setError("Invalid date of birth.");
      return;
    }

    const age = calculateAge(dob);
    if (age < 16) {
      setError("You must be at least 16 years old to use Talkzi.");
      toast({
        title: "Age Restriction",
        description: "You must be at least 16 years old to sign up.",
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
            // Potentially delete the created auth user or ask them to re-upload avatar later
            // For now, just stop and show error
            return;
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `public/${signUpData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Avatar upload error object:', uploadError);
          // Attempt to get more specific error details
          const supabaseErrorMessage = (uploadError as any)?.message || (uploadError as any)?.error || JSON.stringify(uploadError);
          console.error('Supabase specific error message:', supabaseErrorMessage);
          
          setError(`Avatar upload failed: ${supabaseErrorMessage}. Your account was created, but you can add a picture later.`);
          toast({
            title: "Avatar Upload Failed",
            description: `Your account was created, but we couldn't upload your profile picture. Error: ${supabaseErrorMessage}. You can try adding one later.`,
            variant: "destructive", 
          });
          // Decide if you want to proceed without avatar or halt. 
          // For now, we will proceed to save profile without avatar_url if upload failed.
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatarPublicUrl = urlData?.publicUrl || null;
        }
      }

      const profileData = {
        id: signUpData.user.id,
        email: signUpData.user.email,
        gender: gender,
        date_of_birth: format(dob, 'yyyy-MM-dd'),
        avatar_url: avatarPublicUrl, // Will be null if upload failed or no avatar provided
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        setIsLoading(false);
        // If profile save fails after successful auth & potentially avatar upload, this is tricky.
        // The user is authenticated, but their profile isn't fully set up.
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
            <Label htmlFor="avatar-upload" className="block text-sm font-medium text-foreground mb-1">Profile Picture (Optional, Max 2MB)</Label>
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
                  accept="image/png, image/jpeg, image/webp"
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
            <RadioGroup onValueChange={setGender} value={gender} className="flex flex-wrap gap-x-4 gap-y-2">
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
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal neumorphic-shadow-inset-soft ${
                    !dob && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                  disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 16)) || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
             <p className="text-xs text-muted-foreground">You must be at least 16 years old.</p>
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


    