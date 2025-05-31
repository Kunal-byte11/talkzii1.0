
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function NewLandingHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartChatting = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="flex items-center bg-background p-4 pb-2 justify-between">
      {/* Logo can be placed here if desired, for now, title is centered */}
      <div className="w-12"> {/* Spacer to help center title */} </div>
      <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Talkzii</h2>
      <div className="flex w-auto items-center justify-end">
        <Button
          variant="link"
          onClick={handleStartChatting}
          className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 p-0 h-auto hover:no-underline hover:text-primary/80"
        >
          Start Chatting
        </Button>
      </div>
    </div>
  );
}
