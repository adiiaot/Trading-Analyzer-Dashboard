# Analyzer Dashboard

> **Live:** [analyzer-dashboard-kohl.vercel.app](https://analyzer-dashboard-kohl.vercel.app)

Next.js 14 dashboard for the AOT Analyzer Bot — real-time trading signals, AI-powered trade analysis, and chart screenshot verification.

## Features

- **Dashboard** — Performance overview with stats cards and charts (Recharts)
- **Trade Log** — Filterable trade history table
- **AI Trade Analyzer** — Analyze trades with Nvidia Llama 3.3 70B
- **Screenshot Upload** — Upload chart screenshots for dual AI verification
- **Learning Q&A** — Ask questions about trading strategies
- **Firebase Firestore** — Real-time data sync

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Recharts · Firebase Web SDK · Framer Motion · Axios

## Getting Started

```bash
npm install
npm run dev
```

Create `web/.env.local` with your Firebase config and API keys.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `BOT_API_URL` | Analyzer bot API base URL |
| `NVIDIA_API_KEY` | Nvidia NIM API key |

## Project Structure

```
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Home / landing
│   ├── dashboard/
│   │   ├── page.tsx          # Overview with stats & charts
│   │   ├── trades/page.tsx   # Trade history table
│   │   ├── analytics/page.tsx # Charts & AI analysis
│   │   └── learning/page.tsx # Q&A chatbot
│   └── api/                  # Next.js API routes
│       ├── trades/
│       ├── stats/
│       ├── analyze-trade-nvidia/
│       ├── learn/
│       ├── analyze-screenshot/
│       └── verification-history/
├── components/
│   ├── layout/               # Header, Sidebar
│   ├── dashboard/            # StatsCards, PerformanceChart
│   ├── trades/               # TradeTable, TradeFilters
│   ├── ai/                   # TradeAnalyzer, LearningBot, ScreenshotAnalyzer
│   └── ui/                   # Card, Button, Tabs, Spinner
├── lib/                      # Firebase config, API client, formatters
├── types/                    # TypeScript interfaces
├── public/                   # Static assets
└── .env.local                # Local environment variables (gitignored)
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trades` | Fetch all trades |
| GET | `/api/stats` | Fetch trading stats |
| POST | `/api/analyze-trade-nvidia` | AI trade analysis |
| POST | `/api/learn` | Learning Q&A query |
| POST | `/api/analyze-screenshot` | Upload & verify screenshot |
| GET | `/api/verification-history` | Screenshot verification log |

---

*Part of the AOT Analyzer Bot system.*
