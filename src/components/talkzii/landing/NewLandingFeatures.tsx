
"use client";

interface Feature {
  title: string;
  description: string;
  imageHint: string;
  imageUrl: string;
}

// Using placeholder images as per guidelines
const features: Feature[] = [
  {
    title: "AI Personas",
    description: "Engage with diverse AI personalities, each with unique traits and backgrounds.",
    imageHint: "avatars diversity",
    imageUrl: "https://placehold.co/600x400.png", // Placeholder
  },
  {
    title: "Interactive Chat",
    description: "Enjoy real-time conversations with AI companions, sharing thoughts and ideas.",
    imageHint: "chat bubbles",
    imageUrl: "https://placehold.co/600x400.png", // Placeholder
  },
  {
    title: "Chat History",
    description: "Access and review past conversations with your AI friends anytime.",
    imageHint: "archive list",
    imageUrl: "https://placehold.co/600x400.png", // Placeholder
  },
];

export function NewLandingFeatures() {
  return (
    <div className="flex flex-col gap-10 px-4 py-10 @container">
      <div className="flex flex-col gap-4">
        <h1 className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
          Key Features
        </h1>
        <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">
          Explore the core functionalities of Talkzii.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 pb-3" // Removed shadow and bg-card from individual items
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
    </div>
  );
}
