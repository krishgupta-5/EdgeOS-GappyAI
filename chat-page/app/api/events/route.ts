import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('sessionId required', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = db
        .collection('sessions')
        .doc(sessionId)
        .collection('events')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          });
        }, (error) => {
          console.error('Firestore events snapshot error:', error);
          controller.error(error);
        });

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
