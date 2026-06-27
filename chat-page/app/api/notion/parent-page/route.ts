import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { pageId } = await req.json();
    if (!pageId) {
      return NextResponse.json({ error: 'pageId is required' }, { status: 400 });
    }

    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      notion: {
        defaultParentPageId: pageId,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update Notion parent page:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
