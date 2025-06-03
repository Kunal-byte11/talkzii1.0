
"use client";

import React, { useState } from 'react';
import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import {
  Menu as MenuIcon,
  LayoutGrid,
  Heart as HeartIcon,
  Mail as MailIcon,
  Info,
  Loader2
} from 'lucide-react';


const navLinks = [
  { href: '#features-section', label: 'Features', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
  { href: '#about-us-section', label: 'About Us', icon: <Info size={18} strokeWidth={1.5} /> },
  { href: '#values-section', label: 'Our Values', icon: <HeartIcon size={18} strokeWidth={1.5} /> },
  { href: '#footer-contact', label: 'Contact', icon: <MailIcon size={18} strokeWidth={1.5} /> },
];

export function NewLandingHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  const handleDesktopNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  const handleMobileNavLinkClick = (hash: string) => {
    const header = document.getElementById('landing-page-header');
    let headerOffset = header?.offsetHeight || 72; 

    const id = hash.substring(1); 
    const element = document.getElementById(id);

    if (element) {
      // Allow sheet to close before scrolling
      setTimeout(() => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 150); // Adjusted delay to ensure sheet animation can start
    }
  };


  return (
    <header
      id="landing-page-header"
      className="bg-background/95 sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
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
              onClick={(e) => handleDesktopNavLinkClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <Button
            onClick={handleGetStarted}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </nav>

        {/* Mobile Navigation - Using Sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0 pt-6 flex flex-col bg-background">
              <SheetHeader className="px-6 pb-4">
                <SheetTitle className="text-left">
                  <SheetClose asChild>
                    <Link href="/" passHref>
                      <Logo width={100} height={34} />
                    </Link>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="flex-grow p-4 space-y-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base py-3 text-foreground"
                      onClick={() => handleMobileNavLinkClick(link.href)}
                    >
                      {React.cloneElement(link.icon, { className: "mr-3 h-5 w-5 text-muted-foreground" })}
                      {link.label}
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <Separator />
              <div className="p-4 mt-auto">
                <SheetClose asChild>
                  <Button
                    onClick={handleGetStarted}
                    className="w-full gradient-button text-base py-3"
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </SheetClose>
              </div>
              <div className="px-6 py-3 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Talkzii
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
