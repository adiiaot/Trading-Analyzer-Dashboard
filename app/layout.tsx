import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analyzer Bot Dashboard',
  description: 'XAU/USD Trading Signal Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-bg">
        {children}
      </body>
    </html>
  );
}
