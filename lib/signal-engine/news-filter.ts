import { NewsEvent } from './types';
import { CONFIG } from './config';

const HIGH_IMPACT_KEYWORDS = [
  'NFP', 'CPI', 'PCE', 'FOMC', 'GDP', 'Retail Sales',
  'Non Farm', 'Employment', 'Unemployment', 'Fed',
  'Interest Rate', 'Core PCE', 'PPI',
];

export async function checkNewsBlocked(fetchEvents: () => Promise<NewsEvent[]>): Promise<{ blocked: boolean; reason: string }> {
  const now = Date.now() / 1000;
  const blockBefore = CONFIG.NEWS_BLOCK_BEFORE_MIN * 60;
  const blockAfter = CONFIG.NEWS_BLOCK_AFTER_MIN * 60;

  let events: NewsEvent[];
  try {
    events = await fetchEvents();
  } catch {
    return { blocked: false, reason: '' };
  }

  for (const event of events) {
    const title = event.title || '';
    const impact = (event.impact || '').toLowerCase();
    const eventTime = event.timestamp;

    if (!eventTime || eventTime < now) continue;

    const matchesKeyword = impact === 'high' || HIGH_IMPACT_KEYWORDS.some(kw =>
      title.toLowerCase().includes(kw.toLowerCase())
    );
    if (!matchesKeyword) continue;

    const delta = eventTime - now;
    if (-blockAfter <= delta && delta <= blockBefore) {
      const remaining = Math.ceil(eventTime + blockAfter - now);
      return {
        blocked: true,
        reason: `Blocked by upcoming high-impact news: ${title} — ${Math.ceil(remaining / 60)}min remaining`,
      };
    }
  }

  return { blocked: false, reason: '' };
}
