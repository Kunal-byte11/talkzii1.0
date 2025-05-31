
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
        width={80} 
        height={80}
        priority // Add priority if it's LCP
      />
    </div>
  );
}
