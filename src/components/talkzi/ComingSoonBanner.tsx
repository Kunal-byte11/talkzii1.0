
"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'talkzii_coming_soon_banner_dismissed_v2';

export function ComingSoonBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (dismissed !== 'true') {
        setIsVisible(true);
      }
    } catch (error) {
      console.warn("Could not read from localStorage for ComingSoonBanner:", error);
      setIsVisible(true); 
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn("Could not write to localStorage for ComingSoonBanner:", error);
    }
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "relative w-full p-3 text-center text-white",
      "bg-gradient-to-r from-red-500 via-rose-500 to-red-600", 
      "shadow-md print:hidden"
    )}>
      <p className="font-semibold text-sm sm:text-base">
        🚀 Talkzii 2.0 is Coming Soon! Get ready for an even better experience. ✨
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20 hover:text-white"
        aria-label="Dismiss coming soon banner"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
}
