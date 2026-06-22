'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <TrendingUp className="w-16 h-16 text-neon-green mx-auto" />
        <h1 className="text-4xl font-bold text-text-primary">Analyzer Bot</h1>
        <p className="text-text-secondary">AI-Powered Trading Intelligence</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-neon-green hover:bg-neon-green-hover text-dark-bg font-bold px-8 py-3 rounded-btn transition"
        >
          Enter Dashboard
        </button>
      </div>
    </main>
  );
}
