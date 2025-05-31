
"use client";

export function NewLandingFooter() {
  return (
    <div>
      <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
        <p className="text-muted-foreground text-base font-normal leading-normal">
          &copy; {new Date().getFullYear()} Talkzii. All rights reserved.
        </p>
      </footer>
      <div className="h-5 bg-background"></div> {/* This div seems to be for spacing */}
    </div>
  );
}
