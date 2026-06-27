import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, createOrUpdateUser } from "@/lib/firebase-admin";
import { getFullUserData } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

        const lastMsgsSnap = await db
          .collection("sessions")
          .doc(sessionId)
          .collection("messages")
          .get();

        const userMessages = lastMsgsSnap.docs
          .map(d => d.data())
          .filter(d => d.role === "user")
          .sort((a, b) => {
            const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
            const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
            return tb - ta;
          });

        const lastMessage = userMessages[0]?.content ?? null;

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
