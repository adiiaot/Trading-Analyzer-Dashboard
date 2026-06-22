export interface Trade {
  id: string;
  timestamp: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_percent: number;
  result: 'win' | 'loss';
  signal_id?: string;
  notes?: string;
  hold_time_seconds?: number;
}

export interface Signal {
  id: string;
  timestamp: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  entries: SignalEntry[];
  support_level: number;
  resistance_level: number;
  pullback_detected: boolean;
  entry_confirmation: boolean;
  valid_until: string;
  confidence: number;
  executed: boolean;
}

export interface SignalEntry {
  price: number;
  tp: number;
  tp_pips: number;
  auto_close: boolean;
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

export interface AnalysisRequest {
  trade_id: string;
  trade: Trade;
}

export interface AnalysisResult {
  trade_id: string;
  analysis: string;
  improvements: string[];
  confidence: number;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LearningTopic {
  question: string;
  answer: string;
  topic: 'forex' | 'gold' | 'trading' | 'risk_management';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface VerificationResult {
  verified: boolean;
  score: number;
  confidence_boost: string;
  data_source: string;
  discrepancies: string[];
  vision_confidence: number;
}

export interface ScreenshotAnalysisResult {
  success: boolean;
  signal?: Signal;
  mode: 'api_only' | 'api_with_screenshot';
  final_confidence?: number;
  verification: VerificationResult;
  message: string;
}
