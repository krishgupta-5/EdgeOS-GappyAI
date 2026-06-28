import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase-admin";
import crypto from "crypto";

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

    const shareData = shareDoc.data()!;
    if (!shareData.isPublic) {
      return NextResponse.json({ error: "Shared chat not available" }, { status: 404 });
    }

    // 1. Generate new session ID
    const newSessionId = crypto.randomUUID();
    const now = new Date();

    // 2. Create the new session root document
    const newSessionData = {
      userId,
      title: shareData.title,
      createdAt: now,
      updatedAt: now,
      forkedFromShareId: shareId,
      forkedFromOwner: shareData.ownerName,
      forkedAt: now,
      // Only keep basic UI states from original if any, clear integrations and export statuses
      exportStatus: null,
      githubUrl: null,
      githubExportStatus: null,
      jiraUrl: null,
      jiraExportStatus: null,
      notionUrl: null,
    };

    const newSessionRef = db.collection("sessions").doc(newSessionId);

    // 3. Copy subcollections
    const collectionsToCopy = ["messages", "artifacts", "events"];
    const ops = [];

    // Add root session creation to ops
    ops.push({ type: 'set', ref: newSessionRef, data: newSessionData });

    for (const col of collectionsToCopy) {
      const sourceDocs = await shareDoc.ref.collection(col).get();
      sourceDocs.docs.forEach(doc => {
        const targetRef = newSessionRef.collection(col).doc(doc.id);
        const docData = doc.data();
        
        // Ensure timestamp is copied correctly if it exists, otherwise leave alone
        // For messages, make sure export statuses are cleared
        if (col === 'messages') {
          docData.exportStatus = null;
          docData.githubExportStatus = null;
          docData.jiraExportStatus = null;
        }

        ops.push({ type: 'set', ref: targetRef, data: docData });
      });
    }

    // Update fork analytics on shared chat
    ops.push({ 
      type: 'update', 
      ref: shareDoc.ref, 
      data: { forks: (shareData.forks || 0) + 1, lastForkedAt: now } 
    });

    // Process in chunks of 450
    for (let i = 0; i < ops.length; i += 450) {
      const chunk = ops.slice(i, i + 450);
      const chunkBatch = db.batch();
      for (const op of chunk) {
        if (op.type === 'set') chunkBatch.set(op.ref, op.data);
        else if (op.type === 'update') chunkBatch.update(op.ref, op.data);
      }
      await chunkBatch.commit();
    }

    return NextResponse.json({ newSessionId });
  } catch (error) {
    console.error("Failed to fork share:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
