
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function NewLandingHero() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  const heroStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYCZmtEn12MUuqRpBzjeIkT5FRuFBySz5CJW4WnFhNbifr8oBgf73t2tYdZ71btXPSfwRuk9Wqd87QH0YU0_I7jnMkxu4kN7fDaaGNvaxlCdHJjYfqETns9D3sC2AjQQ8umay1HxTRHNfC6Vpwrk2PY6nbjTsH6T4J4QFOhEneSGSXRp8PctPagkopTtqBbZJ9LH8QYk_DpYSabJPaMf2jKglQ4LqEs2xJBWrBow8CZWVpI24Ni5Z9UzHMzPfGloPLrGS4Hes7ug")',
  };

  return (
    <div className="@container">
      <div className="@[480px]:p-4">
        <div
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4 text-center" // Added text-center
          style={heroStyle}
          data-ai-hint="abstract vibrant"
        >
          <div className="flex flex-col gap-2">
            <h1
              className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
            >
              Chat with your AI Dost!
            </h1>
            <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal max-w-xl mx-auto">
              Connect with AI companions for engaging conversations and personalized experiences.
            </h2>
          </div>
          <Button
            onClick={handleGetStarted}
            size="lg" // Made hero button larger
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 text-base font-bold"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
