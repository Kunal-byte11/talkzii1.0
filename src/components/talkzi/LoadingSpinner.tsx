
"use client";

import { Logo } from '@/components/talkzi/Logo';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Logo className="h-10 w-auto mb-4 animate-pulse" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
