import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Verify ownership
    const sessionDoc = await db.collection("sessions").doc(sessionId).get();
    if (!sessionDoc.exists || sessionDoc.data()?.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    const sessionData = sessionDoc.data() || {};
    const title = sessionData.title || "Untitled Project";
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if a share already exists for this session
    const existingShareQuery = await db.collection("shared_chats")
      .where("sessionId", "==", sessionId)
      .limit(1)
      .get();

    let shareId = "";
    const isExisting = !existingShareQuery.empty;

    if (isExisting) {
      shareId = existingShareQuery.docs[0].id;
    } else {
      shareId = crypto.randomUUID().split("-")[0]; // Short UUID
    }

    const shareRef = db.collection("shared_chats").doc(shareId);
    
    const ownerName = user.firstName 
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` 
      : (user.primaryEmailAddress?.emailAddress || "Anonymous");

    const now = new Date();

    // Prepare metadata
    const metadata = {
      shareId,
      sessionId,
      ownerUserId: userId,
      ownerName,
      title,
      slug,
      isPublic: true,
      githubUrl: sessionData.githubUrl || null,
      notionUrl: sessionData.notionUrl || null,
      jiraUrl: sessionData.jiraUrl || null,
      updatedAt: now,
    };

    if (isExisting) {
      // Update existing metadata
      await shareRef.update(metadata);
    } else {
      // Create new metadata
      await shareRef.set({
        ...metadata,
        createdAt: now,
        lastViewedAt: now,
        lastForkedAt: null,
        views: 0,
        uniqueViews: 0,
        forks: 0,
      });
    }

    // Copy collections (messages, artifacts, events)
    const collectionsToCopy = ["messages", "artifacts", "events"];
    const batch = db.batch();
    
    // Since batches have a 500 operation limit, we'll execute chunked batches for subcollections
    // First, let's collect all deletes and sets
    const ops = [];

    for (const col of collectionsToCopy) {
      // Clear existing subcollection in share if updating
      if (isExisting) {
        const existingDocs = await shareRef.collection(col).get();
        existingDocs.docs.forEach(doc => {
          ops.push({ type: 'delete', ref: doc.ref });
        });
      }

      // Read original
      const sourceDocs = await db.collection("sessions").doc(sessionId).collection(col).get();
      sourceDocs.docs.forEach(doc => {
        const targetRef = shareRef.collection(col).doc(doc.id);
        ops.push({ type: 'set', ref: targetRef, data: doc.data() });
      });
    }
    
    // Also mark the original session as shared
    ops.push({ type: 'update', ref: sessionDoc.ref, data: { isShared: true, shareId } });

    // Process in chunks of 450 to be safe
    for (let i = 0; i < ops.length; i += 450) {
      const chunk = ops.slice(i, i + 450);
      const chunkBatch = db.batch();
      for (const op of chunk) {
        if (op.type === 'delete') chunkBatch.delete(op.ref);
        else if (op.type === 'set') chunkBatch.set(op.ref, op.data);
        else if (op.type === 'update') chunkBatch.update(op.ref, op.data);
      }
      await chunkBatch.commit();
    }

    return NextResponse.json({
      shareId,
      slug,
      shareUrl: `/share/${shareId}/${slug}`
    });

  } catch (error) {
    console.error("Failed to share chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
