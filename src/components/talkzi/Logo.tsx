// To change the logo, you can edit the SVG markup in this file.
// For complex graphical logos, you might replace this entire component
// with an <img /> tag pointing to an image file, or embed new SVG paths.

// Usage:
// Import the Logo component: import { Logo } from '@/components/talkzi/Logo';
// To control size, pass Tailwind classes or width/height props:
// e.g., <Logo className="h-8 w-auto" /> or <Logo width={120} height={36} />
// The colors (primary and accent) are sourced from CSS variables defined in globals.css.

import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 30" // Adjusted viewBox slightly if needed for larger font
      width="100" // Default width, can be overridden by props or CSS
      height="30" // Default height, can be overridden by props or CSS
      aria-label="Talkzii Logo"
      {...props} // Spread props to allow className, width, height, etc.
    >
      <defs>
        <linearGradient id="talkziGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dy=".35em" // Ensures vertical centering
        textAnchor="middle"
        fontSize="26" // Slightly increased from a potential previous smaller size
        fontFamily="Poppins, var(--font-geist-sans), Satoshi, Arial, sans-serif" // Poppins prioritized
        fontWeight="bold"
        fill="url(#talkziGradient)"
      >
        Talkzii
      </text>
    </svg>
  );
}
