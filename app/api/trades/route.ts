import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '100');

    const db = getAdminDb();
    const snapshot = await db
      .collection('trades')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
