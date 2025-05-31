
"use client";

import { Logo } from '@/components/talkzi/Logo';
// Button component is no longer needed here
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // Keep Link for logo
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button'; // Keep for SheetTrigger
import { Menu } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '#features-section', label: 'Features' },
  { href: '#about-us-section', label: 'About Us' },
  { href: '#values-section', label: 'Our Values' },
  { href: '#footer-contact', label: 'Contact' },
];

export function NewLandingHeader() {
  // const router = useRouter(); // Not needed directly anymore
  // const { user } = useAuth(); // Not needed directly anymore
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // const handleGetStarted = () => { // This logic will be moved to individual sections
  //   if (user) {
  //     router.push('/aipersona');
  //   } else {
  //     router.push('/auth');
  //   }
  //   setIsMobileMenuOpen(false);
  // };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault(); 
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Talkzii Home">
          <Logo width={120} height={30} className="h-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          {/* "Get Started" Button removed from here */}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-6">
              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href)}
                    className="text-base font-medium text-foreground transition-colors hover:text-primary py-2 cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
                {/* "Get Started" Button removed from mobile menu as well, will be in sections */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
