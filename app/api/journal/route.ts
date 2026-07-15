import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('journal')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notes, sentiment = 'neutral', relatedTradeId } = body;

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notes are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const entryId = `journal_${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;

    const entryData = {
      userId: 'dashboard',
      timestamp: FieldValue.serverTimestamp(),
      source: 'dashboard',
      notes: notes.trim(),
      sentiment,
      analysis: {
        theme: '',
        actionItems: [],
        relatedSignals: [],
      },
      relatedTradeId: relatedTradeId || null,
    };

    const db = getAdminDb();
    await db.collection('journal').doc(entryId).set(entryData);

    return NextResponse.json({ success: true, id: entryId, message: 'Journal entry saved' });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save journal entry' },
      { status: 500 }
    );
  }
}
