import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signalId, confirm } = body;

    if (!signalId) {
      return NextResponse.json(
        { success: false, error: 'signalId required' },
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

    await ref.update({ confirmed: confirm !== false });

    return NextResponse.json({
      success: true,
      message: confirm !== false ? 'Signal confirmed — tracking started' : 'Signal unconfirmed',
    });
  } catch (error) {
    console.error('Error confirming signal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm signal' },
      { status: 500 }
    );
  }
}
