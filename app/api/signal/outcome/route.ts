import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signalId, outcome } = body;

    if (!signalId || !outcome || !['won', 'lost'].includes(outcome)) {
      return NextResponse.json(
        { success: false, error: 'signalId and outcome ("won" | "lost") required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const ref = db.collection('signals').doc(signalId);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      );
    }

    await ref.update({ outcome, status: outcome === 'won' ? 'closed' : 'closed' });

    return NextResponse.json({
      success: true,
      message: `Signal marked as ${outcome.toUpperCase()}`,
    });
  } catch (error) {
    console.error('Error updating signal outcome:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update signal outcome' },
      { status: 500 }
    );
  }
}
