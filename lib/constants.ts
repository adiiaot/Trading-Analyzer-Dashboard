export const ACCOUNT = {
  balance: 5245.50,
  available: 4890.25,
  usedMargin: 355.25,
  status: "Active" as const,
  holder: "Trader XAU",
  plan: "Premium Plan",
  demoLive: "Demo" as const,
  createdDate: "Jan 15, 2026",
  connection: "Connected",
};

export const PRICE = {
  symbol: "XAU/USD",
  price: 4073.42,
  change24h: 18.65,
  changePercent24h: 0.46,
  high24h: 4085.10,
  low24h: 4061.80,
  volume: 189200,
  bid: 4073.37,
  ask: 4073.47,
  spread: 0.5,
};

export const QUICK_STATS = {
  todayPnl: 67.30,
  winRate: 66.7,
  totalTrades: 42,
  openPositions: 3,
};

export const POSITIONS = [
  { direction: "BUY" as const, entry: 2035.20, current: 2041.35, pips: 61.5, pnl: 153.75, tp: 2045.00, sl: 2030.00 },
  { direction: "SELL" as const, entry: 2048.50, current: 2041.35, pips: 71.5, pnl: 178.75, tp: 2035.00, sl: 2055.00 },
  { direction: "BUY" as const, entry: 2038.00, current: 2041.35, pips: 33.5, pnl: 83.75, tp: 2048.00, sl: 2032.00 },
];

export const SIGNALS = [
  { id: 42, time: "2:45 PM", status: "PENDING" as const, confidence: 78, entries: ["2040.5", "2038.1", "2035.7"], pnl: null },
  { id: 41, time: "1:30 PM", status: "FILLING" as const, confidence: 72, entries: ["2042.0", "2039.5"], pnl: 22.50 },
  { id: 40, time: "4:30 PM", status: "CLOSED" as const, confidence: 85, entries: ["2038.5", "2036.1"], pnl: 45.20 },
  { id: 39, time: "3:15 PM", status: "EXPIRED" as const, confidence: 65, entries: ["2044.0", "2041.2"], pnl: null },
];

export const SENTIMENT = {
  usdStrength: 62,
  volatility: 45,
  riskSentiment: "Neutral" as const,
  events: [
    { time: "2:00 PM", event: "US GDP Data", impact: "HIGH" as const, xau: "Bullish" as const },
    { time: "4:30 PM", event: "Fed Speech", impact: "MEDIUM" as const, xau: "Neutral" as const },
  ],
};

export const TRADE_HISTORY = [
  { id: "#T042", date: "Jun 23", direction: "BUY" as const, entry: 2035.20, exit: 2041.35, pips: 61.5, pnl: 153.75, duration: "12m" },
  { id: "#T041", date: "Jun 23", direction: "SELL" as const, entry: 2048.50, exit: 2043.80, pips: 47.0, pnl: 117.50, duration: "8m" },
  { id: "#T040", date: "Jun 22", direction: "BUY" as const, entry: 2030.00, exit: 2042.10, pips: 121.0, pnl: 302.50, duration: "45m" },
  { id: "#T039", date: "Jun 22", direction: "SELL" as const, entry: 2050.00, exit: 2048.20, pips: 18.0, pnl: 45.00, duration: "5m" },
  { id: "#T038", date: "Jun 21", direction: "BUY" as const, entry: 2038.50, exit: 2036.00, pips: -25.0, pnl: -62.50, duration: "15m" },
];

export const ACCOUNT_STATS = {
  deposits: 5000.00,
  withdrawals: 0,
  netProfit: 245.50,
  roi: 4.91,
  tradingDays: 28,
};

export const SESSION = {
  days: "Tuesday - Thursday",
  time: "3:00 PM - 5:00 PM",
  next: "Tomorrow 3:00 PM",
  used: 1,
  max: 2,
};

export const ECON_EVENTS: {
  date: string; time: string; event: string; forecast: string; prev: string; impact: string; xau: string;
}[] = [
  { date: "2026-06-25", time: "8:30 AM", event: "Jobless Claims", forecast: "235K", prev: "242K", impact: "MEDIUM", xau: "Neutral" },
  { date: "2026-06-25", time: "10:00 AM", event: "Home Sales", forecast: "4.15M", prev: "4.10M", impact: "LOW", xau: "Bearish" },
  { date: "2026-06-26", time: "8:30 AM", event: "Core PCE", forecast: "2.7%", prev: "2.8%", impact: "HIGH", xau: "Bullish" },
  { date: "2026-06-26", time: "9:45 AM", event: "Chicago PMI", forecast: "49.5", prev: "48.2", impact: "MEDIUM", xau: "Neutral" },
];

export const JOURNAL_ENTRIES: {
  date: string; pair: string; dir: string; entry: number; exit: number; pips: number; pnl: number; setup: string; emoji: string; tag: string;
}[] = [
  { date: "2026-06-24", pair: "XAU/USD", dir: "BUY", entry: 2040.5, exit: 2047.8, pips: 7.3, pnl: 36.50, setup: "Rejection at S1 + bullish engulfing", emoji: "Focused", tag: "Trend Following" },
  { date: "2026-06-23", pair: "XAU/USD", dir: "SELL", entry: 2055.2, exit: 2048.0, pips: 7.2, pnl: 36.00, setup: "Double top at R2, bearish RSI div", emoji: "Calm", tag: "Reversal" },
  { date: "2026-06-23", pair: "XAU/USD", dir: "BUY", entry: 2038.1, exit: 2035.5, pips: -2.6, pnl: -13.00, setup: "Breakout fakeout, should have waited", emoji: "Impatient", tag: "Fakeout" },
];
