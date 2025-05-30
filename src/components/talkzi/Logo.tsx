// To change the logo, you can edit the SVG markup in this file.
// For complex graphical logos, you might replace this entire component
// with an <img /> tag pointing to an image file, or embed new SVG paths.

import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 30" // Adjusted viewBox slightly if needed for larger font
      width="100" // Can be overridden by props
      height="30" // Can be overridden by props
      aria-label="Talkzii Logo"
      {...props}
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
