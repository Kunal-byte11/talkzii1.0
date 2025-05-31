
"use client";

import { personaOptions as allPersonas } from '@/lib/personaOptions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    title: "AI Personas",
    description: "Engage with diverse AI personalities, each with unique traits and backgrounds.",
    imageHint: allPersonas.find(p => p.value === 'default')?.imageHint || "avatars diversity",
    imageUrl: allPersonas.find(p => p.value === 'default')?.imageUrl || "/icons/assets/persona.jpg",
  },
  {
    title: "Interactive Chat",
    description: "Enjoy real-time conversations with AI companions, sharing thoughts and ideas.",
    imageHint: "chat bubbles",
    imageUrl: "/icons/assets/chat.jpg",
  },
];

export function NewLandingFeatures() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div id="features-section" className="flex flex-col gap-10 px-4 py-10 @container scroll-mt-20 text-center"> {/* Added text-center for button */}
      <div className="flex flex-col gap-4 text-left"> {/* Keep text left for section header */}
        <h1 className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
          Key Features
        </h1>
        <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">
          Explore the core functionalities of Talkzii.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 text-left"> {/* Keep text left for features */}
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 pb-3"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
              style={{ backgroundImage: `url(${feature.imageUrl})` }}
              data-ai-hint={feature.imageHint}
            />
            <div>
              <p className="text-foreground text-base font-medium leading-normal">
                {feature.title}
              </p>
              <p className="text-muted-foreground text-sm font-normal leading-normal">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6"> {/* Container for the button, centered */}
        <Button
            onClick={handleGetStarted}
            size="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2.5"
        >
            Get Started
        </Button>
      </div>
    </div>
  );
}
