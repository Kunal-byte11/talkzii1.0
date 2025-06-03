
"use client";

import React, { useState } from 'react';
import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { MenuItem, MenuContainer } from "@/components/ui/fluid-menu";
import {
  Menu as MenuIcon,
  X,
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
    // router.push will trigger page unload, isNavigating will reset if user comes back
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  const handleDesktopNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // e.preventDefault(); // Keep default for standard anchor jump if JS fails
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
      // For fluid menu, closing is handled by MenuItem itself after onClick
      // Delay scrolling slightly to allow menu to start closing visually
      setTimeout(() => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50); // Small delay
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

        {/* Mobile Navigation - Using Fluid Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            onClick={handleGetStarted}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-3 py-2 text-xs" // Adjusted for "Start"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> {/* Smaller loader */}
                <span>Wait..</span>
              </>
            ) : (
              "Start" // Shorter text for mobile
            )}
          </Button>
          <MenuContainer>
            <MenuItem
              icon={
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:-rotate-180">
                    <MenuIcon size={20} strokeWidth={2} className="text-foreground" />
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                    <X size={20} strokeWidth={2} className="text-foreground" />
                  </div>
                </div>
              }
              isToggle={true}
              aria-label="Toggle navigation menu"
            />
            {navLinks.map((link) => (
              <MenuItem
                key={link.label}
                icon={React.cloneElement(link.icon, { className: "text-muted-foreground"})}
                onClick={() => {
                  handleMobileNavLinkClick(link.href);
                }}
                aria-label={link.label}
              >
                <span className="text-foreground">{link.label}</span>
              </MenuItem>
            ))}
          </MenuContainer>
        </div>
      </div>
    </header>
  );
}

