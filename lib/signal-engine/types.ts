export enum TrendEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  NEUTRAL = 'NEUTRAL',
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalEntry {
  entry_number: number;
  price: number;
  tp: number;
  tp_pips: number;
  auto_close: boolean;
}

export interface SignalResult {
  id: string;
  timestamp: Date;
  trend: TrendEnum;
  entries: SignalEntry[];
  stop_loss: number;
  support_level: number;
  resistance_level: number;
  pullback_detected: boolean;
  entry_confirmation: boolean;
  valid_until: Date;
  confidence: number;
  rr_ratio: number;
  description: string | null;
  signal_type: string | null;
  tp1: number | null;
  tp2: number | null;
  macro_trend: string | null;
  order_type?: 'market' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  entry_trigger?: number;
  mt5_entry_price?: number | null;
  mt5_exit_price?: number | null;
  mt5_slippage?: number | null;
}

export interface MacroTrend {
  trend: string;
  price_sma_pct: number;
  sma50: number;
}

export interface RegimeOverrides {
  adx_value?: number;
  atr_ratio?: number;
  volatility_regime?: string;
  trend_regime?: string;
  regime_name?: string;
  sl_atr_multiple?: number;
  max_dist_atr?: number;
  min_dist_atr?: number;
  min_rrr?: number;
  momentum_min_rising?: number;
  regime_adx_threshold?: number;
  momentum_required?: number;
  tp_fallback_r?: number;
}

export interface NewsEvent {
  timestamp: number;
  title: string;
  impact: string;
  currency?: string;
  forecast?: string;
  previous?: string;
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

export interface TradeLogRequest {
  entryPrice: number;
  exitPrice: number;
  direction: 'LONG' | 'SHORT';
  result: 'win' | 'loss';
  quantity?: number;
  notes?: string;
  signalId?: string;
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
