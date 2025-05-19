
"use client";

import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AuthRequiredMessageProps {
  message?: string;
  actionButtonText?: string;
  actionButtonPath?: string;
}

export function AuthRequiredMessage({
  message = "Please log in to access this page.",
  actionButtonText,
  actionButtonPath
}: AuthRequiredMessageProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Logo className="h-12 w-auto mb-4" />
      <p className="text-muted-foreground mb-4 text-center">{message}</p>
      {actionButtonText && actionButtonPath && (
        <Button onClick={() => router.push(actionButtonPath)} className="gradient-button">
          {actionButtonText}
        </Button>
      )}
    </div>
  );
}
