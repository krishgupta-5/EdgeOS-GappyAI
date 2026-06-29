import { db } from '@/lib/firebase-admin';

export async function refreshGoogleToken(userId: string, integration: 'gmail' | 'googleCalendar'): Promise<string | null> {
  const userRef = db.collection('user_integrations').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  if (!userData || !userData[integration] || !userData[integration].refreshToken) {
    return null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Google OAuth environment variables');
    return null;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: userData[integration].refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to refresh token for ${integration}:`, errorText);
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    
    if (newAccessToken) {
      // Update in Firestore
      await userRef.update({
        [`${integration}.accessToken`]: newAccessToken,
        [`${integration}.updatedAt`]: new Date().toISOString(),
      });
      return newAccessToken;
    }
  } catch (error) {
    console.error('Error refreshing Google token:', error);
  }

  return null;
}
