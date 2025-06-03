
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans, Geist_Mono, Poppins, Hind } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '700', '800'],
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '700', '900'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const hind = Hind({ // Serif-style font for Wise Dadi
  subsets: ['latin'],
  variable: '--font-hind',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Talkzi AI - Your Desi Bestie',
  description: 'AI-powered emotional support assistant for Gen Z in India.',
  manifest: '/manifest.json',
  themeColor: '#F5F8FF', // Updated to match new background
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'default',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${plusJakartaSans.variable} ${notoSans.variable} ${geistMono.variable} ${hind.variable}`}>
      <body className={`antialiased flex flex-col min-h-screen bg-background text-foreground font-poppins`}>
        <AuthProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Toaster />
          <Analytics /> 
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
