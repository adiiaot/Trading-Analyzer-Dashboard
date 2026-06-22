import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { screenshot_base64 } = await request.json();

    if (!screenshot_base64) {
      return NextResponse.json(
        { success: false, message: 'No screenshot provided' },
        { status: 400 }
      );
    }

    const botApiUrl = process.env.NEXT_PUBLIC_BOT_API_URL;
    const response = await fetch(`${botApiUrl}/api/analyze-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenshot_base64 }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing screenshot' },
      { status: 500 }
    );
  }
}
