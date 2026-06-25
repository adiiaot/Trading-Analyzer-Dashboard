import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '50');

    const db = getAdminDb();
    const snapshot = await db
      .collection('signals')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, signals });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}
