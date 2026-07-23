import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signalId } = body;

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

    await ref.delete();

    return NextResponse.json({
      success: true,
      message: 'Signal deleted',
    });
  } catch (error) {
    console.error('Error deleting signal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete signal' },
      { status: 500 }
    );
  }
}
