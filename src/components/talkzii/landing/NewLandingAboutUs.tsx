
"use client";

import Image from "next/image";

export function NewLandingAboutUs() {
  const teamMembers = [
    {
      name: "Mr Kunal Dubey",
      title: "Founder & CEO",
      description: "Visionary leader driving Talkzii's mission to foster meaningful connections through AI.",
      imageUrl: "https://placehold.co/120x120.png",
      imageHint: "man portrait",
    },
    {
      name: "Vedant Ghodki",
      title: "Co-Founder & CTO",
      description: "Architecting the innovative technology that powers Talkzii's empathetic conversations.",
      imageUrl: "https://placehold.co/120x120.png",
      imageHint: "man portrait",
    },
  ];

  return (
    <div id="about-us-section" className="flex flex-col gap-10 px-4 py-10 @container scroll-mt-20 text-center">
      <div className="flex flex-col gap-4 text-left">
        <h1
          className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
        >
          About Us
        </h1>
        <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">Learn more about Talkzii and our mission.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 p-0 text-left">
        <div className="flex flex-1 gap-4 rounded-lg border border-border bg-card p-6 flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="text-primary" data-icon="UsersThree" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"
              ></path>
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-xl font-bold leading-tight">Our Mission</h2>
            <p className="text-muted-foreground text-sm font-normal leading-normal">
              At Talkzii, we aim to create a space for meaningful interactions with AI companions, fostering creativity and connection.
            </p>
          </div>
        </div>
      </div>

      {/* Meet Our Team Section */}
      <div className="mt-12 text-left">
        <div className="flex flex-col items-start mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Meet Our Team
            </h2>
            <div className="h-1 w-24 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                  data-ai-hint={member.imageHint}
                />
              </div>
              <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-medium">{member.title}</p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
