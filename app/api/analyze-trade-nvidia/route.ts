import { NextResponse } from 'next/server';

const NVIDIA_API_URL = process.env.NEXT_PUBLIC_NVIDIA_NIM_API_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
const MODEL = 'meta/llama-3.3-70b-instruct';

export async function POST(request: Request) {
  try {
    const { trade, signal } = await request.json();

    const prompt = `Analyze this XAU/USD trading result and provide strategic insights:

Trade Details:
- Entry Price: $${trade.entry_price}
- Exit Price: $${trade.exit_price}
- P&L: $${trade.pnl} (${trade.pnl_percent.toFixed(2)}%)
- Result: ${trade.result === 'win' ? 'WIN ✅' : 'LOSS ❌'}
- Hold Time: ${trade.hold_time_seconds || 'N/A'} seconds
- Signal Trend: ${signal?.trend || 'Unknown'}

Please provide:
1. Why did this trade result this way?
2. What worked well or what went wrong?
3. Specific improvements for the bot's signal generation
4. Risk management observations

Keep analysis concise and actionable (2-3 paragraphs max).`;

    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze';

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze trade' },
      { status: 500 }
    );
  }
}
