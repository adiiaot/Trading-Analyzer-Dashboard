import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const predictionCache = new Map<string, { result: any; expiresAt: number }>();

const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || '';
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

function keywordFallback(title: string, impact: string): { direction: string; confidence: number; explanation: string } {
  const t = title.toLowerCase();
  const isHigh = impact === 'high';

  if (t.includes('nfp') || t.includes('non farm') || t.includes('employment')) {
    return { direction: 'bearish', confidence: 55, explanation: 'Strong labor data typically strengthens USD, pressuring gold' };
  }
  if (t.includes('cpi') || t.includes('core pce') || t.includes('ppi') || t.includes('inflation')) {
    return { direction: 'bearish', confidence: 50, explanation: 'Higher inflation may trigger hawkish Fed response, bearish for gold short-term' };
  }
  if (t.includes('fed') || t.includes('fomc') || t.includes('interest rate') || t.includes('powell')) {
    return { direction: 'neutral', confidence: 45, explanation: 'Fed guidance is key — market reaction depends on tone and data dependency' };
  }
  if (t.includes('gdp') || t.includes('retail sales')) {
    return { direction: 'bearish', confidence: 40, explanation: 'Strong economic data supports USD and higher yields, bearish gold' };
  }
  if (t.includes('unemployment') || t.includes('claims') || t.includes('jobless')) {
    return { direction: 'bullish', confidence: 40, explanation: 'Weaker labor data raises rate cut hopes, bullish for gold' };
  }
  if (isHigh) {
    return { direction: 'neutral', confidence: 35, explanation: 'High-impact event with potential for significant gold movement' };
  }
  return { direction: 'neutral', confidence: 20, explanation: 'Limited direct impact on gold expected' };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, impact, forecast, previous } = body;
    const cacheKey = `${title}|${impact}|${forecast}`;

    const cached = predictionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ success: true, prediction: cached.result });
    }

    const fallback = keywordFallback(title || '', impact || '');

    if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'YOUR_NVIDIA_NIM_API_KEY') {
      return NextResponse.json({ success: true, prediction: fallback });
    }

    const prompt = `You are a gold market analyst. Predict how this economic event will affect XAU/USD gold price.

Event: ${title || 'Unknown'}
Impact: ${impact || 'medium'}${forecast ? `\nForecast: ${forecast}` : ''}${previous ? `\nPrevious: ${previous}` : ''}

Respond with ONLY valid JSON in this exact format:
{
  "direction": "bullish" | "bearish" | "neutral",
  "confidence": <number 0-100>,
  "explanation": "<brief reason, max 20 words>"
}`;

    try {
      const response = await fetch(NVIDIA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 150,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return NextResponse.json({ success: true, prediction: fallback });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      try {
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
        const prediction = {
          direction: ['bullish', 'bearish', 'neutral'].includes(parsed.direction) ? parsed.direction : 'neutral',
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
          explanation: String(parsed.explanation || '').slice(0, 100),
        };
        predictionCache.set(cacheKey, { result: prediction, expiresAt: Date.now() + 3600000 });
        return NextResponse.json({ success: true, prediction });
      } catch {
        return NextResponse.json({ success: true, prediction: fallback });
      }
    } catch {
      return NextResponse.json({ success: true, prediction: fallback });
    }
  } catch (error) {
    console.error('Econ predict error:', error);
    return NextResponse.json(
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    );
  }
}
