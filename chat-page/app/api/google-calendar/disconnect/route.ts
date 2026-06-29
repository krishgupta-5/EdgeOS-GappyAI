import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.collection('user_integrations').doc(userId).update({
      googleCalendar: FieldValue.delete()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Google Calendar disconnect error:', err);
    return NextResponse.json({ error: 'Failed to disconnect Google Calendar.' }, { status: 500 });
  }
}
