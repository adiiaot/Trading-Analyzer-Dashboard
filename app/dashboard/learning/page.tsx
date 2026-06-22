'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { LearningBot } from '@/components/ai/LearningBot';

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-h1 text-text-primary">Learning Hub</h1>
            <p className="text-text-secondary text-body">Ask questions about forex, gold trading, and trading concepts</p>
          </div>

          <LearningBot />
        </main>
      </div>
    </div>
  );
}
