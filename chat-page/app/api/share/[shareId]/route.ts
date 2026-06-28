import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
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

    // Process Analytics
    try {
      const isNewUniqueViewer = req.headers.get("cookie")?.includes(`viewed_${shareId}=true`) ? false : true;
      
      const updates: any = {
        views: (shareData.views || 0) + 1,
        lastViewedAt: new Date()
      };

      if (isNewUniqueViewer) {
        updates.uniqueViews = (shareData.uniqueViews || 0) + 1;
      }

      await shareDoc.ref.update(updates);
      
      // Update local copy for immediate return
      Object.assign(shareData, updates);
    } catch (e) {
      console.error("Failed to update analytics:", e);
    }

    // Fetch subcollections concurrently
    let messagesSnapshot, artifactsSnapshot, eventsSnapshot;
    try {
      const msgsPromise = shareDoc.ref.collection("messages").get();
      const artifactsPromise = shareDoc.ref.collection("artifacts").get();
      const eventsPromise = shareDoc.ref.collection("events").orderBy("timestamp", "asc").get();
        
      [messagesSnapshot, artifactsSnapshot, eventsSnapshot] = await Promise.all([msgsPromise, artifactsPromise, eventsPromise]);
    } catch (error) {
      console.error("Failed to fetch subcollections:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

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
      artifacts[data.type] = data;
    });

    messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const timeline = eventsSnapshot.docs.map(doc => doc.data());

    const response = NextResponse.json({ 
      metadata: shareData,
      messages, 
      artifacts, 
      timeline,
      notionUrl: shareData.notionUrl, 
      exportStatus: shareData.exportStatus,
      githubUrl: shareData.githubUrl,
      githubExportStatus: shareData.githubExportStatus,
      jiraUrl: shareData.jiraUrl,
      jiraExportStatus: shareData.jiraExportStatus
    });

    // Set cookie for unique views if it's a new viewer
    const isNewUniqueViewer = req.headers.get("cookie")?.includes(`viewed_${shareId}=true`) ? false : true;
    if (isNewUniqueViewer) {
      response.cookies.set(`viewed_${shareId}`, 'true', {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: `/share/${shareId}`
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to load shared chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
