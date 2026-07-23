# AOT Analyzer — Dashboard

Next.js 14 dashboard for the AOT Analyzer — live XAU/USD signals, compounding tracker, session P&L, trade journal, analytics, and backtesting.

## Dashboard Pages

| Route | What it does |
|-------|-------------|
| `/` | Landing page with AOT branding and Enter Dashboard CTA |
| `/dashboard` | Live chart, quick stats, compounding summary, session P&L, open positions, signal feed |
| `/dashboard/analytics` | P&L breakdown, win rate, profit factor, trade history |
| `/dashboard/signals` | On-demand signal generator, SignalResultCard with lot sizing + margin display, Confirm/Won-Lost/Generate Next |
| `/dashboard/compounding` | Cycle tracker, position size calculator, leverage setting (1:2000), cycle roadmap, target goal projection, withdrawals log |
| `/dashboard/journal` | Trades as journal cards, filter by win/loss, stats summary |
| `/dashboard/backtest` | Walk-forward backtest simulator with Monte Carlo option |
| `/dashboard/learning` | AI chat (Learn mode + Analyze Chart with screenshot upload) |
| (settings removed) | Balance available site-wide via localStorage |

## Getting Started

```bash
npm install
npm run dev
```

Create `web/.env.local` from `.env.example` with Firebase Web SDK config and bot URL.

## Key Features

- **Glassmorphism design** — responsive mobile-first dark theme (#080c24 base, #f0b429 gold accent)
- **Live data** — Firestore subscriptions with API fallback, no mock data
- **Signal engine** — 3-tier 15M (EMA bounce · consolidation breakout · trend continuation) with ML bias, L2 microstructure pre-filter, ADX · RSI · BB indicators, 60s candle cache
- **User-controlled lot sizing** — editable input with real-time margin + pip value
- **Session P&L tracking** — groups consecutive signals, auto-expires after 30 min
- **Compounding planner** — leverage-aware cycle growth projection with target goals
- **Price** — fetches directly from Hyperliquid (no API key needed)
- **Responsive** — collapsible sidebar, slide-over mobile nav
- **Shared balance** — persisted to localStorage, synced across all pages
