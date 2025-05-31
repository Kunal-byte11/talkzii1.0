
"use client";

import Image from 'next/image'; // Use next/image for optimization

export function NewLandingHeader() {
  // The router and useAuth imports are removed as they are no longer used in this component
  // The handleStartChatting function is also removed

  return (
    <div className="flex items-center bg-background p-4 pb-2 justify-center">
      {/* Logo centered in the header using Next/Image */}
      <Image 
        src="/removed bg.png" // Path from public folder
        alt="Talkzi AI Logo" 
        width={48} // equivalent to h-12 w-12 (assuming 1rem = 16px, so 3rem = 48px)
        height={48}
        priority // Add priority if it's LCP
      />
    </div>
  );
}
