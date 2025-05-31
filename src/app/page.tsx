
"use client";

import { NewLandingHeader } from '@/components/talkzii/landing/NewLandingHeader';
import { NewLandingHero } from '@/components/talkzii/landing/NewLandingHero';
import { NewLandingFeatures } from '@/components/talkzii/landing/NewLandingFeatures';
import { NewLandingFooter } from '@/components/talkzii/landing/NewLandingFooter';

export default function HomePage() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-background justify-between group/design-root overflow-x-hidden"
    >
      <div>
        <NewLandingHeader />
        <NewLandingHero />
        <NewLandingFeatures />
      </div>
      <NewLandingFooter />
    </div>
  );
}
