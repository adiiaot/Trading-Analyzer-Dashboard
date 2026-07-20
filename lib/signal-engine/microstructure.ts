import type { L2Metrics, L2Signal } from './l2-client';

export function evaluateMicrostructure(metrics: L2Metrics): L2Signal {
  if (!metrics.connected || metrics.levelsBid === 0 || metrics.levelsAsk === 0) {
    return { signal: 'neutral', probability: 0, evidence: ['No L2 data'] };
  }

  const evidence: string[] = [];
  let continuationScore = 0;
  let reversalScore = 0;

  const bidActive = metrics.addRateBid + metrics.cancelRateBid;
  const askActive = metrics.addRateAsk + metrics.cancelRateAsk;
  const totalActive = bidActive + askActive;

  // ── Continuation Model ──────────────────────────────────────────
  // bids entering faster than asks
  const addRatio = askActive > 0 ? metrics.addRateBid / metrics.addRateAsk : 2;
  if (addRatio > 1.5) {
    continuationScore += 30;
    evidence.push(`bids entering ${addRatio.toFixed(1)}x faster than asks`);
  }

  // spread tight
  const spreadBps = metrics.midPrice > 0 ? (metrics.spread / metrics.midPrice) * 10000 : 999;
  if (spreadBps < 1) {
    continuationScore += 25;
    evidence.push(`spread tight (${spreadBps.toFixed(2)}bps)`);
  } else if (spreadBps < 2) {
    continuationScore += 15;
  } else {
    continuationScore -= 10;
    evidence.push(`spread wide (${spreadBps.toFixed(2)}bps)`);
  }

  // activity high
  if (totalActive > 5) {
    continuationScore += 20;
    evidence.push(`high activity (${totalActive.toFixed(1)} evts/s)`);
  } else if (totalActive > 2) {
    continuationScore += 10;
    evidence.push(`moderate activity (${totalActive.toFixed(1)} evts/s)`);
  }

  // imbalance leans same direction (bullish)
  if (metrics.imbalance > 0.1) {
    continuationScore += 15;
    evidence.push(`bid-heavy book (${(metrics.imbalance * 100).toFixed(0)}% imbalance)`);
  } else if (metrics.imbalance < -0.1) {
    continuationScore -= 10;
  }

  // ── Reversal Model ──────────────────────────────────────────────
  // bid cancellations above 95th percentile
  if (metrics.cancel95thBid > 0 && metrics.cancelRateBid > metrics.cancel95thBid) {
    const cancelRatio = metrics.cancelRateBid / metrics.cancel95thBid;
    if (cancelRatio > 1.2) {
      reversalScore += 40;
      evidence.push(`bid cancels ${(cancelRatio * 100).toFixed(0)}% of 95th P`);
    } else {
      reversalScore += 20;
    }
  } else if (metrics.cancel95thBid > 0 && metrics.cancelRateBid > metrics.cancel95thBid * 0.8) {
    reversalScore += 10;
  }

  // new bids not replacing cancellations
  const cancelReplaceRatio = metrics.addRateBid > 0
    ? metrics.cancelRateBid / metrics.addRateBid
    : metrics.cancelRateBid > 0 ? 5 : 0;
  if (cancelReplaceRatio > 2) {
    reversalScore += 25;
    evidence.push(`cancellations ${cancelReplaceRatio.toFixed(1)}x additions (not replacing)`);
  } else if (cancelReplaceRatio > 1.2) {
    reversalScore += 10;
  }

  // ask-side strength (asks entering faster than bids during reversal)
  const askAddRatio = metrics.addRateBid > 0
    ? metrics.addRateAsk / metrics.addRateBid
    : metrics.addRateAsk > 0 ? 2 : 0;
  if (askAddRatio > 1.5) {
    reversalScore += 15;
    evidence.push(`asks entering ${askAddRatio.toFixed(1)}x faster than bids`);
  }

  // imbalance flipping or ask-heavy
  if (metrics.imbalance < -0.1) {
    reversalScore += 10;
    evidence.push(`ask-heavy book (${(metrics.imbalance * 100).toFixed(0)}% imbalance)`);
  }

  // ── Final Decision ──────────────────────────────────────────────
  const totalScore = continuationScore + reversalScore;
  if (totalScore === 0) {
    return { signal: 'neutral', probability: 50, evidence: ['Low activity — insufficient L2 data'] };
  }

  const continuationProb = totalScore > 0 ? (continuationScore / totalScore) * 100 : 0;
  const reversalProb = totalScore > 0 ? (reversalScore / totalScore) * 100 : 0;

  if (reversalProb > 60 && reversalScore > continuationScore) {
    return { signal: 'reversal', probability: Math.min(reversalProb, 95), evidence };
  }

  if (continuationProb > 60 && continuationScore > reversalScore) {
    return { signal: 'continuation', probability: Math.min(continuationProb, 95), evidence };
  }

  return { signal: 'neutral', probability: 50, evidence };
}
