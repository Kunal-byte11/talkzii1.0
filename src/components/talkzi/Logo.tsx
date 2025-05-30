import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 30"
      width="100"
      height="30"
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
        dy=".35em"
        textAnchor="middle"
        fontSize="24"
        fontFamily="var(--font-geist-sans), Poppins, Satoshi, Arial, sans-serif"
        fontWeight="bold"
        fill="url(#talkziGradient)"
      >
        Talkzii
      </text>
    </svg>
  );
}

