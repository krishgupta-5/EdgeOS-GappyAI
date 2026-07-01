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

  const appUrl = process.env.GOOGLE_GMAIL_REDIRECT_URI ? new URL(process.env.GOOGLE_GMAIL_REDIRECT_URI).origin : new URL(req.url).origin;

  if (error) {
    return NextResponse.redirect(new URL('/integrations?gmail_error=access_denied', appUrl));
  }

  if (!code) {
    return new Response('Code missing', { status: 400 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/gmail_oauth_state=([^;]+)/);
  const cookieState = match ? match[1] : null;

  if (!cookieState || state !== cookieState) {
    return new Response('Invalid state parameter (CSRF)', { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_GMAIL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response('Gmail OAuth is not configured.', { status: 500 });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error('Gmail token exchange error:', errData);
      return NextResponse.redirect(new URL('/integrations?gmail_error=token_exchange_failed', appUrl));
    }

    const tokenData = await tokenRes.json();

    // Fetch user email
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    let email = '';
    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json();
      email = userInfo.email;
    }

    await db.collection('user_integrations').doc(userId).set({
      gmail: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        email,
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }, { merge: true });

    const response = NextResponse.redirect(new URL('/integrations?success=true', appUrl));

    // Clear state cookie
    response.cookies.set('gmail_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Gmail OAuth callback error:', err);
    return NextResponse.redirect(new URL('/integrations?gmail_error=internal_error', appUrl));
  }
}