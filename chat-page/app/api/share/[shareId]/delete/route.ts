import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { shareId } = await params;
    if (!shareId) {
      return NextResponse.json({ error: "shareId is required" }, { status: 400 });
    }

    const shareDoc = await db.collection("shared_chats").doc(shareId).get();
    
    if (!shareDoc.exists) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const data = shareDoc.data()!;
    if (data.ownerUserId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    const batch = db.batch();

    // Mark share as not public
    batch.update(shareDoc.ref, { isPublic: false, updatedAt: new Date() });

    // Mark original session as not shared
    if (data.sessionId) {
      const sessionRef = db.collection("sessions").doc(data.sessionId);
      batch.update(sessionRef, { isShared: false, shareId: null });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete share:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
