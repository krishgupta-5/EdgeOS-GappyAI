import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getJiraClient } from '@/lib/jira/client';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const client = await getJiraClient(userId);
    if (!client) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await client.getProjects();
    return NextResponse.json({ projects: projects || [] });
  } catch (err) {
    console.error('Failed to load Jira projects:', err);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}
