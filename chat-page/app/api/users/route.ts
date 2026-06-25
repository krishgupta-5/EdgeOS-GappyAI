import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrUpdateUser, getUser } from "@/lib/firebase-admin";
import { getFullUserData } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userData } = body;

    // Get comprehensive user data from Clerk and merge with provided data
    const clerkUserData = await getFullUserData();
    const mergedUserData = { ...clerkUserData, ...userData };

    // Create or update user in Firebase with comprehensive data
    const userRef = await createOrUpdateUser(userId, mergedUserData);

    // Return the created/updated user data
    const user = await getUser(userId);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to create/update user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user data from Firebase
    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
