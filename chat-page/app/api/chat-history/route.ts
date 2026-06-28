import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get sessionId from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    // Get messages, artifacts, and session document from Firestore concurrently
    let messagesSnapshot, artifactsSnapshot, sessionSnapshot;
    try {
      const msgsPromise = db
        .collection("sessions")
        .doc(sessionId)
        .collection("messages")
        .get();
        
      const artifactsPromise = db
        .collection("sessions")
        .doc(sessionId)
        .collection("artifacts")
        .get();
        
      const sessionPromise = db
        .collection("sessions")
        .doc(sessionId)
        .get();
        
      [messagesSnapshot, artifactsSnapshot, sessionSnapshot] = await Promise.all([msgsPromise, artifactsPromise, sessionPromise]);
    } catch (error) {
      console.error("Failed to fetch data from Firestore:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Convert to array and sort by createdAt in JavaScript
    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
      };
    });

    const artifacts: Record<string, any> = {};
    artifactsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Omit id since it's just the type
      artifacts[data.type] = data;
    });

    // Sort by createdAt ascending (oldest first)
    messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    
    const sessionData = sessionSnapshot.exists ? sessionSnapshot.data() : {};

    return NextResponse.json({ messages, artifacts, notionUrl: sessionData?.notionUrl, exportStatus: sessionData?.exportStatus });
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get sessionId from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const clearAll = searchParams.get("clearAll");

    // If clearAll is true, delete all sessions for the user
    if (clearAll === "true") {
      try {
        // Get all sessions for the user
        const sessionsSnapshot = await db
          .collection("sessions")
          .where("userId", "==", userId)
          .get();

        // Delete all messages and entire session documents
        const deletePromises: Promise<any>[] = [];

        for (const sessionDoc of sessionsSnapshot.docs) {
          // First, delete all messages in this session
          const messagesSnapshot = await db
            .collection("sessions")
            .doc(sessionDoc.id)
            .collection("messages")
            .get();

          // Add delete promises for all messages in this session
          messagesSnapshot.docs.forEach((doc) => {
            deletePromises.push(
              db
                .collection("sessions")
                .doc(sessionDoc.id)
                .collection("messages")
                .doc(doc.id)
                .delete(),
            );
          });

          // Then delete the entire session document
          deletePromises.push(
            db.collection("sessions").doc(sessionDoc.id).delete(),
          );
        }

        await Promise.all(deletePromises);

        return NextResponse.json({
          success: true,
          message: `Completely deleted ${sessionsSnapshot.size} sessions and all their messages`,
        });
      } catch (error) {
        console.error("Failed to delete all sessions from Firestore:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    // Clear specific session
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required when clearAll is false" },
        { status: 400 },
      );
    }

    // Delete all messages in the session
    try {
      const messagesSnapshot = await db
        .collection("sessions")
        .doc(sessionId)
        .collection("messages")
        .get();

      // Delete all messages in the collection
      const deletePromises = messagesSnapshot.docs.map((doc) =>
        db
          .collection("sessions")
          .doc(sessionId)
          .collection("messages")
          .doc(doc.id)
          .delete(),
      );

      await Promise.all(deletePromises);

      return NextResponse.json({
        success: true,
        message: "Chat history cleared successfully",
      });
    } catch (error) {
      console.error("Failed to delete messages from Firestore:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to clear chat history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 },
    );
  }
}
