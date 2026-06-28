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

  if (error) {
    return NextResponse.redirect(new URL('/settings?github_error=access_denied', req.url));
  }

  if (!code) {
    return new Response('Code missing', { status: 400 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/github_oauth_state=([^;]+)/);
  const cookieState = match ? match[1] : null;

  if (!cookieState || state !== cookieState) {
    return new Response('Invalid state parameter (CSRF)', { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response('GitHub OAuth is not configured.', { status: 500 });
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('GitHub token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(new URL('/settings?github_error=exchange_failed', req.url));
    }

    const data = await tokenRes.json();
    const accessToken = data.access_token;
    
    if (!accessToken) {
      console.error('GitHub token exchange returned no access token:', data);
      return NextResponse.redirect(new URL('/settings?github_error=no_token', req.url));
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!userRes.ok) {
      console.error('GitHub user fetch failed:', await userRes.text());
      return NextResponse.redirect(new URL('/settings?github_error=user_fetch_failed', req.url));
    }

    const userData = await userRes.json();

    // Save to Firestore
    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      github: {
        accessToken,
        username: userData.login,
        avatarUrl: userData.avatar_url,
        repoVisibility: 'private', // Default
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    return NextResponse.redirect(new URL('/settings', req.url));
  } catch (err) {
    console.error('GitHub callback error:', err);
    return NextResponse.redirect(new URL('/settings?github_error=unknown', req.url));
  }
}
