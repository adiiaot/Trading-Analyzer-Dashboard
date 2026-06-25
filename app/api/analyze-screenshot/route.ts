import { NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
const VISION_MODEL = 'meta/llama-3.2-11b-vision-instruct';

export async function POST(request: Request) {
  try {
    const { screenshot_base64, question } = await request.json();

    if (!screenshot_base64) {
      return NextResponse.json({ success: false, message: 'No screenshot provided' }, { status: 400 });
    }

    const prompt = question || `Analyze this XAU/USD (Gold) trading chart screenshot and extract:
- Current price and trend direction (UP/DOWN/NEUTRAL)
- Key support and resistance levels
- Any visible candlestick patterns or chart patterns
- RSI or indicator readings if visible
- Volume trend observations
- Trading recommendation based on what you see

Return the analysis in a clear, structured format. Be specific with price levels.`;

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshot_base64}` } },
              { type: 'text', text: prompt },
            ],
          },
        ],
        temperature: 0.3,
        top_p: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze the chart. Please try again with a clearer screenshot.';

    return NextResponse.json({ success: true, analysis, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    return NextResponse.json({ success: false, message: 'Error processing screenshot' }, { status: 500 });
  }
}
