import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || "mqxzfnc3eggm9rdhr";

  if (!sessionId) return NextResponse.json({ error: "missing" });

  const artifactsSnapshot = await db.collection("sessions").doc(sessionId).collection("artifacts").get();
  const artifacts: Record<string, any> = {};
  artifactsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    artifacts[data.type] = {
      contentLength: data.content ? data.content.length : "MISSING",
    };
  });

  return NextResponse.json({ artifacts });
}
