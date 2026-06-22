import { Trade, TradingStats, Signal } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:8000';

export const apiClient = {
  async getTrades(limit = 100): Promise<Trade[]> {
    const res = await fetch(`${API_BASE}/api/trades?limit=${limit}`);
    const data = await res.json();
    return data.trades || [];
  },

  async getStats(): Promise<TradingStats> {
    const res = await fetch(`${API_BASE}/api/stats`);
    const data = await res.json();
    return data.stats || {};
  },

  async getSignals(limit = 50): Promise<Signal[]> {
    const res = await fetch(`${API_BASE}/api/signal?limit=${limit}`);
    const data = await res.json();
    return data.signals || [];
  },

  async getSignal(signalId: string): Promise<Signal | null> {
    const res = await fetch(`${API_BASE}/api/signal/${signalId}`);
    if (!res.ok) return null;
    return res.json();
  },

  async analyzeTrade(trade: Trade, signal?: Signal) {
    const res = await fetch('/api/analyze-trade-nvidia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade, signal }),
    });
    return res.json();
  },

  async askLearningBot(question: string, conversationHistory: any[] = []) {
    const res = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, conversationHistory }),
    });
    return res.json();
  },
};
