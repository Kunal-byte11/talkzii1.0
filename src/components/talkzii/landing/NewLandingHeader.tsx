
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
  LogIn,
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

  const handleGetStarted = (isMobile = false) => {
    setIsNavigating(true);
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
    // setIsNavigating(false) is not set here as the component will likely unmount
    // or re-render upon navigation, resetting the state.
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      e.preventDefault(); 
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start' 
      });
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
              onClick={(e) => handleNavLinkClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <Button
            onClick={() => handleGetStarted(false)}
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

        {/* Mobile Navigation - Fluid Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            onClick={() => handleGetStarted(true)}
            size="sm"
            variant="outline"
            className="rounded-full px-3 py-1.5 text-xs border-primary text-primary hover:bg-primary/5"
            disabled={isNavigating}
          >
            {isNavigating ? (
               <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Wait..
              </>
            ) : "Let's Chat"}
          </Button>
          <MenuContainer className="relative"> {/* data-expanded is handled internally by MenuContainer */}
            <MenuItem
              isToggle
              icon={
                <div className="relative w-5 h-5 text-foreground">
                  {/* MenuIcon appears when data-expanded is false or not present */}
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:-rotate-180">
                    <MenuIcon size={20} strokeWidth={2} />
                  </div>
                  {/* X icon appears when data-expanded is true */}
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                    <X size={20} strokeWidth={2} />
                  </div>
                </div>
              }
              aria-label="Toggle mobile menu"
            />
            {navLinks.map((link) => (
              <MenuItem
                key={link.label}
                icon={React.cloneElement(link.icon, {size: 16, strokeWidth: 2})}
                href={link.href}
                onClick={(e) => {
                  // This onClick on MenuItem is for closing the menu and then handling navigation
                  // The actual smooth scroll is done by handleNavLinkClick
                  // The MenuContainer's cloneElement handles closing the menu
                  handleNavLinkClick(e as React.MouseEvent<HTMLAnchorElement>, link.href);
                }}
              >
                {link.label}
              </MenuItem>
            ))}
          </MenuContainer>
        </div>
      </div>
    </header>
  );
}
