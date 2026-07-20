import { CONFIG } from './config';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export interface L2Level {
  px: number;
  sz: number;
  n: number;
}

export interface PerSecondCounts {
  ts: number;
  bidAdds: number;
  bidCancels: number;
  askAdds: number;
  askCancels: number;
  totalEvents: number;
}

export interface L2Metrics {
  imbalance: number;
  spread: number;
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  bidDepth: number;
  askDepth: number;
  cancelRateBid: number;
  cancelRateAsk: number;
  addRateBid: number;
  addRateAsk: number;
  cancel95thBid: number;
  totalActivity: number;
  connected: boolean;
  levelsBid: number;
  levelsAsk: number;
}

export interface L2Signal {
  signal: 'continuation' | 'reversal' | 'neutral';
  probability: number;
  evidence: string[];
}

type Subscriber = (metrics: L2Metrics) => void;

class L2WebSocketClient {
  private ws: WebSocket | null = null;
  private bids: Map<number, L2Level> = new Map();
  private asks: Map<number, L2Level> = new Map();
  private buckets: PerSecondCounts[] = [];
  private currentBucket: PerSecondCounts | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 16000;
  private baseReconnectDelay = 1000;
  private rollingWindowSec = 60;
  private subscribers: Set<Subscriber> = new Set();
  private _connected = false;
  private lastSnapshot: { bids: L2Level[]; asks: L2Level[] } | null = null;
  private midPriceHistory: number[] = [];
  private lastBucketRotation = 0;

  get connected(): boolean {
    return this._connected;
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    try {
      this.ws = new WebSocket(WS_URL);
    } catch (e) {
      console.error('[L2] WebSocket creation failed:', e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[L2] Connected');
      this._connected = true;
      this.reconnectAttempts = 0;
      this.send({ method: 'subscribe', subscription: { type: 'l2Book', coin: CONFIG.GOLD_SYMBOL } });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string);
        this.handleMessage(msg);
      } catch (e) {
        console.warn('[L2] Parse error:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[L2] Disconnected');
      this._connected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = (e) => {
      console.warn('[L2] Error:', e);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this.bids.clear();
    this.asks.clear();
    this.buckets = [];
    this.currentBucket = null;
    this.midPriceHistory = [];
    this.reconnectAttempts = 0;
  }

  subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  getMetrics(): L2Metrics | null {
    if (!this._connected || this.bids.size === 0 || this.asks.size === 0) return null;

    const bestBid = Math.max(...Array.from(this.bids.keys()));
    const bestAsk = Math.min(...Array.from(this.asks.keys()));
    const midPrice = (bestBid + bestAsk) / 2;
    const spread = bestAsk - bestBid;

    let bidDepth = 0;
    let askDepth = 0;
    let levelsBid = 0;
    let levelsAsk = 0;
    this.bids.forEach((l) => { bidDepth += l.sz; levelsBid++; });
    this.asks.forEach((l) => { askDepth += l.sz; levelsAsk++; });

    const totalSize = bidDepth + askDepth;
    const imbalance = totalSize > 0 ? (bidDepth - askDepth) / totalSize : 0;

    const window = this.rollingWindowSec;
    const recentBuckets = this.buckets.slice(-window);
    const cancelBids = recentBuckets.map(b => b.bidCancels);
    const cancelAsks = recentBuckets.map(b => b.askCancels);
    const addBids = recentBuckets.map(b => b.bidAdds);
    const addAsks = recentBuckets.map(b => b.askAdds);
    const totalEvents = recentBuckets.reduce((s, b) => s + b.totalEvents, 0);

    const avgCancelBid = cancelBids.length > 0 ? cancelBids.reduce((a, b) => a + b, 0) / cancelBids.length : 0;
    const avgCancelAsk = cancelAsks.length > 0 ? cancelAsks.reduce((a, b) => a + b, 0) / cancelAsks.length : 0;
    const avgAddBid = addBids.length > 0 ? addBids.reduce((a, b) => a + b, 0) / addBids.length : 0;
    const avgAddAsk = addAsks.length > 0 ? addAsks.reduce((a, b) => a + b, 0) / addAsks.length : 0;

    const sortedCancelsBid = [...cancelBids].sort((a, b) => a - b);
    const p95Index = Math.min(Math.floor(sortedCancelsBid.length * 0.95), sortedCancelsBid.length - 1);
    const cancel95thBid = sortedCancelsBid.length > 0 ? sortedCancelsBid[p95Index] : 0;

    return {
      imbalance,
      spread,
      midPrice,
      bestBid,
      bestAsk,
      bidDepth,
      askDepth,
      cancelRateBid: avgCancelBid,
      cancelRateAsk: avgCancelAsk,
      addRateBid: avgAddBid,
      addRateAsk: avgAddAsk,
      cancel95thBid,
      totalActivity: totalEvents / Math.max(recentBuckets.length, 1),
      connected: this._connected,
      levelsBid,
      levelsAsk,
    };
  }

  getSnapshot(): { bids: L2Level[]; asks: L2Level[] } | null {
    if (this.bids.size === 0 && this.asks.size === 0) return this.lastSnapshot;
    const bids = Array.from(this.bids.values()).sort((a, b) => b.px - a.px);
    const asks = Array.from(this.asks.values()).sort((a, b) => a.px - b.px);
    this.lastSnapshot = { bids, asks };
    return { bids, asks };
  }

  private send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(msg: Record<string, unknown>): void {
    const data = msg?.data as Record<string, unknown> | undefined;
    if (!data) return;

    const coin = data.coin as string;
    if (coin !== CONFIG.GOLD_SYMBOL) return;

    const levels = data.levels as Array<Array<Record<string, string>>> | undefined;
    const changes = data.changes as Array<[string, string, string]> | undefined;

    if (levels) {
      this.handleSnapshot(levels);
    } else if (changes) {
      this.handleChanges(changes);
    }

    this.notifySubscribers();
  }

  private handleSnapshot(levels: Array<Array<Record<string, string>>>): void {
    this.bids.clear();
    this.asks.clear();

    if (levels.length >= 1) {
      for (const raw of levels[0]) {
        const px = parseFloat(raw.px);
        const sz = parseFloat(raw.sz);
        const n = parseInt(String(raw.n || '0'), 10);
        if (!isNaN(px) && !isNaN(sz)) {
          this.bids.set(px, { px, sz, n });
        }
      }
    }

    if (levels.length >= 2) {
      for (const raw of levels[1]) {
        const px = parseFloat(raw.px);
        const sz = parseFloat(raw.sz);
        const n = parseInt(String(raw.n || '0'), 10);
        if (!isNaN(px) && !isNaN(sz)) {
          this.asks.set(px, { px, sz, n });
        }
      }
    }
  }

  private handleChanges(changes: Array<[string, string, string]>): void {
    const now = Math.floor(Date.now() / 1000);
    this.ensureBucket(now);

    for (const [side, pxStr, szStr] of changes) {
      const px = parseFloat(pxStr);
      const sz = parseFloat(szStr);
      if (isNaN(px) || isNaN(sz)) continue;

      const isBid = side === 'B';
      const map = isBid ? this.bids : this.asks;
      const existing = map.get(px);

      if (sz === 0) {
        if (existing) {
          map.delete(px);
          if (isBid) { this.currentBucket!.bidCancels++; }
          else { this.currentBucket!.askCancels++; }
          this.currentBucket!.totalEvents++;
        }
      } else {
        if (!existing) {
          map.set(px, { px, sz, n: 1 });
          if (isBid) { this.currentBucket!.bidAdds++; }
          else { this.currentBucket!.askAdds++; }
          this.currentBucket!.totalEvents++;
        } else if (existing.sz !== sz) {
          if (sz > existing.sz) {
            if (isBid) { this.currentBucket!.bidAdds++; }
            else { this.currentBucket!.askAdds++; }
          } else {
            if (isBid) { this.currentBucket!.bidCancels++; }
            else { this.currentBucket!.askCancels++; }
          }
          existing.sz = sz;
          existing.n = Math.max(existing.n, 1);
          this.currentBucket!.totalEvents++;
        }
      }

      const midPrice = this.computeMidPrice();
      if (midPrice > 0 && this.currentBucket!.ts !== this.lastBucketRotation) {
        this.midPriceHistory.push(midPrice);
        if (this.midPriceHistory.length > 300) this.midPriceHistory.shift();
        this.lastBucketRotation = this.currentBucket!.ts;
      }
    }
  }

  private ensureBucket(now: number): void {
    if (!this.currentBucket || now !== this.currentBucket.ts) {
      if (this.currentBucket) {
        this.buckets.push(this.currentBucket);
        if (this.buckets.length > 300) this.buckets.shift();
      }
      this.currentBucket = { ts: now, bidAdds: 0, bidCancels: 0, askAdds: 0, askCancels: 0, totalEvents: 0 };
    }
  }

  private computeMidPrice(): number {
    if (this.bids.size === 0 || this.asks.size === 0) return 0;
    const bestBid = Math.max(...Array.from(this.bids.keys()));
    const bestAsk = Math.min(...Array.from(this.asks.keys()));
    return (bestBid + bestAsk) / 2;
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    this.reconnectAttempts++;
    console.log(`[L2] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  private notifySubscribers(): void {
    const metrics = this.getMetrics();
    if (!metrics) return;
    this.subscribers.forEach((cb) => {
      try { cb(metrics); } catch (e) { console.warn('[L2] Subscriber error:', e); }
    });
  }
}

export const l2Client = new L2WebSocketClient();
