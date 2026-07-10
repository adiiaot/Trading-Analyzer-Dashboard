export const PRICE = {
  symbol: "XAU/USD",
  price: 4088.385,
  change24h: 22.10,
  changePercent24h: 0.54,
  high24h: 4092.40,
  low24h: 4075.80,
  volume: 195400,
  bid: 4088.335,
  ask: 4088.435,
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
