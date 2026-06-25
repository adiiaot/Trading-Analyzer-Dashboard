import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json();

    const { admin } = await import("@/lib/firebase-admin");
    const db = admin.firestore();

    const ref = await db.collection("journal").add({
      ...entry,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: ref.id });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
