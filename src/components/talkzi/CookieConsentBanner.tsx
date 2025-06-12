
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'talkzii_cookie_consent_given';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine visibility only on the client-side
    try {
      const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consentGiven !== 'true') {
        setIsVisible(true);
      }
    } catch (error) {
      console.warn("Could not read cookie consent status from localStorage:", error);
      // If localStorage fails, assume consent not given and show banner
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error("Could not save cookie consent status to localStorage:", error);
      // Still hide banner visually even if localStorage fails
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 print:hidden",
        "bg-background/90 border-t border-border shadow-lg backdrop-blur-sm",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Cookie className="h-8 w-8 sm:h-7 sm:w-7 text-primary flex-shrink-0 mt-1 sm:mt-0" />
          <p id="cookie-consent-description" className="text-sm text-foreground">
            We use cookies to enhance your experience, remember your preferences, and ensure our app functions smoothly. By continuing to use Talkzii, you agree to our use of cookies.
            {/* TODO: Add a link to a privacy policy page here if/when available */}
          </p>
        </div>
        <Button
          onClick={handleAccept}
          className="gradient-button w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
          aria-label="Accept cookies"
        >
          Got it, thanks!
        </Button>
      </div>
    </div>
  );
}
