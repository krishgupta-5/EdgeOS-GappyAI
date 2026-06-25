import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, createOrUpdateUser } from "@/lib/firebase-admin";
import { getFullUserData } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fire-and-forget — don't block the response on user sync
    getFullUserData()
      .then((fullUserData) => createOrUpdateUser(userId, fullUserData))
      .catch(console.error);

    // Fetch all sessions for this user
    let sessionsSnapshot;
    try {
      sessionsSnapshot = await db
        .collection("sessions")
        .where("userId", "==", userId)
        .get();
    } catch (error) {
      console.error("Failed to fetch sessions from Firestore:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Run all per-session queries concurrently (1 doc each, not whole subcollections)
    const sessions = await Promise.all(
      sessionsSnapshot.docs.map(async (doc) => {
        const sessionId = doc.id;
        const sessionData = doc.data();

        // If we already have a stored title, skip the messages query entirely
        if (sessionData.title) {
          return {
            sessionId,
            updatedAt: sessionData.updatedAt?.toDate() || new Date(),
            messageCount: sessionData.messageCount ?? 0,
            lastMessage: sessionData.title,
          };
        }

        // Only fetch the single most-recent user message (1 doc, not the whole collection)
        const lastUserMsgSnap = await db
          .collection("sessions")
          .doc(sessionId)
          .collection("messages")
          .where("role", "==", "user")
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        const lastMessage = lastUserMsgSnap.docs[0]?.data()?.content ?? null;

        return {
          sessionId,
          updatedAt: sessionData.updatedAt?.toDate() || new Date(),
          messageCount: sessionData.messageCount ?? 0,
          lastMessage,
        };
      })
    );

    // Sort by most recent first
    sessions.sort((a, b) => {
      const dateA =
        a.updatedAt instanceof Date
          ? a.updatedAt.getTime()
          : new Date(a.updatedAt).getTime();
      const dateB =
        b.updatedAt instanceof Date
          ? b.updatedAt.getTime()
          : new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to load user sessions:", error);
    return NextResponse.json(
      { error: "Failed to load user sessions" },
      { status: 500 }
    );
  }
}
