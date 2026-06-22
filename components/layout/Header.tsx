'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Menu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-dark-bg text-text-primary border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-neon-green" />
          <span className="font-bold text-lg">Analyzer Bot</span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/dashboard" className="text-text-secondary hover:text-neon-green transition text-body">Dashboard</Link>
          <Link href="/dashboard/trades" className="text-text-secondary hover:text-neon-green transition text-body">Trades</Link>
          <Link href="/dashboard/journal" className="text-text-secondary hover:text-neon-green transition text-body">Journal</Link>
          <Link href="/dashboard/analytics" className="text-text-secondary hover:text-neon-green transition text-body">Analytics</Link>
          <Link href="/dashboard/risk" className="text-text-secondary hover:text-neon-green transition text-body">Risk</Link>
          <Link href="/dashboard/learning" className="text-text-secondary hover:text-neon-green transition text-body">Learning</Link>
        </nav>

        <button className="md:hidden text-text-secondary">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
