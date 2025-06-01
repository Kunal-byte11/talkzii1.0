
"use client";

import { NewLandingHeader } from '@/components/talkzii/landing/NewLandingHeader';
import { BackgroundPaths } from '@/components/ui/background-paths'; // Import the new hero
import { NewLandingFeatures } from '@/components/talkzii/landing/NewLandingFeatures';
import { NewLandingAboutUs } from '@/components/talkzii/landing/NewLandingAboutUs';
import { NewLandingValues } from '@/components/talkzii/landing/NewLandingValues'; 
import { NewLandingFooter } from '@/components/talkzii/landing/NewLandingFooter';

export default function HomePage() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-background justify-between group/design-root overflow-x-hidden"
    >
      <div>
        <NewLandingHeader />
        <BackgroundPaths 
          title="Chat with your AI Dost"
          subtitle="Connect with AI companions for engaging conversations and personalized experiences."
          ctaText="Explore Talkzii"
        />
        <NewLandingFeatures />
        <NewLandingAboutUs />
        <NewLandingValues />
      </div>
      <NewLandingFooter />
    </div>
  );
}
