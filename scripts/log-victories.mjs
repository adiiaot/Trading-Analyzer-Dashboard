import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');

const serviceAccountPath = join(projectRoot, 'aot-analyzer-bot-firebase-adminsdk-fbsvc-6ddb184d0e.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const SIGNALS = [
  {
    id: 'signal_20260721_victory_01',
    entry: 4083.00,
    exit: 4046.00,
    direction: 'SHORT',
    tp: 4046.00,
    sl: 4098.00,
    rr: 9.44,
    type: 'ema_bounce',
    confidence: 0.82,
  },
  {
    id: 'signal_20260721_victory_02',
    entry: 4085.90,
    exit: 4132.67,
    direction: 'LONG',
    tp: 4132.67,
    sl: 4051.28,
    rr: 1.35,
    type: 'session_breakout',
    confidence: 0.65,
  },
  {
    id: 'signal_20260721_victory_03',
    entry: 4080.10,
    exit: 4091.30,
    direction: 'LONG',
    tp: 4091.30,
    sl: 4052.03,
    rr: 1.30,
    type: 'trend_continuation',
    confidence: 0.60,
  },
];

async function main() {
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 3600000);

  for (const s of SIGNALS) {
    const direction = s.direction;
    const pnl = direction === 'LONG' ? s.exit - s.entry : s.entry - s.exit;
    const pnlPct = (pnl / s.entry) * 100;

    // 1. Trade document
    const tradeId = `trade_victory_${s.id}`;
    const tradeData = {
      tradeId,
      userId: 'dashboard',
      timestamp: now,
      entryPrice: s.entry,
      exitPrice: s.exit,
      entrySize: 0.01,
      entryTime: twelveHoursAgo,
      exitTime: now,
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round(pnlPct * 100) / 100,
      result: 'win',
      trend: direction === 'LONG' ? 'UP' : 'DOWN',
      supportLevel: Math.min(s.entry, s.sl),
      resistanceLevel: Math.max(s.entry, s.tp),
      stopLoss: s.sl,
      takeProfit: s.tp,
      riskRewardRatio: s.rr,
      status: 'closed',
      holdTimeSeconds: null,
      journalNotes: `${s.type} — ${direction}. First live win.`,
      tradingConditions: '',
    };
    await db.collection('trades').doc(tradeId).set(tradeData);
    console.log(`✅ Trade saved: ${tradeId}`);

    // 2. Signal document
    const signalDoc = {
      userId: 'dashboard',
      timestamp: twelveHoursAgo,
      trend: direction === 'LONG' ? 'UP' : 'DOWN',
      entries: [
        {
          entryNumber: 1,
          price: s.entry,
          tp: s.tp,
          tpPips: Math.round(Math.abs(s.tp - s.entry) / 0.10),
          autoClose: false,
        },
      ],
      stopLoss: s.sl,
      rrRatio: s.rr,
      tp1: s.tp,
      tp2: null,
      signal_type: s.type,
      supportLevel: Math.min(s.entry, s.sl),
      resistanceLevel: Math.max(s.entry, s.tp),
      pullbackDetected: true,
      entryConfirmation: true,
      validUntil: new Date(now.getTime() + 48 * 3600000).toISOString(),
      confidence: s.confidence,
      description: `${s.type}: ${direction.toLowerCase()} trend, 1 entry: E1@${s.entry.toFixed(2)} TP${s.tp.toFixed(2)}(R:${s.rr.toFixed(1)})`,
      status: 'closed',
      outcome: 'won',
      confirmed: true,
      confirmedAt: now,
      orderType: s.id.includes('victory_01') || s.id.includes('victory_02') ? 'sell_limit' : 'buy_limit',
      entryTrigger: s.entry,
      deliveredVia: s.id.includes('victory_01') || s.id.includes('victory_02') ? 'telegram' : 'dashboard',
      deliveredAt: twelveHoursAgo.toISOString(),
    };
    await db.collection('signals').doc(s.id).set(signalDoc);
    console.log(`✅ Signal saved: ${s.id}`);
  }

  console.log(`\n🎉 All ${SIGNALS.length}/3 victories logged to Firestore!`);
}

main().catch(console.error);
