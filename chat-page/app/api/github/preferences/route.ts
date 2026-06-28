import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { visibility } = await req.json();
    
    if (visibility !== 'public' && visibility !== 'private') {
      return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });
    }

    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      github: {
        repoVisibility: visibility,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update GitHub preferences:', err);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
