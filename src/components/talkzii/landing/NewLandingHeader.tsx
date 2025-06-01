
"use client";

import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

// NEW IMPORTS for Fluid Menu
import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu';
import {
  Menu as MenuIconLucide,
  X,
  LayoutGrid, 
  Users as UsersIcon, 
  Heart as HeartIcon, 
  Mail as MailIcon, 
} from 'lucide-react';


const navLinks = [
  { href: '#features-section', label: 'Features', icon: <LayoutGrid size={20} strokeWidth={1.5} /> },
  { href: '#about-us-section', label: 'About Us', icon: <UsersIcon size={20} strokeWidth={1.5} /> },
  { href: '#values-section', label: 'Our Values', icon: <HeartIcon size={20} strokeWidth={1.5} /> },
  { href: '#footer-contact', label: 'Contact', icon: <MailIcon size={20} strokeWidth={1.5} /> },
];

export function NewLandingHeader() {
  const router = useRouter();
  const { user } = useAuth();
  // isMobileMenuOpen state might not be directly needed by MenuContainer if it manages its own state
  // but can be kept if other logic depends on it, or removed.
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const handleGetStarted = () => {
    if (user) {
      router.push('/aipersona');
    } else {
      router.push('/auth');
    }
    // setIsMobileMenuOpen(false); // Close menu if it was open, handled by fluid menu itself
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // For desktop, allow native anchor navigation
    // For mobile fluid menu, its internal onClick on MenuItem (if it's a link) will handle closing
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
          <Button
            onClick={handleGetStarted}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2"
          >
            Get Started
          </Button>
        </nav>

        {/* Mobile Navigation - Fluid Menu */}
        <div className="md:hidden flex items-center space-x-2">
           <Button
            onClick={handleGetStarted}
            size="sm"
            className="rounded-full px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
          >
            Get Started
          </Button>
          
          <MenuContainer itemOffset={65} startAngle={-90} className="relative z-50">
            <MenuItem
              key="toggle"
              aria-label="Toggle navigation menu"
              icon={
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                    <MenuIconLucide size={22} strokeWidth={2} />
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                    <X size={22} strokeWidth={2} />
                  </div>
                </div>
              }
            />
            {navLinks.map((link) => (
              <MenuItem
                key={link.href}
                href={link.href} 
                icon={link.icon}
                aria-label={link.label}
              />
            ))}
          </MenuContainer>
        </div>
      </div>
    </header>
  );
}

