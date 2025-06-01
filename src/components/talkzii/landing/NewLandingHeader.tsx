
"use client";

import React from 'react';
import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Using custom fluid-menu components
import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu';

import {
  Menu as MenuIconLucide,
  X,
  LayoutGrid,
  Heart as HeartIcon,
  Mail as MailIcon,
  Info,
  // UsersRound, // Removed as per previous instruction
} from 'lucide-react';


const navLinks = [
  { href: '#features-section', label: 'Features', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
  { href: '#about-us-section', label: 'About Us', icon: <Info size={18} strokeWidth={1.5} /> },
  // { href: '#peoples-subsection', label: 'Peoples', icon: <UsersRound size={18} strokeWidth={1.5} /> }, // "Peoples" link removed
  { href: '#values-section', label: 'Our Values', icon: <HeartIcon size={18} strokeWidth={1.5} /> },
  { href: '#footer-contact', label: 'Contact', icon: <MailIcon size={18} strokeWidth={1.5} /> },
];

export function NewLandingHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  const handleDesktopNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Native anchor behavior will handle scrolling.
    // e.preventDefault(); // Not needed if relying on native scroll + scroll-margin-top
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // 'start' should respect scroll-margin-top
      });
    }
  };

  const handleMobileNavLinkClick = (hash: string) => {
    const header = document.getElementById('landing-page-header');
    let headerOffset = header?.offsetHeight || 72; // Default if header not found or height is 0

    const id = hash.substring(1); // Remove the '#' to get the actual ID
    const element = document.getElementById(id);

    if (element) {
      // Wait for the menu to close (animation duration) before scrolling
      setTimeout(() => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 300); // Delay should ideally match or slightly exceed menu close animation
    }
    // Menu closing is handled by MenuContainer's wrapper logic with its own setTimeout
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
          >
            Get Started
          </Button>
        </nav>

        {/* Mobile Navigation - Using custom fluid-menu */}
        <div className="md:hidden flex items-center space-x-2">
           <Button
            onClick={handleGetStarted}
            size="sm"
            className="rounded-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
          >
            Get Started
          </Button>

          <MenuContainer className="relative z-50">
            {/* Toggle Item: First child of MenuContainer */}
            <MenuItem
              isToggle={true}
              aria-label="Toggle navigation menu"
              icon={
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* MenuIconLucide appears when data-expanded is false */}
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300 ease-in-out origin-center",
                    "[div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:-rotate-90 [div[data-expanded=true]_&]:scale-50",
                    "[div[data-expanded=false]_&]:opacity-100 [div[data-expanded=false]_&]:rotate-0 [div[data-expanded=false]_&]:scale-100"

                  )}>
                    <MenuIconLucide size={22} strokeWidth={2} />
                  </div>
                  {/* X icon appears when data-expanded is true */}
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300 ease-in-out origin-center",
                    "[div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:rotate-0 [div[data-expanded=true]_&]:scale-100",
                    "[div[data-expanded=false]_&]:opacity-0 [div[data-expanded=false]_&]:rotate-90 [div[data-expanded=false]_&]:scale-50"
                  )}>
                    <X size={22} strokeWidth={2} />
                  </div>
                </div>
              }
            />
            {/* Navigation items for the dropdown */}
            {navLinks.map((link) => (
              <MenuItem
                key={link.href + link.label}
                icon={link.icon}
                onClick={() => handleMobileNavLinkClick(link.href)}
                aria-label={link.label}
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
