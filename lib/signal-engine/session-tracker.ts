import { CONFIG } from './config';

class SessionTracker {
  private asianHigh = -Infinity;
  private asianLow = Infinity;
  private asianRangeEstablished = false;
  private lastResetDate = '';

  private resetIfNewDay(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.lastResetDate !== today) {
      this.asianHigh = -Infinity;
      this.asianLow = Infinity;
      this.asianRangeEstablished = false;
      this.lastResetDate = today;
    }
  }

  update(price: number): void {
    this.resetIfNewDay();
    const nowHour = new Date().getUTCHours();
    if (nowHour < CONFIG.ASIAN_SESSION_END_UTC) {
      if (price > this.asianHigh) this.asianHigh = price;
      if (price < this.asianLow) this.asianLow = price;
    } else if (!this.asianRangeEstablished && this.asianLow < this.asianHigh) {
      this.asianRangeEstablished = true;
    }
  }

  getAsianRange(): [number, number, number] {
    if (this.asianRangeEstablished && this.asianLow < this.asianHigh) {
      return [this.asianLow, this.asianHigh, this.asianHigh - this.asianLow];
    }
    return [0, 0, 0];
  }

  isWithinTradingSession(): boolean {
    const nowHour = new Date().getUTCHours();
    return CONFIG.LONDON_NY_OVERLAP_START_UTC <= nowHour && nowHour < CONFIG.LONDON_NY_OVERLAP_END_UTC;
  }

  sessionWindowDescription(): string {
    return `${CONFIG.LONDON_NY_OVERLAP_START_UTC}:00 – ${CONFIG.LONDON_NY_OVERLAP_END_UTC}:00 UTC (London/NY overlap)`;
  }

  isWithinSessionWindow(): boolean {
    const nowHour = new Date().getUTCHours();
    return CONFIG.SESSION_START_UTC <= nowHour && nowHour < CONFIG.SESSION_END_UTC;
  }
}

export const sessionTracker = new SessionTracker();
