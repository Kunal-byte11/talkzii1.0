
"use client";

import dynamic from 'next/dynamic';
import { NewLandingHeader } from '@/components/talkzii/landing/NewLandingHeader';
import { BackgroundPaths } from '@/components/ui/background-paths'; 
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Dynamically import components that are below the fold
const NewLandingFeatures = dynamic(() => 
  import('@/components/talkzii/landing/NewLandingFeatures').then(mod => mod.NewLandingFeatures),
  { 
    loading: () => <div className="container mx-auto px-4 py-10"><Skeleton className="h-48 w-full" /></div>,
    ssr: false // Ensure these are client-side to benefit from lazy loading
  }
);
const NewLandingAboutUs = dynamic(() => 
  import('@/components/talkzii/landing/NewLandingAboutUs').then(mod => mod.NewLandingAboutUs),
  { 
    loading: () => <div className="container mx-auto px-4 py-10"><Skeleton className="h-64 w-full" /></div>,
    ssr: false 
  }
);
const NewLandingValues = dynamic(() => 
  import('@/components/talkzii/landing/NewLandingValues').then(mod => mod.NewLandingValues),
  { 
    loading: () => <div className="container mx-auto px-4 py-10"><Skeleton className="h-40 w-full" /></div>,
    ssr: false 
  }
);
const NewLandingFooter = dynamic(() => 
  import('@/components/talkzii/landing/NewLandingFooter').then(mod => mod.NewLandingFooter),
  { 
    loading: () => <div className="container mx-auto px-4 py-10"><Skeleton className="h-24 w-full" /></div>,
    ssr: false 
  }
);


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
