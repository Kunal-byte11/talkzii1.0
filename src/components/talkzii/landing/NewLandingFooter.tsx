
"use client";

export function NewLandingFooter() {
  return (
    // id was already present from a previous step
    <div id="footer-contact" className="scroll-mt-20"> {/* Added scroll-mt */}
      <footer className="flex flex-col gap-6 px-5 py-10 text-center @container bg-foreground text-background">
        <div className="flex justify-center gap-4">
          {/* Instagram Link */}
          <a href="https://www.instagram.com/talkzii.ai?igsh=Znc5NnZjYW0xazFq" target="_blank" rel="noopener noreferrer" aria-label="Talkzii on Instagram" className="text-background hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.95.272.272 2.95.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.102 2.878 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.102-.2 6.78-2.878 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.2-4.102-2.878-6.78-6.98-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
            </svg>
          </a>
          {/* Twitter Link */}
          <a href="https://x.com/talkzii?t=-QxBTPHhN5XAbntxo9Fzfg&s=09" target="_blank" rel="noopener noreferrer" aria-label="Talkzii on Twitter" className="text-background hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-3.594-1.555c-3.179 0-5.515 2.966-4.797 6.045A13.978 13.978 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0024 4.557z"/>
            </svg>
          </a>
        </div>
        <div>
          <p className="text-background text-base font-normal leading-normal">
            Contact Us: <a href="mailto:support@talkzii.com" className="underline hover:text-primary">support@talkzii.com</a>
          </p>
        </div>
        <p className="text-background text-base font-normal leading-normal">© 2025 Talkzii. Made with 💜 for Gen Z.</p>
      </footer>
      <div className="h-5 bg-background"></div>
    </div>
  );
}
