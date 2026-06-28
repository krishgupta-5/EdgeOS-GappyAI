import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const ref = db.collection('user_integrations').doc(userId);
    await ref.update({
      jira: FieldValue.delete()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Jira disconnect error:', err);
    return NextResponse.json({ error: 'Failed to disconnect Jira' }, { status: 500 });
  }
}
