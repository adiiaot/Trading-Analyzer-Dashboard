export interface Trade {
  id: string;
  timestamp: string;
  entryPrice: number;
  exitPrice: number;
  entrySize: number;
  entryTime: string;
  exitTime?: string;
  pnl?: number;
  pnlPercent?: number;
  result?: 'win' | 'loss' | 'break_even';
  status: 'open' | 'closed' | 'cancelled';
  trend: 'UP' | 'DOWN';
  supportLevel: number;
  resistanceLevel: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  signalId?: string;
  userId?: string;
  journalNotes?: string;
  tradingConditions?: string;
  holdTimeSeconds?: number;
  analysis?: {
    performanceReason?: string;
    howSignalBenefited?: string;
    improvements?: string[];
    confidence?: number;
  };
}

export interface Signal {
  id: string;
  timestamp: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  entries: SignalEntry[];
  supportLevel: number;
  resistanceLevel: number;
  pullbackDetected: boolean;
  entryConfirmation: boolean;
  validUntil: string;
  confidence: number;
  status: 'active' | 'expired' | 'pending' | 'closed';
  userId?: string;
  signalId?: string;
  executedEntries?: number[];
  deliveredVia?: string;
  deliveredAt?: string;
  acknowledged?: boolean;
  analysis?: {
    reasonGenerated?: string;
    confidence_breakdown?: {
      trend_strength: number;
      level_proximity: number;
      volatility_score: number;
      reversal_pattern_quality: number;
    };
  };
}

export interface SignalEntry {
  entryNumber: number;
  price: number;
  tp: number;
  tpPips: number;
  autoClose: boolean;
}

export interface TradingStats {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  consecutive_wins: number;
  consecutive_losses: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  timestamp: string;
  source?: string;
  notes: string;
  sentiment?: string;
  analysis?: {
    theme?: string;
    actionItems?: string[];
    relatedSignals?: string[];
  };
  relatedTradeId?: string;
}

export interface EconEvent {
  id: string;
  title: string;
  timestamp: number;
  impact: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
  currency?: string;
  description?: string;
  goldPrediction?: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    explanation: string;
  };
}

export interface BriefData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  activeSignals: number;
  activeSignalDetails: { trend: string; confidence: number; entry: number }[];
  todayTrades: { count: number; wins: number; losses: number; totalPnl: number };
  sessionWindow: string;
}
