
"use client";

import { Logo } from '@/components/talkzi/Logo';

export function NewLandingHeader() {
  return (
    <div className="flex items-center bg-background p-4 pb-2 justify-between">
      <Logo width={120} height={40} />
      <a
        href="#footer-contact"
        className="text-primary hover:text-primary/80 font-semibold text-sm px-3 py-2 rounded-md transition-colors"
      >
        Contact Us
      </a>
    </div>
  );
}
