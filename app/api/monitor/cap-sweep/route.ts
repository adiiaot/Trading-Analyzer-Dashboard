import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const botUrl = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:8000';
    const res = await fetch(`${botUrl}/api/monitor/run-cap-sweep`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running cap sweep:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to run cap sweep. Is the bot running?' },
      { status: 500 },
    );
  }
}
