import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { projectPreference } = await req.json();

    if (!projectPreference) {
      return NextResponse.json({ error: 'projectPreference is required' }, { status: 400 });
    }

    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      jira: {
        projectPreference,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to save Jira preferences:', err);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
