import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class JiraClient {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;
  private cloudId: string;
  private userId: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(userId: string, accessToken: string, refreshToken: string, expiresAt: number, cloudId: string) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt || 0;
    this.cloudId = cloudId;
    console.log(`[JIRA] Token loaded`);
    console.log(`[JIRA] Cloud ID: ${cloudId}`);
  }

  private async getValidToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.expiresAt && Date.now() < this.expiresAt - 300000) {
      console.log(`[JIRA AUTH] Token Valid`);
      return this.accessToken;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      console.log(`[JIRA AUTH] Refreshing Token`);
      try {
        const clientId = process.env.JIRA_CLIENT_ID;
        const clientSecret = process.env.JIRA_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          console.log(`[JIRA AUTH] Refresh Failed`);
          throw new Error("Missing JIRA_CLIENT_ID or JIRA_CLIENT_SECRET");
        }

        const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: this.refreshToken,
          }),
        });

        if (!tokenRes.ok) {
          console.log(`[JIRA AUTH] Refresh Failed`);
          const data = await tokenRes.json().catch(() => ({}));
          const error = data.error || data.error_description || '';
          
          if (error === 'invalid_grant' || error === 'invalid_refresh_token' || tokenRes.status === 400 || tokenRes.status === 401) {
            console.log(`[JIRA AUTH] Disconnected`);
            await db.collection('user_integrations').doc(this.userId).update({
              'jira.accessToken': FieldValue.delete(),
              'jira.refreshToken': FieldValue.delete(),
              'jira.expiresAt': FieldValue.delete(),
              'jira.status': 'disconnected'
            });
            throw new Error(`Authentication error: ${error || tokenRes.statusText}`);
          }
          throw new Error(`Jira token refresh failed: ${tokenRes.status}`);
        }

        const data = await tokenRes.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        const expiresIn = data.expires_in || 3600;
        this.expiresAt = Date.now() + expiresIn * 1000;

        await db.collection('user_integrations').doc(this.userId).set({
          jira: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
            updatedAt: new Date().toISOString()
          }
        }, { merge: true });

        console.log(`[JIRA AUTH] Refresh Success`);
        return this.accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async request(method: string, endpoint: string, body?: any, retry = true): Promise<any> {
    let token = await this.getValidToken();
    const baseUrl = `https://api.atlassian.com/ex/jira/${this.cloudId}`;
    const apiPath = `/rest/api/3${endpoint}`;
    
    let res = await fetch(`${baseUrl}${apiPath}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && retry) {
      token = await this.getValidToken(true);
      res = await fetch(`${baseUrl}${apiPath}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`Jira API error ${method} ${apiPath}:`, text);
      throw new Error(`Jira API error: ${res.status} ${res.statusText}`);
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  }

  async getProjects() {
    return this.request('GET', '/project');
  }

  async createProject(name: string, key: string, leadAccountId: string) {
    return this.request('POST', '/project', {
      key,
      name,
      projectTypeKey: 'software',
      projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-scrum-classic',
      description: 'Project generated by ProdMate',
      leadAccountId,
    });
  }



  async searchIssues(jql: string) {
    return this.request('GET', `/search?jql=${encodeURIComponent(jql)}`);
  }

  async createIssue(projectKey: string, summary: string, description: string, issueTypeName: string = 'Story') {
    return this.request('POST', '/issue', {
      fields: {
        project: { key: projectKey },
        summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: description.substring(0, 30000) }
              ]
            }
          ]
        },
        issuetype: { name: issueTypeName },
      }
    });
  }

  async updateIssue(issueIdOrKey: string, summary: string, description: string) {
    return this.request('PUT', `/issue/${issueIdOrKey}`, {
      fields: {
        summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: description.substring(0, 30000) }
              ]
            }
          ]
        },
      }
    });
  }

  async getCurrentUser() {
    return this.request('GET', '/myself');
  }
}

export async function getJiraClient(userId: string): Promise<JiraClient | null> {
  const doc = await db.collection('user_integrations').doc(userId).get();
  const data = doc.data();
  if (!data || !data.jira || !data.jira.accessToken) return null;
  return new JiraClient(userId, data.jira.accessToken, data.jira.refreshToken, data.jira.expiresAt, data.jira.cloudId);
}
