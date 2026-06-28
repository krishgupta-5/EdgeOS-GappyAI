import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response('Jira OAuth is not configured.', { status: 500 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  
  // Jira OAuth scopes
  const scopes = 'offline_access read:jira-work write:jira-work manage:jira-project read:jira-user';
  
  const audience = 'api.atlassian.com';
  const responseType = 'code';
  const prompt = 'consent';

  const authUrl = `https://auth.atlassian.com/authorize?audience=${audience}&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=${responseType}&prompt=${prompt}`;

  const response = NextResponse.redirect(authUrl);
  
  response.cookies.set('jira_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  return response;
}
