import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const doc = await db.collection('user_integrations').doc(userId).get();
    const data = doc.data() || {};
    
    return NextResponse.json({
      notion: data.notion || null,
      github: data.github || null,
      jira: data.jira || null,
    });
  } catch (err) {
    console.error('Failed to load integrations:', err);
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 500 });
  }
}
