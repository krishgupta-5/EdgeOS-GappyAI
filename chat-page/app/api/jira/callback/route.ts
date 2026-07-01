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

  const appUrl = process.env.JIRA_REDIRECT_URI ? new URL(process.env.JIRA_REDIRECT_URI).origin : new URL(req.url).origin;

  if (error) {
    return NextResponse.redirect(new URL('/integrations?jira_error=access_denied', appUrl));
  }

  if (!code) {
    return new Response('Code missing', { status: 400 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/jira_oauth_state=([^;]+)/);
  const cookieState = match ? match[1] : null;

  if (!cookieState || state !== cookieState) {
    return new Response('Invalid state parameter (CSRF)', { status: 400 });
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;
  const redirectUri = process.env.JIRA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response('Jira OAuth is not configured.', { status: 500 });
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('Jira token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(new URL('/integrations?jira_error=exchange_failed', appUrl));
    }

    const data = await tokenRes.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    if (!accessToken) {
      console.error('Jira token exchange returned no access token:', data);
      return NextResponse.redirect(new URL('/integrations?jira_error=no_token', appUrl));
    }

    // Get accessible resources to find the cloudId (Site ID)
    const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    });

    if (!resourcesRes.ok) {
      console.error('Jira resources fetch failed:', await resourcesRes.text());
      return NextResponse.redirect(new URL('/integrations?jira_error=resources_fetch_failed', appUrl));
    }

    const resources = await resourcesRes.json();

    if (!resources || resources.length === 0) {
      console.error('No accessible Jira resources found.');
      return NextResponse.redirect(new URL('/integrations?jira_error=no_resources', appUrl));
    }

    // Default to the first jira resource
    const jiraResource = resources.find((r: any) => r.scopes.includes('read:jira-work')) || resources[0];
    const cloudId = jiraResource.id;
    const workspaceName = jiraResource.name;
    const url = jiraResource.url;

    // Get user info (optional, but good for display)
    const userRes = await fetch('https://api.atlassian.com/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    });

    let accountName = '';
    if (userRes.ok) {
      const userData = await userRes.json();
      accountName = userData.name || userData.email || '';
    }

    // Save to Firestore
    const ref = db.collection('user_integrations').doc(userId);
    await ref.set({
      jira: {
        accessToken,
        refreshToken,
        expiresAt,
        cloudId,
        workspaceName,
        url,
        accountName,
        connectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectPreference: 'CREATE_NEW' // Default to creating new project
      }
    }, { merge: true });

    return NextResponse.redirect(new URL('/integrations', appUrl));
  } catch (err) {
    console.error('Jira callback error:', err);
    return NextResponse.redirect(new URL('/integrations?jira_error=unknown', appUrl));
  }
}