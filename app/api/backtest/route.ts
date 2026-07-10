import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_API = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = searchParams.get('months') || '12';
    const sessionFilter = searchParams.get('sessionFilter') || 'false';
    const mc = searchParams.get('mc') || 'false';

    const res = await fetch(
      `${BOT_API}/api/backtest?months=${months}&sessionFilter=${sessionFilter}&mc=${mc}`,
      { signal: AbortSignal.timeout(120_000) }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: `Bot returned ${res.status}: ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Backtest proxy error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Backend unreachable' },
      { status: 503 }
    );
  }
}
