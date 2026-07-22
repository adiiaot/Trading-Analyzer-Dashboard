import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signalId, outcome, mt5EntryPrice, mt5ExitPrice } = body;

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

    const updateData: Record<string, any> = { outcome, status: 'closed' };
    if (mt5EntryPrice !== undefined) updateData.mt5EntryPrice = mt5EntryPrice;
    if (mt5ExitPrice !== undefined) updateData.mt5ExitPrice = mt5ExitPrice;
    await ref.update(updateData);

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
