import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Trade, TradingStats, Signal } from '@/types';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const getAnalytics = async () => {
  if (typeof window !== 'undefined') {
    const { getAnalytics: ga } = await import('firebase/analytics');
    return ga(app);
  }
  return null;
};

export const getTrades = async (limitCount: number = 100): Promise<Trade[]> => {
  const q = query(
    collection(db, 'trades'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Trade);
};

export const getSignals = async (limitCount: number = 50): Promise<Signal[]> => {
  const q = query(
    collection(db, 'signals'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Signal);
};

export const calculateStats = (trades: Trade[]): TradingStats => {
  if (trades.length === 0) {
    return {
      total_trades: 0, wins: 0, losses: 0, win_rate: 0,
      total_pnl: 0, profit_factor: 0, avg_win: 0, avg_loss: 0,
      consecutive_wins: 0, consecutive_losses: 0,
    };
  }

  const wins = trades.filter(t => t.result === 'win');
  const losses = trades.filter(t => t.result === 'loss');
  const total_pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const win_pnl = wins.reduce((sum, t) => sum + t.pnl, 0);
  const loss_pnl = losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0);

  return {
    total_trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    win_rate: wins.length / trades.length,
    total_pnl: parseFloat(total_pnl.toFixed(2)),
    profit_factor: loss_pnl > 0 ? parseFloat((win_pnl / loss_pnl).toFixed(2)) : 0,
    avg_win: wins.length > 0 ? parseFloat((win_pnl / wins.length).toFixed(2)) : 0,
    avg_loss: losses.length > 0 ? parseFloat((loss_pnl / losses.length).toFixed(2)) : 0,
    consecutive_wins: 0,
    consecutive_losses: 0,
  };
};
