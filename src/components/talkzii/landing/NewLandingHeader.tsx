
"use client";

import { Logo } from '@/components/talkzi/Logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; 

import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu'; 
import {
  Menu as MenuIconLucide,
  X,
  LayoutGrid, 
  Heart as HeartIcon, 
  Mail as MailIcon, 
  Info,
  UsersRound,
} from 'lucide-react';


const navLinks = [
  { href: '#features-section', label: 'Features', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
  { href: '#about-us-section', label: 'About Us', icon: <Info size={18} strokeWidth={1.5} /> },
  { href: '#peoples-subsection', label: 'Peoples', icon: <UsersRound size={18} strokeWidth={1.5} /> },
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
    // Native anchor behavior will handle scrolling, scroll-margin-top will provide offset.
  };
  
  const handleMobileNavLinkClick = (href: string) => {
    window.location.hash = href;
    // The MenuContainer will handle closing the menu
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

        {/* Mobile Navigation - New Stack Menu */}
        <div className="md:hidden flex items-center space-x-2">
           <Button
            onClick={handleGetStarted}
            size="sm"
            className="rounded-full px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
          >
            Get Started
          </Button>
          
          <MenuContainer className="relative z-50">
            <MenuItem 
              isToggle={true}
              aria-label="Toggle navigation menu"
              icon={
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute inset-0 transition-all duration-200 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_>div>&]:opacity-0 [div[data-expanded=true]_>div>&]:scale-90 [div[data-expanded=true]_>div>&]:-rotate-90">
                    <MenuIconLucide size={22} strokeWidth={2} />
                  </div>
                  <div className="absolute inset-0 transition-all duration-200 ease-in-out origin-center opacity-0 scale-90 rotate-90 [div[data-expanded=true]_>div>&]:opacity-100 [div[data-expanded=true]_>div>&]:scale-100 [div[data-expanded=true]_>div>&]:rotate-0">
                    <X size={22} strokeWidth={2} />
                  </div>
                </div>
              }
            />
            {/* Navigation items for the dropdown */}
            {navLinks.map((link) => (
              <MenuItem
                key={link.href + link.label} // Ensure unique key if hrefs can be same (like here)
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
