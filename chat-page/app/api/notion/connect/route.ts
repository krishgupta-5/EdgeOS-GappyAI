import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response('Notion OAuth is not configured.', { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  
  const response = NextResponse.redirect(
    `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  );
  
  response.cookies.set('notion_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  return response;
}
