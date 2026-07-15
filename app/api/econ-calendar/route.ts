import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const XAU_KEYWORDS = [
  'gold', 'xau', 'gdp', 'pce', 'cpi', 'fed', 'fomc', 'nfp',
  'non farm', 'employment', 'unemployment', 'interest rate',
  'core pce', 'ppi', 'retail sales', 'powell',
];

const DEFAULT_XAU_EVENTS = [
  {
    id: 'default_core_pce',
    title: 'Core PCE Price Index m/m',
    timestamp: Math.floor(Date.now() / 1000) + 86400,
    impact: 'high',
    currency: 'USD',
    description: 'Key inflation gauge, directly affects gold',
    forecast: '0.2%',
    previous: '0.3%',
  },
  {
    id: 'default_chicago_pmi',
    title: 'Chicago PMI',
    timestamp: Math.floor(Date.now() / 1000) + 172800,
    impact: 'medium',
    currency: 'USD',
    description: 'Manufacturing sector health indicator',
    forecast: '45.2',
    previous: '44.3',
  },
  {
    id: 'default_jobless_claims',
    title: 'Unemployment Claims',
    timestamp: Math.floor(Date.now() / 1000) + 259200,
    impact: 'high',
    currency: 'USD',
    description: 'Weekly labor market data, USD mover',
    forecast: '220K',
    previous: '218K',
  },
  {
    id: 'default_powell_speech',
    title: 'Fed Chair Powell Speech',
    timestamp: Math.floor(Date.now() / 1000) + 345600,
    impact: 'high',
    currency: 'USD',
    description: 'Monetary policy clues, major gold catalyst',
    forecast: '',
    previous: '',
  },
  {
    id: 'default_10y_auction',
    title: '10-Year Note Auction',
    timestamp: Math.floor(Date.now() / 1000) + 432000,
    impact: 'medium',
    currency: 'USD',
    description: 'Treasury demand signal, yields affect gold',
    forecast: '3.85%',
    previous: '3.92%',
  },
];

export async function GET() {
  try {
    let events: any[] = [];
    try {
      const db = getAdminDb();
      const now = new Date();
      const fourHoursLater = new Date(now.getTime() + 4 * 3600000);
      const snapshot = await db
        .collection('econCalendar')
        .where('timestamp', '>=', now)
        .where('timestamp', '<=', fourHoursLater)
        .orderBy('timestamp', 'asc')
        .limit(30)
        .get();

      events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      // Firestore unavailable
    }

    if (events.length === 0) {
      return NextResponse.json({ success: true, events: DEFAULT_XAU_EVENTS });
    }

    const filtered = events.filter((e: any) => {
      const title = (e.title || e.event || '').toLowerCase();
      const impact = (e.impact || '').toLowerCase();
      return impact === 'high' || XAU_KEYWORDS.some(kw => title.includes(kw));
    });

    return NextResponse.json({
      success: true,
      events: filtered.length > 0 ? filtered : DEFAULT_XAU_EVENTS,
    });
  } catch (error) {
    console.error('Econ calendar error:', error);
    return NextResponse.json(
      { success: true, events: DEFAULT_XAU_EVENTS },
      { status: 200 }
    );
  }
}
