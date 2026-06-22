'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, TrendingUp, FileText, Brain, Settings, LogOut, Shield, BookOpen, PieChart,
} from 'lucide-react';

const navigationItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { icon: TrendingUp, label: 'Trades', href: '/dashboard/trades' },
  { icon: BookOpen, label: 'Trading Journal', href: '/dashboard/journal' },
  { icon: PieChart, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Shield, label: 'Risk Management', href: '/dashboard/risk' },
  { icon: Brain, label: 'Learning', href: '/dashboard/learning' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-dark-sidebar border-r border-dark-border h-screen sticky top-0">
      <div className="p-4 border-b border-dark-border">
        <h1 className="text-text-primary font-bold text-lg">AOT Trader</h1>
        <p className="text-text-secondary text-label mt-1">AI-Powered Trading Intelligence</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-btn transition ${
                isActive
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                  : 'text-text-secondary hover:bg-dark-card hover:text-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-neon-green' : ''}`} />
              <span className="text-body">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dark-border p-3">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-dark-card hover:text-text-primary rounded-btn transition">
          <LogOut className="w-5 h-5" />
          <span className="text-body">Logout</span>
        </button>
      </div>
    </aside>
  );
};
