import { getTrades, calculateStats } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const trades = await getTrades(100);
    const stats = calculateStats(trades);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
