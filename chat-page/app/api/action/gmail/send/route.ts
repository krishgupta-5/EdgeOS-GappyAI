import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const { sessionId, emailPreview, messageId } = body;

    if (!sessionId || !emailPreview || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = db.collection('user_integrations').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const gmailData = userData?.gmail;
    if (!gmailData?.accessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 401 });
    }

    // Gmail API requires RFC 2822 formatted message encoded in base64url
    const rawMessage = [
      `To: ${emailPreview.recipient}`,
      `Subject: ${emailPreview.subject}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      '',
      emailPreview.body
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    let res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gmailData.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (res.status === 401) {
      console.log('Gmail token expired, attempting refresh...');
      const { refreshGoogleToken } = await import('@/lib/google/refreshToken');
      const newToken = await refreshGoogleToken(userId, 'gmail');
      if (newToken) {
        res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: encodedMessage
          })
        });
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Gmail API error:', errorText);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    const data = await res.json();
    
    // Update the message in Firestore to mark as sent
    const messageRef = db.collection('sessions').doc(sessionId).collection('messages').doc(messageId);
    await messageRef.update({
      emailPreview: {
        ...emailPreview,
        status: 'sent',
        sentAt: new Date().toISOString()
      }
    });
    
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Gmail send error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
