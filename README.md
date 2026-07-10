# Analyzer Dashboard

Next.js 14 dashboard for the AOT Analyzer Bot — live XAU/USD signals, trade journal, analytics, and AI learning hub.

## Dashboard Pages

| Route | What it does |
|-------|-------------|
| `/dashboard` | Live TradingView chart, quick stats, account card, open positions, signal feed |
| `/dashboard/analytics` | P&L breakdown, win rate, profit factor, trade history |
| `/dashboard/signals` | Active signals with entry levels, signal history table, alert settings |
| `/dashboard/journal` | Trades displayed as journal cards, filter by win/loss, stats summary |
| `/dashboard/backtest` | Walk-forward backtest simulator with Monte Carlo option |
| `/dashboard/learning` | AI chat (Learn mode + Analyze Chart with screenshot upload) |
| `/dashboard/settings` | Balance editing, risk parameters, position calculator, AI Risk Wizard |

## Getting Started

```bash
npm install
npm run dev
```

Create `web/.env.local` from `.env.example` with Firebase Web SDK config and bot URL.

## Key Features

- **Glassmorphism design** — responsive mobile-first dark/light theme
- **Live data** — Firestore subscriptions with API fallback, no mock data
- **Price** — fetches directly from Hyperliquid (no API key needed)
- **Responsive** — fully adaptive to all screen sizes
- **Shared balance** — persisted to localStorage, synced across all pages
