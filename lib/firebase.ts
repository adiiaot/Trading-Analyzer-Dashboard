import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import type { Trade, TradingStats, Signal } from '@/types';

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
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
};

export const getSignals = async (limitCount: number = 50): Promise<Signal[]> => {
  const q = query(
    collection(db, 'signals'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Signal));
};

export const subscribeTrades = (callback: (trades: Trade[]) => void, onError?: () => void) => {
  const q = query(collection(db, 'trades'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
    callback(trades);
  }, () => onError?.());
};

export const subscribeSignals = (callback: (signals: Signal[]) => void, onError?: () => void) => {
  const q = query(collection(db, 'signals'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Signal));
    callback(signals);
  }, () => onError?.());
};

export const subscribeEconCalendar = (callback: (events: any[]) => void) => {
  const q = query(collection(db, 'econCalendar'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(events);
  }, () => callback([]));
};

export const subscribeAnalytics = (callback: (analytics: any[]) => void) => {
  const q = query(collection(db, 'analytics'), orderBy('periodStart', 'desc'), limit(10));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, () => callback([]));
};

export const subscribeJournalEntries = (callback: (entries: any[]) => void) => {
  const q = query(collection(db, 'journal'), orderBy('date', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(entries);
  }, () => callback([]));
};

export const addTrade = async (trade: Omit<Trade, 'id'>) => {
  const docRef = await addDoc(collection(db, 'trades'), {
    ...trade,
    timestamp: trade.timestamp || Timestamp.now().toDate().toISOString(),
  });
  return docRef.id;
};

export const updateTrade = async (id: string, data: Partial<Trade>) => {
  await updateDoc(doc(db, 'trades', id), data);
};

export const deleteTrade = async (id: string) => {
  await deleteDoc(doc(db, 'trades', id));
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
  const total_pnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const win_pnl = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const loss_pnl = losses.reduce((sum, t) => sum + Math.abs(t.pnl ?? 0), 0);

  return {
    total_trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    win_rate: trades.length > 0 ? wins.length / trades.length : 0,
    total_pnl: parseFloat(total_pnl.toFixed(2)),
    profit_factor: loss_pnl > 0 ? parseFloat((win_pnl / loss_pnl).toFixed(2)) : 0,
    avg_win: wins.length > 0 ? parseFloat((win_pnl / wins.length).toFixed(2)) : 0,
    avg_loss: losses.length > 0 ? parseFloat((loss_pnl / losses.length).toFixed(2)) : 0,
    consecutive_wins: 0,
    consecutive_losses: 0,
  };
};
