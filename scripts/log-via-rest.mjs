import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');
const saPath = join(projectRoot, 'aot-analyzer-bot-firebase-adminsdk-fbsvc-6ddb184d0e.json');
const sa = JSON.parse(readFileSync(saPath, 'utf8'));

const PROJECT_ID = sa.project_id;
const SCOPE = 'https://www.googleapis.com/auth/datastore';

function getAccessToken() {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sign = (data) => {
    const crypto = require('crypto');
    return crypto.sign('sha256', Buffer.from(data), sa.private_key).toString('base64url');
  };

  const msg = `${b64(header)}.${b64(claim)}`;
  const sig = sign(msg);
  const jwt = `${msg}.${sig}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const j = JSON.parse(data);
        if (j.access_token) resolve(j.access_token);
        else reject(new Error(data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function firestoreReq(token, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function makeDoc(collection, docId, fields) {
  const f = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') f[k] = { stringValue: v };
    else if (typeof v === 'number') f[k] = Number.isInteger(v) ? { integerValue: v } : { doubleValue: v };
    else if (typeof v === 'boolean') f[k] = { booleanValue: v };
    else if (v instanceof Date) f[k] = { timestampValue: v.toISOString() };
    else if (Array.isArray(v)) {
      if (v.length > 0 && typeof v[0] === 'object') {
        f[k] = { arrayValue: { values: v.map(item => ({ mapValue: { fields: serializeFields(item) } })) } };
      } else {
        f[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
      }
    }
    else if (typeof v === 'object') f[k] = { mapValue: { fields: serializeFields(v) } };
  }
  return { name: `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`, fields: f };
}

function serializeFields(obj) {
  const f = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') f[k] = { stringValue: v };
    else if (typeof v === 'number') f[k] = Number.isInteger(v) ? { integerValue: v } : { doubleValue: v };
    else if (typeof v === 'boolean') f[k] = { booleanValue: v };
    else if (v instanceof Date) f[k] = { timestampValue: v.toISOString() };
  }
  return f;
}

const SIGNALS = [
  {
    id: 'signal_20260721_victory_01', entry: 4083.00, exit: 4046.00,
    direction: 'SHORT', tp: 4046.00, sl: 4098.00, rr: 9.44,
    type: 'ema_bounce', confidence: 0.82,
  },
  {
    id: 'signal_20260721_victory_02', entry: 4085.90, exit: 4132.67,
    direction: 'LONG', tp: 4132.67, sl: 4051.28, rr: 1.35,
    type: 'session_breakout', confidence: 0.65,
  },
  {
    id: 'signal_20260721_victory_03', entry: 4080.10, exit: 4091.30,
    direction: 'LONG', tp: 4091.30, sl: 4052.03, rr: 1.30,
    type: 'trend_continuation', confidence: 0.60,
  },
];

async function main() {
  console.log('Getting access token...');
  const token = await getAccessToken();
  console.log('Got token, writing documents...');

  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 3600000);

  for (const s of SIGNALS) {
    const pnl = s.direction === 'LONG' ? s.exit - s.entry : s.entry - s.exit;
    const pnlPct = (pnl / s.entry) * 100;

    // Trade doc
    const tradeFields = {
      tradeId: `trade_victory_${s.id}`,
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
      trend: s.direction === 'LONG' ? 'UP' : 'DOWN',
      supportLevel: Math.min(s.entry, s.sl),
      resistanceLevel: Math.max(s.entry, s.tp),
      stopLoss: s.sl,
      takeProfit: s.tp,
      riskRewardRatio: s.rr,
      status: 'closed',
      journalNotes: `${s.type} — ${s.direction}. First live win.`,
      tradingConditions: '',
    };
    const tradeDoc = makeDoc('trades', `trade_victory_${s.id}`, tradeFields);
    const tResult = await firestoreReq(token, 'PATCH', `trades/trade_victory_${s.id}`, tradeDoc);
    console.log(`✅ Trade: ${tResult.name || 'created'}`);

    // Signal doc
    const signalFields = {
      userId: 'dashboard',
      timestamp: twelveHoursAgo,
      trend: s.direction === 'LONG' ? 'UP' : 'DOWN',
      stopLoss: s.sl,
      rrRatio: s.rr,
      tp1: s.tp,
      supportLevel: Math.min(s.entry, s.sl),
      resistanceLevel: Math.max(s.entry, s.tp),
      pullbackDetected: true,
      entryConfirmation: true,
      validUntil: new Date(now.getTime() + 48 * 3600000).toISOString(),
      confidence: s.confidence,
      description: `${s.type}: ${s.direction.toLowerCase()} trend, E1@${s.entry.toFixed(2)} TP${s.tp.toFixed(2)}(R:${s.rr.toFixed(1)})`,
      status: 'closed',
      outcome: 'won',
      confirmed: true,
      signal_type: s.type,
    };
    const signalDoc = makeDoc('signals', s.id, signalFields);
    const sResult = await firestoreReq(token, 'PATCH', `signals/${s.id}`, signalDoc);
    console.log(`✅ Signal: ${sResult.name || 'created'}`);
  }

  console.log(`\n🎉 All ${SIGNALS.length}/3 logged!`);
}

main().catch(err => console.error('FAILED:', err.message));
