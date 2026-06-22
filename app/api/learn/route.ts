import { NextResponse } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = process.env.NEXT_PUBLIC_NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

export async function POST(request: Request) {
  try {
    const { question, conversationHistory = [] } = await request.json();

    const systemPrompt = `You are an experienced forex and gold (XAU/USD) trading educator. 
Your role is to teach traders about:
- Forex market fundamentals
- Gold trading specificities
- Technical analysis for XAU/USD
- Risk management principles
- Trading psychology

Keep explanations clear, educational, and beginner-friendly. Use examples when helpful.
Focus on practical knowledge that can help traders improve.`;

    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: question },
    ];

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Unable to generate response';

    return NextResponse.json({
      success: true,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in learning bot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get learning response' },
      { status: 500 }
    );
  }
}
