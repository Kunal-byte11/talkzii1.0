
"use client";

import React, { useState } from 'react'; // Added useState
import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; 

// Import ShadCN DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Menu as MenuIconLucide,
  X,
  LayoutGrid, 
  Heart as HeartIcon, 
  Mail as MailIcon, 
  Info,
  // UsersRound, // "Peoples" link was removed in a previous step
} from 'lucide-react';


const navLinks = [
  { href: '#features-section', label: 'Features', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
  { href: '#about-us-section', label: 'About Us', icon: <Info size={18} strokeWidth={1.5} /> },
  // { href: '#peoples-subsection', label: 'Peoples', icon: <UsersRound size={18} strokeWidth={1.5} /> }, // Peoples removed
  { href: '#values-section', label: 'Our Values', icon: <HeartIcon size={18} strokeWidth={1.5} /> },
  { href: '#footer-contact', label: 'Contact', icon: <MailIcon size={18} strokeWidth={1.5} /> },
];

export function NewLandingHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu icon

  const handleGetStarted = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
  };

  const handleDesktopNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Native anchor behavior will handle scrolling.
  };

  const handleMobileNavLinkClick = (hash: string) => {
    const header = document.getElementById('landing-page-header');
    let headerOffset = 72; 
    if (header) {
      headerOffset = header.offsetHeight;
    }

    const el = document.querySelector(hash);
    if (el) {
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // DropdownMenu handles closing itself
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

        {/* Mobile Navigation - ShadCN DropdownMenu */}
        <div className="md:hidden flex items-center space-x-2">
           <Button
            onClick={handleGetStarted}
            size="sm"
            className="rounded-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
          >
            Get Started
          </Button>
          
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2 rounded-md justify-center hover:bg-muted/50 transition-colors">
                {mobileMenuOpen ? <X size={22} strokeWidth={2} /> : <MenuIconLucide size={22} strokeWidth={2} />}
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl z-50">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href + link.label}
                  onClick={() => handleMobileNavLinkClick(link.href)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  aria-label={link.label}
                >
                  {link.icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{link.icon}</span>}
                  <span className="flex-grow text-left truncate">{link.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
