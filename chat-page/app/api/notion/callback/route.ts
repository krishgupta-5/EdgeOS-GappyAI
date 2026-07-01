import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NOTION_REDIRECT_URI ? new URL(process.env.NOTION_REDIRECT_URI).origin : new URL(req.url).origin;

  if (error) {
    return NextResponse.redirect(new URL('/integrations?notion_error=access_denied', appUrl));
  }

  if (!code) {
    return new Response('Code missing', { status: 400 });
  }

  // Get cookies from request using Next.js headers
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/notion_oauth_state=([^;]+)/);
  const cookieState = match ? match[1] : null;

  if (!cookieState || state !== cookieState) {
    return new Response('Invalid state parameter (CSRF)', { status: 400 });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response('Notion OAuth is not configured.', { status: 500 });
  }

  // Exchange code for token
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Notion OAuth token exchange failed:', err);
      return NextResponse.redirect(new URL('/integrations?notion_error=exchange_failed', appUrl));
    }

    const data = await tokenRes.json();

    // Save to Firestore
    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      notion: {
        accessToken: data.access_token,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name,
        botId: data.bot_id,
        ownerId: data.owner?.user?.id || null,
        defaultParentPageId: null, // User needs to select this
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    return NextResponse.redirect(new URL('/integrations', appUrl));
  } catch (err) {
    console.error('Notion callback error:', err);
    return NextResponse.redirect(new URL('/integrations?notion_error=unknown', appUrl));
  }
}