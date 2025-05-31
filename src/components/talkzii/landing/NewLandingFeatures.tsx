"use client";

interface Feature {
  title: string;
  description: string;
  imageHint: string;
  imageUrl: string;
}

const features: Feature[] = [
  {
    title: "AI Personas",
    description: "Engage with diverse AI personalities, each with unique traits and backgrounds.",
    imageHint: "avatars diversity",
    imageUrl: "/icons/assets/persona.jpg",
  },
  {
    title: "Interactive Chat",
    description: "Enjoy real-time conversations with AI companions, sharing thoughts and ideas.",
    imageHint: "chat bubbles",
    imageUrl: "/icons/assets/chat.jpg",
  },
];

export function NewLandingFeatures() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 @container">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground tracking-light text-2xl font-semibold leading-tight @[480px]:text-3xl @[480px]:font-bold @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
          Key Features
        </h1>
        <p className="text-foreground text-sm @[480px]:text-base font-normal leading-normal max-w-[720px]">
          Explore the core functionalities of Talkzii.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 @[480px]:gap-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 pb-2 rounded-xl overflow-hidden shadow bg-card hover:shadow-md transition-shadow duration-300"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover"
              style={{ backgroundImage: `url(${feature.imageUrl})` }}
              data-ai-hint={feature.imageHint}
            />
            <div className="p-3">
              <p className="text-card-foreground text-base font-medium">
                {feature.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
