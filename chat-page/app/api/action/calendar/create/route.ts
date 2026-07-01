import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const { sessionId, meetingPreview, messageId } = body;

    if (!sessionId || !meetingPreview || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = db.collection('user_integrations').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const calendarData = userData?.googleCalendar;
    if (!calendarData?.accessToken) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 });
    }

    const startTime = new Date(`${meetingPreview.date}T${meetingPreview.time}:00`);
    const endTime = new Date(startTime.getTime() + meetingPreview.duration * 60000);

    const eventPayload = {
      summary: meetingPreview.title,
      description: `Agenda:\n${meetingPreview.agenda}\n\nDescription:\n${meetingPreview.description}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meetingPreview.guests.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `prodmate-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    let res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${calendarData.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (res.status === 401) {
      console.log('Calendar token expired, attempting refresh...');
      const { refreshGoogleToken } = await import('@/lib/google/refreshToken');
      const newToken = await refreshGoogleToken(userId, 'googleCalendar');
      if (newToken) {
        res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Calendar API error:', errorText);
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }

    const data = await res.json();
    
    // Update the message in Firestore to mark as scheduled
    const messageRef = db.collection('sessions').doc(sessionId).collection('messages').doc(messageId);
    await messageRef.update({
      meetingPreview: {
        ...meetingPreview,
        status: 'scheduled',
        scheduledAt: new Date().toISOString(),
        meetLink: data.hangoutLink,
        eventId: data.id
      }
    });

    return NextResponse.json({ success: true, eventId: data.id, meetLink: data.hangoutLink });
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
