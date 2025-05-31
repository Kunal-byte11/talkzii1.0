
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function NewLandingAboutUs() {
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
    <div id="about-us-section" className="flex flex-col gap-10 px-4 py-10 @container scroll-mt-20 text-center"> {/* Added text-center for button */}
      <div className="flex flex-col gap-4 text-left"> {/* Keep text left for section header */}
        <h1
          className="text-foreground tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
        >
          About Us
        </h1>
        <p className="text-foreground text-base font-normal leading-normal max-w-[720px]">Learn more about Talkzii and our mission.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 p-0 text-left"> {/* Keep text left for card content */}
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
