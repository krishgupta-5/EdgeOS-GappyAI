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
      github: FieldValue.delete()
    });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 5) {
      // Document not found - ignore
      return NextResponse.json({ success: true });
    }
    console.error('Failed to disconnect GitHub:', err);
    return NextResponse.json({ error: 'Failed to disconnect GitHub' }, { status: 500 });
  }
}
