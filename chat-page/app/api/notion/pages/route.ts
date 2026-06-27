import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';
import { getNotionClient } from '@/lib/notion/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const snap = await db.collection('user_integrations').doc(userId).get();
    if (!snap.exists) {
      return NextResponse.json({ pages: [] });
    }

    const notionData = snap.data()?.notion;
    if (!notionData?.accessToken) {
      return NextResponse.json({ connected: false });
    }

    const notion = getNotionClient(notionData.accessToken);
    const res = await notion.search({
      filter: { value: 'page', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' }
    });

    const pages = res.results.map((page: any) => {
      let title = 'Untitled';
      if (page.properties) {
        for (const key in page.properties) {
          const prop = page.properties[key];
          if (prop.type === 'title' && prop.title && prop.title.length > 0) {
            title = prop.title.map((t: any) => t.plain_text).join('');
            break;
          }
        }
      }
      return { id: page.id, title, url: page.url };
    });

    return NextResponse.json({ 
      connected: true,
      workspaceName: notionData.workspaceName,
      pages,
      defaultParentPageId: notionData.defaultParentPageId
    });
  } catch (error) {
    console.error('Failed to fetch Notion pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}
